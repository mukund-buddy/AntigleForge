/* Bedrock World Editor — application logic (no backend, no network) */
(function () {
  'use strict';

  var NBT = window.NBT;
  var MCW = window.MCWorld;
  var T = NBT.T;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var S = {
    doc: null,
    tab: 'world',
    file: null,
    nbtDoc: null,
    expanded: new Set(),
    expandAll: false,
    dirty: false,
    fileFilter: ''
  };

  /* ------------------------------------------------------------- utilities */

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'class') node.className = attrs[k];
        else if (k === 'text') node.textContent = attrs[k];
        else if (k === 'html') node.innerHTML = attrs[k];
        else if (k.slice(0, 2) === 'on') node.addEventListener(k.slice(2), attrs[k]);
        else if (attrs[k] != null && attrs[k] !== false) node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) {
      if (c == null) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  function bytes(n) {
    if (n < 1024) return n + ' B';
    if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
    return (n / 1048576).toFixed(2) + ' MB';
  }

  function toast(msg, kind) {
    var wrap = $('#mcToasts');
    var t = el('div', { class: 'mc-toast ' + (kind || '') , text: msg });
    wrap.appendChild(t);
    setTimeout(function () {
      t.style.opacity = '0';
      setTimeout(function () { t.remove(); }, 220);
    }, 3600);
  }

  function markDirty() {
    S.dirty = true;
    var badge = $('#mcDirty');
    if (badge) badge.classList.remove('mc-hidden');
  }

  function download(data, filename, mime) {
    var blob = data instanceof Blob ? data : new Blob([data], { type: mime || 'application/octet-stream' });
    var url = URL.createObjectURL(blob);
    var a = el('a', { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  function readFileBytes(file) {
    return file.arrayBuffer().then(function (buf) { return new Uint8Array(buf); });
  }

  function isTextPath(path) {
    return /\.(txt|json|jsonc|mcfunction|lang|properties|xml|yml|yaml|md|csv|log|ini|cfg|nbt\.txt)$/i.test(path) ||
      /(^|\/)(manifest\.json|levelname\.txt|world_behavior_packs\.json|world_resource_packs\.json)$/i.test(path);
  }

  function isImagePath(path) {
    return /\.(png|jpe?g|gif|webp|bmp)$/i.test(path);
  }

  function isNbtPath(path) {
    return /\.(dat|dat_old|old_dat|nbt|mcstructure|litematic|schematic|schem)$/i.test(path);
  }

  /* ------------------------------------------------------------- open files */

  function openWorldArchive(bytes, name) {
    MCW.openArchive(bytes, name).then(function (world) {
      var doc = {
        kind: 'world',
        world: world,
        level: world.level,
        fileName: world.fileName(),
        sourceName: name
      };
      setDoc(doc);
      if (!world.level) {
        toast('Opened archive, but level.dat could not be read: ' + (world.levelError || 'missing'), 'error');
      } else {
        toast('World opened — ' + world.entries.size + ' files inside.', 'success');
      }
    }).catch(function (err) {
      toast(err.message || 'Could not open that archive.', 'error');
    });
  }

  function openNbtFile(bytes, name) {
    var prefer = /\.(litematic|schematic|schem|nbt)$/i.test(name) ? 'big' : 'little';
    try {
      var level = MCW.decodeLevelDat(bytes, prefer);
      setDoc({
        kind: 'nbt',
        world: null,
        level: level,
        fileName: name,
        sourceName: name
      });
      toast('NBT file loaded: ' + name, 'success');
    } catch (err) {
      toast('Could not parse ' + name + ' — ' + err.message, 'error');
    }
  }

  function openFilesFromInput(files) {
    var list = Array.prototype.slice.call(files || []);
    if (!list.length) return;

    // A single archive -> open as a world.
    if (list.length === 1 && /\.(mcworld|mctemplate|zip)$/i.test(list[0].name)) {
      readFileBytes(list[0]).then(function (b) { openWorldArchive(b, list[0].name); });
      return;
    }
    // A single NBT-ish file -> standalone NBT editor.
    if (list.length === 1 && isNbtPath(list[0].name)) {
      readFileBytes(list[0]).then(function (b) { openNbtFile(b, list[0].name); });
      return;
    }
    // Folder / multiple files -> assemble a world.
    var paths = list.map(function (f) { return { path: f.webkitRelativePath || f.name, file: f }; });
    Promise.all(paths.map(function (p) {
      return readFileBytes(p.file).then(function (b) { return { path: p.path, bytes: b }; });
    })).then(function (entries) {
      var world = MCW.openFiles(entries);
      if (!world.has('level.dat')) {
        toast('Those files do not include a level.dat — pick the world folder itself.', 'error');
        return;
      }
      setDoc({
        kind: 'world',
        world: world,
        level: world.level,
        fileName: world.suggestFileName(),
        sourceName: 'folder'
      });
      toast('World built from ' + entries.length + ' files.', 'success');
    });
  }

  function setDoc(doc) {
    S.doc = doc;
    S.dirty = false;
    S.tab = 'world';
    S.file = null;
    S.nbtDoc = null;
    S.expanded = new Set();
    S.expandAll = false;
    document.body.classList.add('mc-mode');
    $('#landing').classList.add('mc-hidden');
    $('#workspace').classList.remove('mc-hidden');
    $('#mcDirty').classList.add('mc-hidden');
    window.scrollTo({ top: $('#workspace').offsetTop - 80, behavior: 'smooth' });
    render();
  }

  function closeDoc() {
    if (S.dirty && !confirm('Discard unsaved changes and open another file?')) return;
    S.doc = null;
    S.dirty = false;
    document.body.classList.remove('mc-mode');
    $('#workspace').classList.add('mc-hidden');
    $('#landing').classList.remove('mc-hidden');
    $('#fileInput').value = '';
    $('#folderInput').value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* --------------------------------------------------------------- rendering */

  function render() {
    if (!S.doc) return;
    renderTopbar();
    renderTabs();
    renderPanel();
  }

  function renderTopbar() {
    var doc = S.doc;
    var name = doc.sourceName || doc.fileName;
    $('#mcFileName').textContent = name;
    var meta;
    if (doc.kind === 'world') {
      var total = 0;
      doc.world.entries.forEach(function (e) { total += e.data.length; });
      meta = doc.world.entries.size + ' files · ' + bytes(total);
      if (doc.world.level) meta += ' · level.dat ' + doc.world.level.compression;
    } else {
      meta = bytes(doc.level.originalBytes.length) + ' · ' + doc.level.endian + '-endian NBT';
    }
    $('#mcFileMeta').textContent = meta;
    $('#mcDirty').classList.toggle('mc-hidden', !S.dirty);
  }

  function renderTabs() {
    var tabs = $$('.mc-tab');
    var missing = docMissingLevel();
    tabs.forEach(function (btn) {
      var tab = btn.getAttribute('data-tab');
      btn.disabled = missing && tab !== 'files';
    });
    if (missing && S.tab !== 'files') S.tab = 'files';
    tabs.forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === S.tab);
    });
  }

  function docMissingLevel() { return !S.doc || !S.doc.level; }

  function renderPanel() {
    var panel = $('#mcPanel');
    panel.innerHTML = '';
    if (S.tab === 'world') panel.appendChild(renderWorld());
    else if (S.tab === 'player') panel.appendChild(renderPlayer());
    else if (S.tab === 'files') panel.appendChild(renderFiles());
    else if (S.tab === 'nbt') panel.appendChild(renderNbt());
    else if (S.tab === 'export') panel.appendChild(renderExport());
  }

  /* ------------------------------------------------------------- level model */

  function root() { return S.doc.level.root; }

  function getPath(path) { return NBT.getPath(root(), path); }

  function ensurePath(parts, type) {
    var node = root();
    for (var i = 0; i < parts.length - 1; i++) {
      var next = NBT.findChild(node, parts[i]);
      if (!next) {
        next = { type: T.COMPOUND, name: parts[i], value: [] };
        node.value.push(next);
      }
      if (next.type !== T.COMPOUND) throw new Error('"' + parts[i] + '" is not a compound');
      node = next;
    }
    var last = parts[parts.length - 1];
    var leaf = NBT.findChild(node, last);
    if (!leaf) {
      leaf = { type: type, name: last, value: defaultValue(type) };
      node.value.push(leaf);
    }
    return leaf;
  }

  function defaultValue(type) {
    switch (type) {
      case T.BYTE: return 0;
      case T.SHORT: return 0;
      case T.INT: return 0;
      case T.LONG: return 0n;
      case T.FLOAT: return 0;
      case T.DOUBLE: return 0;
      case T.STRING: return '';
      case T.BYTE_ARRAY: return new Uint8Array(0);
      case T.INT_ARRAY: return new Int32Array(0);
      case T.LONG_ARRAY: return [];
      case T.LIST: return { elemType: T.END, items: [] };
      case T.COMPOUND: return [];
      default: return null;
    }
  }

  function commit(path, type, rawValue, inputEl) {
    try {
      var parsed = NBT.parseValueInput(type, rawValue);
      var node = getPath(path);
      if (!node) node = ensurePath(path.split('/'), type);
      node.value = parsed;
      node.type = type;
      if (inputEl) inputEl.classList.remove('invalid');
      markDirty();
      syncLevelBytes();
      return true;
    } catch (err) {
      if (inputEl) inputEl.classList.add('invalid');
      toast(err.message, 'error');
      return false;
    }
  }

  function syncLevelBytes() {
    if (!S.doc || S.doc.kind !== 'world' || !S.doc.level) return;
    try {
      S.doc.world.put(S.doc.world.levelPath, MCW.encodeLevelDat(S.doc.level));
      S.doc.world.dirty = true;
    } catch (err) {
      /* reported at export time */
    }
  }

  /* ------------------------------------------------------------- form parts */

  function field(opts) {
    var wrap = el('div', { class: 'mc-field' });
    if (opts.label) wrap.appendChild(el('label', { text: opts.label, for: opts.id || null }));
    var input;
    var node = opts.path ? getPath(opts.path) : null;
    var missing = !node;

    if (opts.options) {
      input = el('select', { id: opts.id || null });
      opts.options.forEach(function (o) {
        var opt = el('option', { value: String(o[0]), text: o[1] });
        if (node && String(node.value) === String(o[0])) opt.selected = true;
        input.appendChild(opt);
      });
    } else {
      input = el('input', {
        id: opts.id || null,
        type: 'text',
        inputmode: opts.numeric ? 'numeric' : null,
        placeholder: missing ? (opts.placeholder || 'not set') : (opts.placeholder || ''),
        value: node ? NBT.valueToText(node) : ''
      });
    }

    var type = opts.type != null ? opts.type : (node ? node.type : T.STRING);

    function save() {
      var raw = input.value;
      if (missing && raw.trim() === '') return;
      commit(opts.path, type, raw, input);
      if (opts.after) opts.after(input.value);
    }

    input.addEventListener('change', save);
    if (input.tagName === 'INPUT') {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); save(); input.blur(); }
      });
    }
    wrap.appendChild(input);
    if (opts.hint) wrap.appendChild(el('div', { class: 'mc-hint', text: opts.hint }));
    if (opts.help) wrap.appendChild(el('div', { class: 'mc-why', text: opts.help }));
    return wrap;
  }

  function checkField(opts) {
    var wrap = el('label', { class: 'mc-check' });
    var node = getPath(opts.path);
    var box = el('input', { type: 'checkbox' });
    box.checked = !!(node && Number(node.value));
    box.addEventListener('change', function () {
      commit(opts.path, T.BYTE, box.checked ? '1' : '0', null);
    });
    wrap.appendChild(box);
    wrap.appendChild(el('span', { text: opts.label }));
    if (opts.hint || opts.help) {
      var outer = el('div', { class: 'mc-field' });
      outer.appendChild(wrap);
      if (opts.hint) outer.appendChild(el('div', { class: 'mc-hint', text: opts.hint }));
      if (opts.help) outer.appendChild(el('div', { class: 'mc-why', text: opts.help }));
      return outer;
    }
    return wrap;
  }

  function section(title, note, children) {
    var s = el('div', { class: 'mc-section' });
    var head = el('div', { class: 'mc-section-head' }, [
      el('h3', { class: 'mc-section-title', text: title })
    ]);
    if (note) head.appendChild(el('span', { class: 'mc-section-note', text: note }));
    s.appendChild(head);
    children.forEach(function (c) { if (c) s.appendChild(c); });
    return s;
  }

  function grid(children, cols) {
    return el('div', { class: 'mc-grid' + (cols ? ' cols-' + cols : '') }, children);
  }

  function card(k, v) {
    return el('div', { class: 'mc-card' }, [
      el('span', { class: 'k', text: k }),
      el('span', { class: 'v', text: v })
    ]);
  }

  /* ------------------------------------------------------------ quick setup */

  function setNodeValue(path, type, value) {
    var node = getPath(path);
    if (!node) node = ensurePath(path.split('/'), type);
    node.type = type;
    node.value = NBT.parseValueInput(type, String(value));
    return node;
  }

  function setRule(name, value) {
    var node = getPath('GameRules');
    if (!node) node = ensurePath(['GameRules'], T.COMPOUND);

    if (node.type === T.COMPOUND) {
      var child = NBT.findChild(node, name);
      if (child && child.type === T.COMPOUND) {
        var v = NBT.findChild(child, 'Value');
        if (v) { v.value = value; v.type = T.STRING; }
        else child.value.push({ type: T.STRING, name: 'Value', value: value });
      } else if (child) {
        child.value = value;
        child.type = T.STRING;
      } else {
        node.value.push({
          type: T.COMPOUND, name: name, value: [
            { type: T.STRING, name: 'Name', value: name },
            { type: T.STRING, name: 'Value', value: value }
          ]
        });
      }
      return;
    }

    if (node.type === T.LIST) {
      if (node.value.elemType === T.END) node.value.elemType = T.COMPOUND;
      var found = null;
      node.value.items.forEach(function (item) {
        if (item.type !== T.COMPOUND) return;
        var n = NBT.findChild({ type: T.COMPOUND, value: item.value }, 'Name');
        if (n && String(n.value) === name) found = item;
      });
      if (found) {
        var vv = NBT.findChild({ type: T.COMPOUND, value: found.value }, 'Value');
        if (vv) vv.value = value;
        else found.value.push({ type: T.STRING, name: 'Value', value: value });
      } else {
        node.value.items.push({
          type: T.COMPOUND, value: [
            { type: T.STRING, name: 'Name', value: name },
            { type: T.STRING, name: 'Value', value: value }
          ]
        });
      }
    }
  }

  function presetButton(kind, title, desc) {
    return el('button', {
      class: 'mc-preset' + (kind === 'reset' ? ' reset' : ''), type: 'button',
      onclick: function () { applyPreset(kind); }
    }, [
      el('span', { text: title }),
      el('small', { text: desc })
    ]);
  }

  function renderQuickSetup() {
    return section('Quick setup', 'Set the whole world in one tap', [
      el('div', { class: 'mc-presets' }, [
        presetButton('creative', 'Creative building', 'Fly, unlimited blocks, keep items on death.'),
        presetButton('survival', 'Fair survival', 'Survival, cheats off, achievements possible.'),
        presetButton('adventure', 'Adventure map', 'No building, no mob spawns, keep items.'),
        presetButton('reset', 'Undo settings', 'Reload level.dat exactly as you opened it.')
      ]),
      el('div', { class: 'mc-why',
        text: 'These buttons change several settings at once, then you can fine-tune below. Nothing is written to your device until you press Download.' })
    ]);
  }

  function applyPreset(kind) {
    if (!S.doc || !S.doc.level) return;
    if (kind === 'reset') { resetLevel(); return; }

    var changed = [];
    if (kind === 'creative') {
      setNodeValue('GameType', T.INT, 1); changed.push('Creative');
      setNodeValue('commandsEnabled', T.BYTE, 1); changed.push('cheats on');
      setNodeValue('Difficulty', T.INT, 0); changed.push('Peaceful');
      setRule('keepinventory', 'true'); changed.push('keep inventory');
      setRule('dodaylightcycle', 'false'); changed.push('daylight cycle off');
    } else if (kind === 'survival') {
      setNodeValue('GameType', T.INT, 0); changed.push('Survival');
      setNodeValue('commandsEnabled', T.BYTE, 0); changed.push('cheats off');
      setNodeValue('hasBeenLoadedInCreative', T.BYTE, 0); changed.push('Creative marker cleared');
      setNodeValue('Difficulty', T.INT, 2); changed.push('Normal');
      setRule('keepinventory', 'false'); changed.push('keep inventory off');
      setRule('dodaylightcycle', 'true'); changed.push('daylight cycle on');
    } else if (kind === 'adventure') {
      setNodeValue('GameType', T.INT, 2); changed.push('Adventure');
      setNodeValue('commandsEnabled', T.BYTE, 1); changed.push('cheats on');
      setNodeValue('Difficulty', T.INT, 2); changed.push('Normal');
      setRule('keepinventory', 'true'); changed.push('keep inventory');
      setRule('domobspawning', 'false'); changed.push('mob spawning off');
    }

    markDirty();
    syncLevelBytes();
    render();
    toast('Applied: ' + changed.join(', ') + '.', 'success');
  }

  function resetLevel() {
    if (!S.doc || !S.doc.level) return;
    var fresh;
    try {
      fresh = MCW.decodeLevelDat(S.doc.level.originalBytes);
    } catch (err) {
      toast('Could not reload the original level.dat.', 'error');
      return;
    }
    S.doc.level = fresh;
    if (S.doc.world) S.doc.world.level = fresh;
    markDirty();
    syncLevelBytes();
    render();
    toast('Settings restored to the file you opened.', 'success');
  }

  function renderAchievementBanner() {
    var reasons = [];
    var gt = getPath('GameType');
    var cheats = getPath('commandsEnabled');
    var creative = getPath('hasBeenLoadedInCreative');

    if (gt && Number(gt.value) === 1) reasons.push('game mode is Creative');
    if (cheats && Number(cheats.value)) reasons.push('cheats are enabled');
    if (creative && Number(creative.value)) reasons.push('the world was opened in Creative once');

    if (!reasons.length) {
      return el('div', { class: 'mc-banner good' }, [
        el('div', { class: 'txt', html: '<b>Achievements: possible</b> — Minecraft can still award achievements in this world.' })
      ]);
    }

    return el('div', { class: 'mc-banner warn' }, [
      el('div', { class: 'txt', html: '<b>Achievements are OFF</b> — ' + reasons.join(' · ') + '. Minecraft disables achievements permanently once a world uses Creative or cheats.' }),
      el('button', {
        class: 'btn btn-ghost', style: 'min-height:32px;padding:7px 11px;font-size:10px',
        text: 'Make achievements possible',
        onclick: function () {
          if (!confirm('Set game mode to Survival, turn cheats off and clear the Creative marker?')) return;
          setNodeValue('GameType', T.INT, 0);
          setNodeValue('commandsEnabled', T.BYTE, 0);
          setNodeValue('hasBeenLoadedInCreative', T.BYTE, 0);
          markDirty(); syncLevelBytes(); render();
          toast('World set up for achievements.', 'success');
        }
      })
    ]);
  }

  /* --------------------------------------------------------------- world tab */

  function renderWorld() {
    var frag = document.createDocumentFragment();
    var level = S.doc.level;
    var doc = S.doc;

    frag.appendChild(renderQuickSetup());
    frag.appendChild(renderAchievementBanner());

    frag.appendChild(el('div', { class: 'mc-cards' }, [
      card('World name', (getPath('LevelName') && getPath('LevelName').value) || '—'),
      card('Edition', 'Bedrock'),
      card('level.dat', level ? level.endian + ' endian · ' + level.compression : 'missing'),
      card('Files', doc.kind === 'world' ? String(doc.world.entries.size) : '1'),
      card('Game mode', gameTypeName(getPath('GameType')))
    ]));

    if (doc.kind === 'nbt') {
      frag.appendChild(el('div', { class: 'callout', style: 'margin-bottom:18px' },
        [el('p', { text: 'This is a standalone NBT file, not a .mcworld. Use the NBT tab to edit every tag, then export from the Export tab.' })]));
    }

    frag.appendChild(renderWorldIcon(doc));

    frag.appendChild(section('World identity', 'level.dat → LevelName', [
      grid([
        field({
          label: 'Level name', path: 'LevelName', type: T.STRING,
          hint: 'The name shown in Minecraft’s world list.',
          help: 'Change it freely — it is only a label. “Sync levelname.txt” below keeps the old text file in step so every device shows the same name.'
        }),
        field({
          label: 'Storage version', path: 'StorageVersion', type: T.INT, numeric: true,
          hint: 'Format version of level.dat. Usually 10.',
          help: 'Leave this alone. It tells Minecraft how to read the file; a wrong number can stop the world from opening.'
        })
      ]),
      doc.kind === 'world' && doc.world.has('levelname.txt')
        ? el('div', { class: 'mc-actions' }, [
            el('button', {
              class: 'btn btn-ghost', style: 'min-height:36px;padding:8px 14px;font-size:12px',
              text: 'Sync levelname.txt with LevelName',
              onclick: function () {
                var n = getPath('LevelName');
                if (!n) return;
                doc.world.put('levelname.txt', new TextEncoder().encode(String(n.value)));
                toast('levelname.txt updated.', 'success');
                markDirty();
              }
            })
          ])
        : null
    ]));

    frag.appendChild(section('Gameplay', 'Applies the next time the world loads', [
      grid([
        field({
          label: 'Game mode', path: 'GameType', type: T.INT, numeric: true,
          options: [[0, 'Survival (0)'], [1, 'Creative (1)'], [2, 'Adventure (2)'], [3, 'Spectator (3/6)']],
          hint: 'Survival = normal play. Creative = fly + unlimited blocks.',
          help: 'Creative gives flight and instant breaking, but it permanently turns achievements off for this world. Adventure is for maps: players cannot break blocks.'
        }),
        field({
          label: 'Difficulty', path: 'Difficulty', type: T.INT, numeric: true,
          options: [[0, 'Peaceful (0)'], [1, 'Easy (1)'], [2, 'Normal (2)'], [3, 'Hard (3)']],
          hint: 'How hard mobs hit and whether hunger drains.',
          help: 'Peaceful removes hostile mobs and refills health. Hard makes mobs stronger and hunger can kill you.'
        }),
        checkField({
          label: 'Cheats / commands enabled', path: 'commandsEnabled',
          hint: 'Lets you type /commands in chat.',
          help: 'Turning cheats ON permanently disables achievements in this world. If you only want commands once, use them and turn it back off — achievements may stay off anyway.'
        }),
        checkField({
          label: 'Has been loaded in Creative', path: 'hasBeenLoadedInCreative',
          hint: 'A marker that the world was opened in Creative at least once.',
          help: 'This flag is what Minecraft uses to keep achievements off. Turning it off does not always bring achievements back — it just removes the marker.'
        }),
        checkField({
          label: 'Education edition world', path: 'eduOffer',
          hint: 'Marks the world as an Education Edition world.',
          help: 'Only change this if you actually use Education Edition blocks; normal Bedrock may hide some items otherwise.'
        }),
        checkField({
          label: 'Bonus chest', path: 'bonusChestEnabled',
          hint: 'Starter chest next to spawn on a new world.',
          help: 'Only applies when the world is first created — it will not add a chest to an existing world.'
        })
      ])
    ]));

    frag.appendChild(section('Spawn point', 'Where players appear after dying', [
      grid([
        field({ label: 'X', path: 'SpawnX', type: T.INT, numeric: true, help: 'East–west block position. The player’s current X is shown in game under the map coordinates.' }),
        field({ label: 'Y', path: 'SpawnY', type: T.INT, numeric: true, help: 'Height. Keep it a few blocks above the ground (around 64–100) so players do not spawn inside blocks.' }),
        field({ label: 'Z', path: 'SpawnZ', type: T.INT, numeric: true, help: 'North–south block position.' }),
        field({
          label: 'Spawn dimension', path: 'SpawnDimension', type: T.INT, numeric: true,
          hint: '0 Overworld · 1 Nether · 2 End',
          help: 'Which dimension the spawn point is in. Spawning in the Nether or End only works if those dimensions exist in the world.'
        })
      ])
    ]));

    frag.appendChild(section('Seed & time', 'Long values are stored exactly', [
      grid([
        field({
          label: 'Random seed', path: 'RandomSeed', type: T.LONG, numeric: true,
          hint: 'Same seed + same version = same terrain.',
          help: 'This only affects chunks that have not been generated yet. Existing land stays exactly as it is.'
        }),
        field({ label: 'World time (ticks)', path: 'Time', type: T.LONG, numeric: true, after: function () { render(); }, help: 'The world clock. One full day is 24,000 ticks, so 24,000 = day 2 sunrise.' }),
        field({
          label: 'Current tick', path: 'currentTick', type: T.LONG, numeric: true,
          hint: 'Internal redstone / scheduled-event counter.',
          help: 'Leave this alone unless a world is stuck. Changing it can skip or break farms and redstone timers.'
        })
      ]),
      el('div', { class: 'mc-actions' }, [
        timeButton('Day', 1000),
        timeButton('Noon', 6000),
        timeButton('Sunset', 12000),
        timeButton('Night', 13000),
        timeButton('Midnight', 18000)
      ]),
      el('div', { class: 'mc-hint', style: 'margin-top:6px',
        text: 'Quick buttons set the time of day inside the current day, keeping the day counter intact.' })
    ]));

    frag.appendChild(section('Game rules', 'Editable for this world', [renderGameRules()]));

    return frag;
  }

  function renderWorldIcon(doc) {
    var world = doc.kind === 'world' ? doc.world : null;
    var targetPath = 'world_icon.jpeg';
    var existing = null;

    if (world) {
      var paths = world.paths();
      for (var i = 0; i < paths.length; i++) {
        if (/(^|\/)world_icon\.(jpe?g|png)$/i.test(paths[i])) { existing = paths[i]; break; }
      }
    }

    var fileInput = el('input', { type: 'file', accept: 'image/jpeg,image/png', class: 'mc-hidden' });
    fileInput.addEventListener('change', function () {
      var file = fileInput.files && fileInput.files[0];
      fileInput.value = '';
      if (!file || !world) return;
      if (!/^image\/(jpeg|png)$/.test(file.type)) { toast('Use a JPEG or PNG image.', 'error'); return; }
      if (file.size > 1024 * 1024) { toast('Choose an image under 1 MB.', 'error'); return; }
      readFileBytes(file).then(function (data) {
        if (existing && existing !== targetPath) world.remove(existing);
        world.put(targetPath, data);
        markDirty();
        toast('World icon saved.', 'success');
        render();
      }).catch(function () { toast('Could not read that image.', 'error'); });
    });

    var preview;
    if (world && existing) {
      var blob = new Blob([world.get(existing)], { type: /\.png$/i.test(existing) ? 'image/png' : 'image/jpeg' });
      preview = el('img', { class: 'mc-icon-preview', src: URL.createObjectURL(blob), alt: 'Current world icon', width: 96, height: 96 });
    } else {
      preview = el('div', { class: 'mc-icon-empty', text: 'No icon' });
    }

    return section('World icon', 'world_icon.jpeg in the world folder', [
      el('div', { class: 'mc-icon-row' }, [
        preview,
        el('div', { class: 'mc-icon-copy' }, [
          el('div', { class: 'mc-hint', text: world
            ? (existing ? 'Minecraft shows this picture in the world list (128×128 looks best).' : 'Optional. Without one, Minecraft shows the default world picture.')
            : 'Open a .mcworld to change the picture shown in Minecraft’s world list.' }),
          el('div', { class: 'mc-actions' }, [
            el('button', {
              class: 'btn btn-ghost', style: 'min-height:34px;padding:7px 12px;font-size:11px',
              text: existing ? 'Replace icon' : 'Add icon', disabled: !world || false,
              onclick: function () { if (world) fileInput.click(); }
            }),
            (world && existing) ? el('button', {
              class: 'btn btn-ghost', style: 'min-height:34px;padding:7px 12px;font-size:11px', text: 'Download icon',
              onclick: function () {
                download(new Blob([world.get(existing)], { type: /\.png$/i.test(existing) ? 'image/png' : 'image/jpeg' }), existing.split('/').pop());
              }
            }) : null,
            (world && existing) ? el('button', {
              class: 'btn btn-ghost', style: 'min-height:34px;padding:7px 12px;font-size:11px', text: 'Remove',
              onclick: function () {
                world.remove(existing);
                markDirty();
                toast('World icon removed.', 'success');
                render();
              }
            }) : null,
            fileInput
          ])
        ])
      ])
    ]);
  }

  function timeButton(label, tick) {
    return el('button', {
      class: 'btn btn-ghost', style: 'min-height:34px;padding:7px 12px;font-size:11px',
      text: label,
      onclick: function () {
        var node = getPath('Time');
        var dayTicks = 24000;
        var current = node ? BigInt(node.value) : 0n;
        var day = current / BigInt(dayTicks);
        var value = day * BigInt(dayTicks) + BigInt(tick);
        commit('Time', T.LONG, value.toString(), null);
        render();
        toast('Time set to ' + label.toLowerCase() + '.', 'success');
      }
    });
  }

  function gameTypeName(node) {
    if (!node) return '—';
    var map = { 0: 'Survival', 1: 'Creative', 2: 'Adventure', 3: 'Spectator', 6: 'Spectator' };
    return map[Number(node.value)] || String(node.value);
  }

  /* game rules: supports compound-of-compounds, list-of-compounds and flat compounds */
  function rulesModel() {
    var node = getPath('GameRules');
    var rows = [];
    if (!node) return { node: null, rows: rows, shape: 'none' };

    function addFromCompound(container, keyPrefix) {
      var kids = container.value || [];
      kids.forEach(function (kid) {
        if (kid.type === T.COMPOUND) {
          var nameNode = NBT.findChild(kid, 'Name');
          var valNode = NBT.findChild(kid, 'Value');
          rows.push({
            name: (nameNode && nameNode.value) || kid.name,
            value: valNode ? String(valNode.value) : '',
            holder: kid,
            valueNode: valNode,
            ref: kid
          });
        } else if (kid.type === T.STRING) {
          rows.push({
            name: kid.name,
            value: String(kid.value),
            holder: container,
            valueNode: kid,
            ref: kid,
            flat: true
          });
        }
      });
    }

    if (node.type === T.COMPOUND) addFromCompound(node);
    else if (node.type === T.LIST) {
      node.value.items.forEach(function (item) {
        if (item.type === T.COMPOUND) addFromCompound({ value: [item], type: T.COMPOUND });
      });
    }
    rows.sort(function (a, b) { return a.name.localeCompare(b.name); });
    return { node: node, rows: rows };
  }

  var RULE_HELP = {
    keepinventory: 'Keep items after dying instead of dropping them.',
    dodaylightcycle: 'Day and night keep moving. Off = the sun stays where it is.',
    domobspawning: 'Mobs spawn naturally. Off = no new hostile or friendly mobs appear.',
    mobgriefing: 'Creepers, endermen and villagers can change blocks. Off protects your builds.',
    showcoordinates: 'Shows the player position on screen — very handy on Bedrock.',
    dofiretick: 'Fire spreads and burns blocks. Off stops fires from spreading.',
    naturalregeneration: 'Health regenerates when hunger is full. Off = only potions heal.',
    tntexplodes: 'TNT can explode. Off makes TNT harmless.',
    pvp: 'Players can damage each other.',
    falldamage: 'Falling hurts. Off = no fall damage at all.',
    firedamage: 'Standing in fire or lava hurts.',
    drowningdamage: 'Running out of air under water hurts.',
    showdeathmessages: 'Shows “X was slain by Y” in chat.',
    commandblockoutput: 'Command blocks print their result in chat.',
    sendcommandfeedback: 'Chat shows the result of the commands you type.',
    randomtickspeed: 'How fast crops, grass and other random blocks update. 3 is vanilla.',
    doimmediaterespawn: 'Players respawn instantly instead of seeing the death screen.',
    doinsomnia: 'Phantoms appear after several nights without sleep. Off = no phantoms.',
    domobloot: 'Mobs drop items when killed.',
    doentitydrops: 'Broken blocks and entities drop their items.',
    doweathercycle: 'Rain and thunder happen on their own.',
    showtags: 'Shows name tags above players and mobs.',
    respawnblocksexplode: 'Beds and respawn anchors explode when used in the wrong dimension.'
  };

  function renderGameRules() {
    var model = rulesModel();
    var wrap = el('div');

    if (!model.node) {
      wrap.appendChild(el('div', { class: 'mc-empty',
        text: 'This world has no GameRules tag yet. Add one below to start.' }));
      wrap.appendChild(addRuleRow());
      return wrap;
    }

    var list = el('div', { class: 'mc-rules' });
    model.rows.forEach(function (row) {
      var input = el('input', { type: 'text', value: row.value });
      input.addEventListener('change', function () {
        try {
          if (row.valueNode) {
            row.valueNode.value = input.value;
            row.valueNode.type = T.STRING;
          } else {
            row.holder.value.push({ type: T.STRING, name: 'Value', value: input.value });
          }
          markDirty(); syncLevelBytes();
        } catch (err) { toast(err.message, 'error'); }
      });
      list.appendChild(el('div', { class: 'mc-rule' }, [
        el('div', { class: 'name-wrap' }, [
          el('div', { class: 'name', text: row.name, title: row.name }),
          RULE_HELP[row.name] ? el('div', { class: 'rule-desc', text: RULE_HELP[row.name] }) : null
        ]),
        input,
        el('button', {
          class: 'mc-del', text: '✕', title: 'Remove rule',
          onclick: function () {
            if (row.flat) {
              var kids = row.holder.value;
              var i = kids.indexOf(row.ref);
              if (i >= 0) kids.splice(i, 1);
            } else {
              var parent = model.node.type === T.COMPOUND ? model.node.value : model.node.value.items;
              var idx = parent.indexOf(row.ref);
              if (idx >= 0) parent.splice(idx, 1);
            }
            markDirty(); syncLevelBytes(); render();
          }
        })
      ]));
    });
    wrap.appendChild(list);
    wrap.appendChild(addRuleRow());
    return wrap;
  }

  function addRuleRow() {
    var nameInput = el('input', { type: 'text', placeholder: 'rule name, e.g. keepinventory' });
    var valInput = el('input', { type: 'text', placeholder: 'value (true / 0)' });
    var row = el('div', { class: 'mc-add-row' }, [
      nameInput, valInput,
      el('button', {
        class: 'btn btn-primary', style: 'min-height:34px;padding:7px 14px;font-size:11px', text: 'Add rule',
        onclick: function () {
          var name = nameInput.value.trim();
          var value = valInput.value.trim() || 'true';
          if (!name) { toast('Rule name is required.', 'error'); return; }
          var node = getPath('GameRules');
          if (!node) {
            node = ensurePath(['GameRules'], T.COMPOUND);
          }
          if (node.type === T.COMPOUND) {
            node.value.push({
              type: T.COMPOUND, name: name, value: [
                { type: T.STRING, name: 'Name', value: name },
                { type: T.STRING, name: 'Value', value: value }
              ]
            });
          } else if (node.type === T.LIST) {
            if (node.value.elemType === T.END) node.value.elemType = T.COMPOUND;
            node.value.items.push({
              type: T.COMPOUND, value: [
                { type: T.STRING, name: 'Name', value: name },
                { type: T.STRING, name: 'Value', value: value }
              ]
            });
          }
          markDirty(); syncLevelBytes(); render();
          toast('Game rule added.', 'success');
        }
      })
    ]);
    return row;
  }

  /* -------------------------------------------------------------- player tab */

  function renderPlayer() {
    var frag = document.createDocumentFragment();
    var player = getPath('Player');

    if (!player) {
      frag.appendChild(el('div', { class: 'callout' }, [
        el('p', { text: 'This .mcworld does not store player data inside level.dat. Single-player player state lives in the world database (db/), which this tool shows as files but does not decode yet.' })
      ]));
      frag.appendChild(el('div', { class: 'mc-actions' }, [
        el('button', { class: 'btn btn-ghost', text: 'Open the NBT tab', onclick: function () { S.tab = 'nbt'; render(); } })
      ]));
      return frag;
    }

    frag.appendChild(el('div', { class: 'mc-cards' }, [
      card('Health', textOf(player, 'Health')),
      card('Game mode', textOf(player, 'PlayerGameType')),
      card('XP level', textOf(player, 'XpLevel')),
      card('Dimension', textOf(player, 'DimensionId'))
    ]));

    frag.appendChild(section('Vitals', 'Player compound inside level.dat', [
      grid([
        field({ label: 'Health', path: 'Player/Health', type: T.FLOAT, numeric: true, hint: '20 = full health.' }),
        field({ label: 'Game mode', path: 'Player/PlayerGameType', type: T.INT, numeric: true,
          options: [[0, 'Survival'], [1, 'Creative'], [2, 'Adventure'], [3, 'Spectator']] }),
        field({ label: 'XP level', path: 'Player/XpLevel', type: T.INT, numeric: true }),
        field({ label: 'XP progress', path: 'Player/XpProgress', type: T.FLOAT, numeric: true }),
        field({ label: 'Dimension id', path: 'Player/DimensionId', type: T.INT, numeric: true })
      ])
    ]));

    var abilities = NBT.findChild(player, 'Abilities');
    if (abilities && abilities.type === T.COMPOUND) {
      frag.appendChild(section('Abilities', 'Player → Abilities in level.dat', [
        grid([
          abilityCheck('mayfly', 'Can fly', 'Lets the player start and stop flying (Creative already allows it).'),
          abilityCheck('flying', 'Flying right now', 'The player starts the next session in the air.'),
          abilityCheck('invulnerable', 'Invulnerable', 'Ignores damage from mobs, falls, fire and lava.'),
          abilityCheck('build', 'Can place blocks', 'Turn off for viewer-only or cinematic worlds.'),
          abilityCheck('mine', 'Can break blocks', 'Turn off to keep builds intact.'),
          abilityCheck('op', 'Operator powers', 'Grants operator-only commands and permissions.')
        ])
      ]));
    }

    var pos = NBT.findChild(player, 'Pos');
    frag.appendChild(section('Position', pos ? 'Stored as a float list' : 'No Pos tag found', [
      pos ? grid([
        posField('X', 0), posField('Y', 1), posField('Z', 2)
      ]) : el('div', { class: 'mc-hint', text: 'Join the world once to write player position data.' })
    ]));

    return frag;
  }

  function abilityCheck(name, label, help) {
    var path = 'Player/Abilities/' + name;
    var node = getPath(path);
    var wrap = el('label', { class: 'mc-check' });
    var box = el('input', { type: 'checkbox' });
    box.checked = !!(node && (Number(node.value) || node.value === true || String(node.value) === 'true'));
    box.addEventListener('change', function () {
      var type = node && (node.type === T.INT || node.type === T.BYTE) ? node.type : T.BYTE;
      commit(path, type, box.checked ? '1' : '0', null);
    });
    wrap.appendChild(box);
    wrap.appendChild(el('span', { text: label }));
    var outer = el('div', { class: 'mc-field' });
    outer.appendChild(wrap);
    if (help) outer.appendChild(el('div', { class: 'mc-hint', text: help }));
    return outer;
  }

  function textOf(compound, name) {
    var n = NBT.findChild(compound, name);
    return n ? NBT.valueToText(n) : '—';
  }

  function posField(label, index) {
    var node = NBT.getPath(root(), ['Player', 'Pos']);
    var value = node && node.value.items[index] ? node.value.items[index].value : 0;
    var input = el('input', { type: 'text', value: String(value), inputmode: 'decimal' });
    input.addEventListener('change', function () {
      var n = Number(input.value);
      if (!isFinite(n)) { input.classList.add('invalid'); toast('Position must be a number.', 'error'); return; }
      input.classList.remove('invalid');
      var list = NBT.getPath(root(), ['Player', 'Pos']);
      if (list && list.value.items[index]) {
        list.value.items[index] = { type: T.FLOAT, value: n };
        markDirty(); syncLevelBytes();
      }
    });
    var wrap = el('div', { class: 'mc-field' }, [el('label', { text: label }), input]);
    return wrap;
  }

  /* --------------------------------------------------------------- files tab */

  function renderFiles() {
    var doc = S.doc;
    var frag = document.createDocumentFragment();

    if (doc.kind !== 'world') {
      frag.appendChild(el('div', { class: 'callout' }, [
        el('p', { text: 'Standalone NBT file mode — there is no archive around this file. Open a .mcworld to browse its internal files.' })
      ]));
      frag.appendChild(el('div', { class: 'mc-actions' }, [
        el('button', { class: 'btn btn-primary', text: 'Open a world', onclick: closeDoc })
      ]));
      return frag;
    }

    var world = doc.world;
    var paths = world.paths();
    var filter = S.fileFilter.toLowerCase();
    var shown = filter ? paths.filter(function (p) { return p.toLowerCase().indexOf(filter) !== -1; }) : paths;

    var search = el('input', {
      type: 'text', placeholder: 'Filter files…', value: S.fileFilter
    });
    search.addEventListener('input', function () {
      S.fileFilter = search.value;
      var list = $('#mcFileList');
      if (list) list.replaceWith(buildFileTable());
    });

    frag.appendChild(el('div', { class: 'mc-file-bar' }, [
      search,
      el('button', { class: 'btn btn-ghost', style: 'min-height:34px;padding:7px 12px;font-size:11px', text: '+ New file', onclick: showNewFileForm }),
      el('button', { class: 'btn btn-ghost', style: 'min-height:34px;padding:7px 12px;font-size:11px', text: 'Download world', onclick: doExport })
    ]));

    var split = el('div', { class: 'mc-file-split' }, [
      buildFileTable(),
      el('div', { class: 'mc-viewer', id: 'mcViewer' }, [
        el('div', { class: 'mc-empty', text: 'Select a file to preview or replace it.' })
      ])
    ]);
    frag.appendChild(split);
    return frag;
  }

  function buildFileTable() {
    var world = S.doc.world;
    var paths = world.paths();
    var filter = (S.fileFilter || '').toLowerCase();
    var shown = filter ? paths.filter(function (p) { return p.toLowerCase().indexOf(filter) !== -1; }) : paths;

    var table = el('div', { class: 'mc-table', id: 'mcFileList' });
    table.appendChild(el('div', { class: 'mc-table-head' }, [
      el('div', { text: 'Path' }), el('div', { text: 'Size' })
    ]));

    if (!shown.length) {
      table.appendChild(el('div', { class: 'mc-empty', text: 'No files match that filter.' }));
      return table;
    }

    shown.forEach(function (p) {
      var entry = world.entries.get(p);
      var row = el('div', { class: 'mc-row' + (S.file === p ? ' active' : ''), title: p }, [
        el('div', { class: 'p' }, [
          entry.dirty ? el('span', { class: 'edit-dot' }) : null,
          el('span', { text: p })
        ]),
        el('div', { class: 'sz', text: bytes(entry.data.length) })
      ]);
      row.addEventListener('click', function () {
        S.file = p;
        $$('.mc-row').forEach(function (r) { r.classList.remove('active'); });
        row.classList.add('active');
        openFileViewer(p);
      });
      table.appendChild(row);
    });
    return table;
  }

  function openFileViewer(path) {
    var viewer = $('#mcViewer');
    if (!viewer) return;
    var world = S.doc.world;
    var data = world.get(path);
    if (!data) return;

    viewer.innerHTML = '';
    viewer.appendChild(el('div', { class: 'mc-viewer-head' }, [
      el('div', { class: 'path', text: path, title: path })
    ]));

    var body = el('div');

    if (isImagePath(path)) {
      var blob = new Blob([data], { type: 'image/*' });
      var url = URL.createObjectURL(blob);
      body.appendChild(el('img', { src: url, alt: path }));
    } else if (isTextPath(path)) {
      var ta = el('textarea', { spellcheck: 'false' });
      ta.value = MCW.textOf(data);
      body.appendChild(ta);
      var save = el('button', {
        class: 'btn btn-primary', style: 'min-height:34px;padding:7px 14px;font-size:11px', text: 'Save file',
        onclick: function () {
          world.put(path, new TextEncoder().encode(ta.value));
          markDirty();
          toast('Saved ' + path, 'success');
          renderTopbar();
        }
      });
      body.appendChild(el('div', { class: 'mc-actions' }, [save]));
    } else if (isNbtPath(path)) {
      body.appendChild(el('p', { class: 'mc-hint',
        html: 'Binary NBT file. Edit it in the <strong>NBT</strong> tab, or replace it with another file.' }));
      if (path !== S.doc.world.levelPath) {
        body.appendChild(el('div', { class: 'mc-actions' }, [
          el('button', {
            class: 'btn btn-ghost', style: 'min-height:34px;padding:7px 12px;font-size:11px', text: 'Open in NBT editor',
            onclick: function () { openNbtInEditor(path); }
          })
        ]));
      }
    } else {
      var pre = el('pre', { class: 'hex' });
      pre.textContent = hexPreview(data);
      body.appendChild(pre);
    }

    viewer.appendChild(body);

    viewer.appendChild(el('div', { class: 'mc-actions' }, [
      el('button', { class: 'btn btn-ghost', style: 'min-height:34px;padding:7px 12px;font-size:11px', text: 'Download', onclick: function () { download(data, path.split('/').pop()); } }),
      replaceButton(path),
      el('button', { class: 'btn btn-ghost', style: 'min-height:34px;padding:7px 12px;font-size:11px', text: 'Rename', onclick: function () { renameFile(path); } }),
      el('button', { class: 'btn btn-ghost', style: 'min-height:34px;padding:7px 12px;font-size:11px;' + (path === 'level.dat' ? 'display:none' : ''), text: 'Delete', onclick: function () { deleteFile(path); } })
    ]));
  }

  function hexPreview(data) {
    var lines = [];
    var max = Math.min(data.length, 512);
    for (var i = 0; i < max; i += 16) {
      var chunk = Array.prototype.slice.call(data.subarray(i, i + 16));
      var hex = chunk.map(function (b) { return b.toString(16).padStart(2, '0'); }).join(' ');
      var ascii = chunk.map(function (b) { return b >= 32 && b < 127 ? String.fromCharCode(b) : '.'; }).join('');
      lines.push(i.toString(16).padStart(6, '0') + '  ' + hex.padEnd(47, ' ') + '  ' + ascii);
    }
    if (data.length > max) lines.push('… ' + (data.length - max) + ' more bytes');
    return lines.join('\n');
  }

  function replaceButton(path) {
    var input = el('input', { type: 'file', style: 'display:none' });
    input.addEventListener('change', function () {
      var f = input.files[0];
      if (!f) return;
      readFileBytes(f).then(function (b) {
        S.doc.world.put(path, b);
        markDirty();
        toast('Replaced ' + path, 'success');
        renderTopbar();
        openFileViewer(path);
        var list = $('#mcFileList');
        if (list) list.replaceWith(buildFileTable());
      });
    });
    var btn = el('button', {
      class: 'btn btn-ghost', style: 'min-height:34px;padding:7px 12px;font-size:11px', text: 'Replace',
      onclick: function () { input.click(); }
    });
    var wrap = el('span');
    wrap.appendChild(btn);
    wrap.appendChild(input);
    return wrap;
  }

  function renameFile(path) {
    var to = prompt('New path inside the world:', path);
    if (!to || to === path) return;
    to = to.replace(/\\/g, '/').replace(/^\/+/, '');
    if (!to) return;
    if (S.doc.world.has(to)) { toast('A file with that path already exists.', 'error'); return; }
    S.doc.world.rename(path, to);
    markDirty();
    render();
    toast('Renamed to ' + to, 'success');
  }

  function deleteFile(path) {
    if (!confirm('Delete "' + path + '" from this world?')) return;
    S.doc.world.remove(path);
    S.file = null;
    markDirty();
    render();
    toast('Deleted ' + path, 'success');
  }

  function showNewFileForm() {
    var name = el('input', { type: 'text', placeholder: 'path/to/file.txt', style: 'flex:1 1 160px' });
    var content = el('textarea', { placeholder: 'File contents (text). Leave empty for an empty file.', style: 'width:100%;min-height:90px;margin-top:8px' });
    var wrap = el('div', { class: 'mc-add-row', style: 'flex-direction:column;align-items:stretch' }, [
      el('div', { style: 'display:flex;gap:6px;flex-wrap:wrap' }, [name]),
      content,
      el('div', { class: 'mc-actions' }, [
        el('button', {
          class: 'btn btn-primary', style: 'min-height:34px;padding:7px 14px;font-size:11px', text: 'Create file',
          onclick: function () {
            var p = name.value.trim().replace(/\\/g, '/').replace(/^\/+/, '');
            if (!p) { toast('A file path is required.', 'error'); return; }
            if (S.doc.world.has(p)) { toast('That path already exists.', 'error'); return; }
            S.doc.world.put(p, new TextEncoder().encode(content.value));
            markDirty();
            render();
            toast('Created ' + p, 'success');
          }
        })
      ])
    ]);
    var viewer = $('#mcViewer');
    if (viewer) { viewer.innerHTML = ''; viewer.appendChild(wrap); }
  }

  /* ----------------------------------------------------------------- nbt tab */

  function openNbtInEditor(path) {
    var data = S.doc.world.get(path);
    try {
      S.nbtDoc = { path: path, level: MCW.decodeLevelDat(data, 'little') };
      S.tab = 'nbt';
      render();
      toast('Editing ' + path + ' — save it back with “Save to world”.', 'success');
    } catch (err) {
      toast('Not an NBT file: ' + err.message, 'error');
    }
  }

  function activeLevel() {
    if (S.tab === 'nbt' && S.nbtDoc) return S.nbtDoc.level;
    return S.doc.level;
  }

  function activeRoot() {
    var lvl = activeLevel();
    return lvl ? lvl.root : null;
  }

  function renderNbt() {
    var frag = document.createDocumentFragment();
    var level = activeLevel();
    if (!level) {
      frag.appendChild(el('div', { class: 'callout' }, [el('p', { text: 'No NBT document loaded.' })]));
      return frag;
    }

    var note = S.tab === 'nbt' && S.nbtDoc
      ? 'Editing ' + S.nbtDoc.path + ' · ' + level.endian + '-endian'
      : 'Editing level.dat · ' + level.endian + '-endian NBT';

    frag.appendChild(el('div', { class: 'mc-tree-tools' }, [
      el('span', { class: 'mc-section-note', text: note }),
      el('span', { style: 'flex:1' }),
      el('button', { class: 'btn btn-ghost', style: 'min-height:32px;padding:6px 11px;font-size:11px', text: 'Expand all', onclick: function () { S.expandAll = true; render(); } }),
      el('button', { class: 'btn btn-ghost', style: 'min-height:32px;padding:6px 11px;font-size:11px', text: 'Collapse all', onclick: function () { S.expanded = new Set(); S.expandAll = false; render(); } }),
      S.nbtDoc ? el('button', { class: 'btn btn-primary', style: 'min-height:32px;padding:6px 11px;font-size:11px', text: 'Save to world', onclick: saveNbtBuffer }) : null
    ]));

    var tree = el('div', { class: 'mc-tree' });
    var rootNode = level.root;
    tree.appendChild(renderTreeNode(rootNode, [], 0, true));
    frag.appendChild(tree);

    frag.appendChild(addTagForm());
    return frag;
  }

  function nodeKey(path) { return path.join('/'); }

  function chipClass(type) {
    switch (type) {
      case T.COMPOUND: return 't-c';
      case T.STRING: return 't-s';
      case T.INT: case T.SHORT: case T.BYTE: return 't-i';
      case T.LONG: return 't-l';
      case T.FLOAT: case T.DOUBLE: return 't-f';
      case T.LIST: return 't-list';
      case T.BYTE_ARRAY: case T.INT_ARRAY: case T.LONG_ARRAY: return 't-arr';
      default: return 't-b';
    }
  }

  function shortType(type) {
    var map = { 1: 'B', 2: 'S', 3: 'I', 4: 'L', 5: 'F', 6: 'D', 7: 'BA', 8: 'STR', 9: 'LIST', 10: 'C', 11: 'IA', 12: 'LA' };
    return map[type] || '?';
  }

  function renderTreeNode(node, path, depth, isRoot) {
    var container = el('div', { class: 'mc-node' + (isRoot ? ' root' : '') });
    var isCompound = node.type === T.COMPOUND;
    var isList = node.type === T.LIST;
    var expandable = isCompound || isList;
    var key = nodeKey(path);
    var open = S.expandAll || S.expanded.has(key) || (isRoot && depth === 0) || depth === 0;

    var caret = el('span', {
      class: 'mc-caret' + (expandable ? '' : ' leaf'),
      text: expandable ? (open ? '▾' : '▸') : '·'
    });
    if (expandable) {
      caret.addEventListener('click', function () {
        S.expandAll = false;
        if (S.expanded.has(key)) S.expanded.delete(key); else S.expanded.add(key);
        render();
      });
    }

    var label = isRoot ? (node.name || '(root)') : (isCompound || isList ? node.name : node.name);
    var row = el('div', { class: 'mc-node-row' }, [caret]);

    row.appendChild(el('span', { class: 'mc-chip ' + chipClass(node.type), text: shortType(node.type) }));
    row.appendChild(el('span', { class: 'mc-node-name', text: label }));
    row.appendChild(el('span', { class: 'mc-node-eq', text: '=' }));

    if (isCompound) {
      row.appendChild(el('span', { class: 'mc-node-more', text: node.value.length + ' entries' }));
    } else if (isList) {
      var itemType = node.value.elemType;
      row.appendChild(el('span', {
        class: 'mc-node-more',
        text: node.value.items.length + ' × ' + NBT.typeName(itemType).replace('TAG_', '')
      }));
    } else if (node.type === T.BYTE_ARRAY || node.type === T.INT_ARRAY || node.type === T.LONG_ARRAY) {
      var ta = el('input', { class: 'mc-node-val', type: 'text', value: NBT.valueToText(node) });
      bindValue(ta, node, path);
      row.appendChild(ta);
    } else if (NBT.isNumericType(node.type) || node.type === T.STRING) {
      var input = el('input', { class: 'mc-node-val', type: 'text', value: NBT.valueToText(node) });
      bindValue(input, node, path);
      row.appendChild(input);
    }

    if (!isRoot) {
      row.appendChild(el('button', {
        class: 'mc-node-btn', text: '✕', title: 'Delete tag',
        onclick: function () { deleteTag(path); }
      }));
    }
    container.appendChild(row);

    if (expandable && open) {
      if (isCompound) {
        node.value.forEach(function (kid) {
          container.appendChild(renderTreeNode(kid, path.concat([kid.name]), depth + 1, false));
        });
      } else {
        node.value.items.forEach(function (item, i) {
          var pseudo = {
            type: item.type,
            name: '[' + i + ']',
            value: item.value
          };
          container.appendChild(renderTreeNode(pseudo, path.concat([String(i)]), depth + 1, false));
        });
        container.appendChild(el('div', { class: 'mc-node', style: 'padding-left:20px' }, [
          el('button', {
            class: 'mc-node-btn', text: '+ item', title: 'Append list item',
            onclick: function () {
              var type = node.value.elemType === T.END
                ? parseInt(prompt('Element type (1=byte,3=int,4=long,5=float,6=double,8=string,10=compound)', '8') || '8', 10)
                : node.value.elemType;
              if (!type) return;
              node.value.elemType = type;
              node.value.items.push({ type: type, value: defaultValue(type) });
              markDirty(); syncLevelBytes(); render();
              if (!S.expandAll) S.expanded.add(key);
            }
          })
        ]));
      }
    }

    return container;
  }

  function bindValue(input, node, path) {
    input.addEventListener('change', function () {
      try {
        node.value = NBT.parseValueInput(node.type, input.value);
        input.classList.remove('invalid');
        markDirty();
        syncLevelBytes();
      } catch (err) {
        input.classList.add('invalid');
        toast(err.message, 'error');
      }
    });
  }

  function deleteTag(path) {
    var parts = path.slice();
    var last = parts.pop();
    var parent = NBT.getPath(activeRoot(), parts);
    if (!parent) return;
    if (parent.type === T.COMPOUND) {
      var i = parent.value.findIndex(function (k) { return k.name === last; });
      if (i >= 0) parent.value.splice(i, 1);
    } else if (parent.type === T.LIST) {
      parent.value.items.splice(Number(last), 1);
    }
    markDirty(); syncLevelBytes();
    render();
  }

  function addTagForm() {
    var nameInput = el('input', { type: 'text', placeholder: 'tag name', name: 'name' });
    var typeSelect = el('select', { name: 'type' }, [
      ['1', 'Byte'], ['2', 'Short'], ['3', 'Int'], ['4', 'Long'], ['5', 'Float'],
      ['6', 'Double'], ['8', 'String'], ['10', 'Compound'], ['9', 'List']
    ].map(function (o) { return el('option', { value: o[0], text: o[1] }); }));
    var valueInput = el('input', { type: 'text', placeholder: 'value', name: 'value' });

    return el('div', { class: 'mc-add-row' }, [
      typeSelect, nameInput, valueInput,
      el('button', {
        class: 'btn btn-primary', style: 'min-height:34px;padding:7px 14px;font-size:11px', text: 'Add root tag',
        onclick: function () {
          var name = nameInput.value.trim();
          if (!name) { toast('Tag name is required.', 'error'); return; }
          var type = parseInt(typeSelect.value, 10);
          var rootNode = activeRoot();
          if (!rootNode || rootNode.type !== T.COMPOUND) { toast('Root is not a compound.', 'error'); return; }
          if (NBT.findChild(rootNode, name)) { toast('That tag already exists.', 'error'); return; }
          var value;
          try { value = NBT.parseValueInput(type, valueInput.value || ''); }
          catch (err) { toast(err.message, 'error'); return; }
          rootNode.value.push({ type: type, name: name, value: value });
          markDirty(); syncLevelBytes();
          render();
          toast('Tag added.', 'success');
        }
      })
    ]);
  }

  function saveNbtBuffer() {
    if (!S.nbtDoc || !S.doc || S.doc.kind !== 'world') return;
    try {
      var bytesOut = MCW.encodeLevelDat(S.nbtDoc.level);
      S.doc.world.put(S.nbtDoc.path, bytesOut);
      markDirty();
      toast('Saved ' + S.nbtDoc.path + ' back into the world.', 'success');
      renderTopbar();
    } catch (err) {
      toast('Could not write this file: ' + err.message, 'error');
    }
  }

  /* -------------------------------------------------------------- export tab */

  function renderExport() {
    var doc = S.doc;
    var frag = document.createDocumentFragment();

    var nameInput = el('input', { type: 'text', value: doc.fileName });
    nameInput.addEventListener('change', function () { doc.fileName = nameInput.value.trim() || 'world.mcworld'; });

    var total = 0;
    var count = doc.kind === 'world' ? doc.world.entries.size : 1;
    if (doc.kind === 'world') doc.world.entries.forEach(function (e) { total += e.data.length; });

    frag.appendChild(el('div', { class: 'mc-cards' }, [
      card('Files', String(count)),
      card('Uncompressed size', bytes(total)),
      card('Output', '.mcworld (zip)'),
      card('Runs on', 'This device only')
    ]));

    frag.appendChild(section('File name', 'Used for the downloaded world', [
      el('div', { class: 'mc-field' }, [nameInput]),
      el('div', { class: 'mc-hint', text: 'Keep the .mcworld extension so phones and consoles recognise it.' })
    ]));

    var buttons = [
      el('button', { class: 'mc-export-btn accent', onclick: doExport }, [
        el('strong', { text: 'Download .mcworld' }),
        el('small', { text: 'Rebuild the whole world archive with your edits.' })
      ]),
      el('button', { class: 'mc-export-btn', onclick: downloadLevelDat }, [
        el('strong', { text: 'Download level.dat' }),
        el('small', { text: 'Just the settings file, for manual copying.' })
      ])
    ];

    if (doc.kind === 'world' && doc.world.has('levelname.txt')) {
      buttons.push(el('button', { class: 'mc-export-btn', onclick: function () {
        download(doc.world.get('levelname.txt'), 'levelname.txt', 'text/plain');
      } }, [
        el('strong', { text: 'Download levelname.txt' }),
        el('small', { text: 'Plain-text world name used by some launchers.' })
      ]));
    }

    if (doc.kind === 'nbt') {
      buttons.push(el('button', { class: 'mc-export-btn', onclick: function () {
        download(MCW.encodeLevelDat(doc.level), doc.fileName);
      } }, [
        el('strong', { text: 'Download edited NBT' }),
        el('small', { text: 'Same encoding as the file you opened.' })
      ]));
    }

    frag.appendChild(el('div', { class: 'mc-export-grid' }, buttons));

    frag.appendChild(section('Install the world', 'Same steps on any device', [
      el('div', { class: 'callout' }, [
        el('p', { html: '<strong>Windows / Android:</strong> open the downloaded <code>.mcworld</code> file — Minecraft imports it automatically.' }),
        el('p', { html: '<strong>iOS:</strong> share the file to Minecraft from the Files app.' }),
        el('p', { html: '<strong>Manual:</strong> unzip it into <code>minecraftWorlds/&lt;world id&gt;/</code>.' })
      ]),
      el('div', { class: 'mc-hint', style: 'margin-top:10px',
        text: 'Always keep a copy of the original world. Editing level.dat changes settings, not terrain.' })
    ]));

    frag.appendChild(el('div', { class: 'mc-actions' }, [
      el('button', { class: 'btn btn-ghost', text: 'Open another file', onclick: closeDoc })
    ]));

    return frag;
  }

  function downloadLevelDat() {
    if (!S.doc || !S.doc.level) return;
    download(MCW.encodeLevelDat(S.doc.level), 'level.dat');
  }

  function safeFileName(name, fallback) {
    var clean = String(name || '')
      .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '-')
      .replace(/^\.+/, '')
      .trim();
    return clean || fallback;
  }

  function doExport() {
    if (!S.doc) return;
    if (S.doc.kind === 'nbt') {
      download(MCW.encodeLevelDat(S.doc.level), safeFileName(S.doc.fileName, 'output.nbt'));
      toast('NBT file downloaded.', 'success');
      return;
    }
    var world = S.doc.world;
    if (S.doc.level) world.put(world.levelPath, MCW.encodeLevelDat(S.doc.level));
    toast('Packing ' + world.entries.size + ' files…');
    world.build().then(function (zipBytes) {
      download(zipBytes, safeFileName(S.doc.fileName, world.suggestFileName()), 'application/zip');
      S.dirty = false;
      $('#mcDirty').classList.add('mc-hidden');
      toast('World downloaded — open it with Minecraft.', 'success');
    }).catch(function (err) {
      toast('Export failed: ' + (err.message || err), 'error');
    });
  }

  /* ------------------------------------------------------------------ wiring */

  function initDropZone() {
    var drop = $('#mcDrop');
    var fileInput = $('#fileInput');
    var folderInput = $('#folderInput');

    drop.addEventListener('click', function (e) {
      if (e.target.closest('button')) return;
      fileInput.click();
    });
    drop.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
    });

    fileInput.addEventListener('change', function () { openFilesFromInput(fileInput.files); });
    folderInput.addEventListener('change', function () { openFilesFromInput(folderInput.files); });

    ['dragenter', 'dragover'].forEach(function (ev) {
      document.addEventListener(ev, function (e) {
        if (!e.dataTransfer || Array.prototype.indexOf.call(e.dataTransfer.types, 'Files') === -1) return;
        e.preventDefault();
        if (S.doc) return;
        drop.classList.add('dragover');
      });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      document.addEventListener(ev, function () { drop.classList.remove('dragover'); });
    });
    document.addEventListener('drop', function (e) {
      if (!e.dataTransfer || !e.dataTransfer.files || !e.dataTransfer.files.length) return;
      e.preventDefault();
      if (S.doc) {
        toast('Close the current file before opening another.', 'error');
        return;
      }
      openFilesFromInput(e.dataTransfer.files);
    });
  }

  function initTabs() {
    $$('.mc-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.disabled) return;
        S.tab = btn.getAttribute('data-tab');
        render();
      });
    });
  }

  function initFaq() {
    $$('.faq-question').forEach(function (q) {
      q.addEventListener('click', function () {
        var item = q.closest('.faq-item');
        if (!item) return;
        item.classList.toggle('open');
      });
    });
  }

  function initShortcuts() {
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        if (!S.doc) return;
        e.preventDefault();
        doExport();
      }
    });
    window.addEventListener('beforeunload', function (e) {
      if (!S.dirty) return;
      e.preventDefault();
      e.returnValue = '';
    });
  }

  function init() {
    if (!window.fflate) {
      document.body.insertAdjacentHTML('afterbegin',
        '<div style="padding:14px;background:#C62828;color:#fff;font-family:monospace">' +
        'Archive library failed to load. Open this page over http(s) (not file://) or re-upload assets/js/vendor/fflate.min.js.' +
        '</div>');
      return;
    }
    initDropZone();
    initTabs();
    initFaq();
    initShortcuts();

    $('#mcClose').addEventListener('click', closeDoc);
    $('#mcQuickSave').addEventListener('click', doExport);

    var single = $('#btnSingle');
    if (single) {
      single.addEventListener('click', function (e) {
        e.stopPropagation();
        $('#singleInput').click();
      });
      $('#singleInput').addEventListener('change', function () {
        openFilesFromInput($('#singleInput').files);
      });
    }
    $('#btnDemo').addEventListener('click', function (e) {
      e.stopPropagation();
      var world = MCW.demoLevelDat();
      setDoc({
        kind: 'world', world: world, level: world.level,
        fileName: 'demo-world.mcworld', sourceName: 'demo-world.mcworld (sample)'
      });
      toast('Sample world loaded — this is a demo level.dat only.', 'success');
    });

    // Deep link: ?open=demo
    if (/[?&]demo=1/.test(location.search)) $('#btnDemo').click();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
