/*
 * mcworld.js — open, edit and rebuild Minecraft Bedrock world archives (.mcworld / .zip)
 * and Bedrock level.dat files. 100% client-side.
 */
(function (global) {
  'use strict';

  var fflate = global.fflate;
  var NBT = global.NBT;

  var GZIP_MAGIC = [0x1f, 0x8b];

  function isGzip(bytes, at) {
    at = at || 0;
    return bytes.length > at + 1 && bytes[at] === GZIP_MAGIC[0] && bytes[at + 1] === GZIP_MAGIC[1];
  }

  function isZlib(bytes, at) {
    at = at || 0;
    if (bytes.length < at + 2) return false;
    var cmf = bytes[at];
    var flg = bytes[at + 1];
    return (cmf & 0x0f) === 8 && (cmf >> 4) <= 7 && (((cmf << 8) | flg) % 31) === 0;
  }

  function textOf(bytes) {
    return new TextDecoder('utf-8').decode(bytes);
  }

  /* ------------------------------------------------------------- level.dat */

  /**
   * Bedrock level.dat is normally: [int32 version][int32 uncompressed length][gzip NBT].
   * Some older worlds are plain gzip or zlib; be liberal on read.
   */
  function decodeLevelDat(bytes, preferEndian) {
    var prefix = null;
    var compression = 'none';
    var raw = bytes;

    if (isGzip(bytes, 0)) {
      compression = 'gzip';
      raw = fflate.gunzipSync(bytes);
    } else if (isZlib(bytes, 0)) {
      compression = 'zlib';
      raw = fflate.unzlibSync(bytes);
    } else if (isGzip(bytes, 8)) {
      compression = 'gzip';
      prefix = bytes.slice(0, 8);
      raw = fflate.gunzipSync(bytes.subarray(8));
    } else if (isZlib(bytes, 8)) {
      compression = 'zlib';
      prefix = bytes.slice(0, 8);
      raw = fflate.unzlibSync(bytes.subarray(8));
    }

    var parsed = NBT.parseAuto(raw, 0, preferEndian || 'little');

    return {
      root: parsed.root,
      endian: parsed.endian,
      compression: compression,
      prefix: prefix,
      raw: raw,
      trailing: parsed.trailing,
      originalBytes: bytes
    };
  }

  function encodeLevelDat(level, rootNode) {
    var raw = NBT.serialize(rootNode || level.root, {
      littleEndian: level.endian !== 'big'
    });

    var body;
    if (level.compression === 'zlib') body = fflate.zlibSync(raw, { level: 6 });
    else if (level.compression === 'gzip') body = fflate.gzipSync(raw, { level: 6 });
    else body = raw;

    if (!level.prefix) return body;

    // Rebuild the 8-byte Bedrock header with the new uncompressed length.
    var out = new Uint8Array(8 + body.length);
    out.set(level.prefix, 0);
    var dv = new DataView(out.buffer);
    dv.setInt32(0, new DataView(level.prefix.buffer, level.prefix.byteOffset, 8).getInt32(0, true), true);
    dv.setInt32(4, raw.length, true);
    out.set(body, 8);
    return out;
  }

  var MAX_ENTRIES = 20000;
  var MAX_TOTAL_BYTES = 512 * 1024 * 1024;

  /** Normalise an archive path: forward slashes, no absolute paths, no '..'. */
  function safePath(path) {
    var out = [];
    String(path)
      .replace(/\\/g, '/')
      .split('/')
      .forEach(function (seg) {
        if (!seg || seg === '.') return;
        if (seg === '..') { out.pop(); return; }
        out.push(seg.replace(/[\u0000-\u001f]/g, ''));
      });
    return out.join('/');
  }

  /* ------------------------------------------------------------- archive IO */

  function unzipAsync(bytes) {
    return new Promise(function (resolve, reject) {
      fflate.unzip(bytes, function (err, files) {
        if (err) reject(new Error('Could not read this archive: ' + err.message));
        else resolve(files);
      });
    });
  }

  function zipAsync(entries, onProgress) {
    return new Promise(function (resolve, reject) {
      fflate.zip(entries, { level: 6 }, function (err, data) {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  /**
   * World model held entirely in memory.
   *   entries: Map<path, { data: Uint8Array, dirty: boolean }>
   */
  function World(name) {
    this.name = name || 'world';
    this.entries = new Map();
    this.levelPath = 'level.dat';
    this.level = null;         // decoded level.dat
    this.levelError = null;
    this.dirty = false;
  }

  World.prototype.paths = function () {
    return Array.from(this.entries.keys()).sort(function (a, b) {
      return a.localeCompare(b, 'en', { numeric: true });
    });
  };

  World.prototype.get = function (path) {
    var e = this.entries.get(path);
    return e ? e.data : null;
  };

  World.prototype.has = function (path) { return this.entries.has(path); };

  World.prototype.put = function (path, data) {
    this.entries.set(path, { data: data, dirty: true });
    this.dirty = true;
  };

  World.prototype.remove = function (path) {
    var ok = this.entries.delete(path);
    if (ok) this.dirty = true;
    if (path === this.levelPath) { this.level = null; this.levelError = null; }
    return ok;
  };

  World.prototype.rename = function (from, to) {
    if (!this.entries.has(from)) return false;
    var e = this.entries.get(from);
    this.entries.delete(from);
    this.entries.set(to, e);
    if (from === this.levelPath) this.levelPath = to;
    this.dirty = true;
    return true;
  };

  World.prototype.loadLevel = function () {
    var bytes = this.get(this.levelPath);
    this.levelError = null;
    if (!bytes) { this.level = null; return null; }
    try {
      this.level = decodeLevelDat(bytes);
      return this.level;
    } catch (err) {
      this.level = null;
      this.levelError = err.message;
      return null;
    }
  };

  /** Suggest a sane .mcworld filename from LevelName. */
  World.prototype.suggestFileName = function () {
    var node = this.level && NBT.findChild(this.level.root, 'LevelName');
    var base = (node && node.type === NBT.T.STRING && node.value) || this.name || 'world';
    var clean = String(base)
      .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '-')
      .trim()
      .replace(/^\++/, '')
      .replace(/\s+/g, ' ');
    return (clean || 'world') + '.mcworld';
  };

  World.prototype.fileName = function () {
    if (this.name && /\.mcworld$|\.zip$|\.mctemplate$/i.test(this.name)) return this.name;
    return this.suggestFileName();
  };

  World.prototype.build = function () {
    // Always write the live level.dat tree, even if nothing called put() for it.
    if (this.level) {
      this.entries.set(this.levelPath, { data: encodeLevelDat(this.level), dirty: true });
    }
    var obj = {};
    var paths = this.paths();
    for (var i = 0; i < paths.length; i++) {
      var data = this.get(paths[i]);
      if (data) obj[paths[i]] = data;
    }
    return zipAsync(obj);
  };

  /* ------------------------------------------------------------- entry points */

  /**
   * Open an .mcworld/.zip archive from raw bytes.
   */
  function openArchive(bytes, fileName) {
    return unzipAsync(bytes).then(function (files) {
      var names = Object.keys(files);
      if (!names.length) throw new Error('That archive is empty.');
      if (names.length > MAX_ENTRIES) throw new Error('That archive has too many files.');

      var total = 0;
      names.forEach(function (n) { total += files[n].length; });
      if (total > MAX_TOTAL_BYTES) {
        throw new Error('That world is larger than ' + Math.round(MAX_TOTAL_BYTES / 1048576) + ' MB — too big to unpack safely in a browser.');
      }

      var world = new World(fileName || 'world');
      // Some worlds are zipped with a single wrapper folder — strip it.
      var prefix = null;
      if (names.every(function (n) { return n.indexOf('/') > 0; })) {
        var first = names[0].split('/')[0] + '/';
        if (names.every(function (n) { return n.indexOf(first) === 0; })) prefix = first;
      }
      names.forEach(function (n) {
        var path = safePath(prefix ? n.slice(prefix.length) : n);
        if (!path) return;
        world.entries.set(path, { data: files[n], dirty: false });
      });
      if (!world.has('level.dat')) {
        var alt = world.paths().filter(function (p) { return /(^|\/)level\.dat$/i.test(p); })[0];
        if (alt) world.levelPath = alt;
      }
      world.loadLevel();
      return world;
    });
  }

  /**
   * Build a world from individually picked files (folder upload).
   * Accepts [{ path, bytes }].
   */
  function openFiles(fileList) {
    var world = new World('world');
    var common = null;
    fileList.forEach(function (f) {
      var p = safePath(f.path);
      if (!p) return;
      var parts = p.split('/');
      // Drop the chosen folder itself if every file shares it.
      if (common === null) common = parts[0];
      else if (common !== parts[0]) common = '';
      world.entries.set(p, { data: f.bytes, dirty: false });
    });
    if (common) {
      var pre = common + '/';
      var all = Array.from(world.entries.keys());
      if (all.length && all.every(function (p) { return p.indexOf(pre) === 0; })) {
        all.forEach(function (p) {
          var e = world.entries.get(p);
          world.entries.delete(p);
          world.entries.set(p.slice(pre.length), e);
        });
      }
    }
    var levelPath = world.paths().filter(function (p) { return /(^|\/)level\.dat$/i.test(p); })[0];
    if (levelPath) world.levelPath = levelPath;
    world.loadLevel();
    return world;
  }

  /** A small, valid demo level.dat so the editor can be tried without a world. */
  function demoLevelDat() {
    var T = NBT.T;
    function tag(type, name, value) { return { type: type, name: name, value: value }; }
    var root = {
      type: T.COMPOUND,
      name: '',
      value: [
        tag(T.INT, 'StorageVersion', 10),
        tag(T.STRING, 'LevelName', 'Demo World'),
        tag(T.INT, 'GameType', 1),
        tag(T.INT, 'Difficulty', 2),
        tag(T.BYTE, 'commandsEnabled', 1),
        tag(T.BYTE, 'hasBeenLoadedInCreative', 1),
        tag(T.INT, 'SpawnX', 0),
        tag(T.INT, 'SpawnY', 64),
        tag(T.INT, 'SpawnZ', 0),
        tag(T.LONG, 'RandomSeed', 123456789n),
        tag(T.LONG, 'Time', 6000n),
        tag(T.LONG, 'currentTick', 3000n),
        tag(T.LONG, 'LastPlayed', BigInt(Date.now())),
        tag(T.COMPOUND, 'GameRules', [
          tag(T.COMPOUND, 'showcoordinates', [tag(T.STRING, 'Name', 'showcoordinates'), tag(T.STRING, 'Value', 'true')]),
          tag(T.COMPOUND, 'doDaylightCycle', [tag(T.STRING, 'Name', 'doDaylightCycle'), tag(T.STRING, 'Value', 'true')]),
          tag(T.COMPOUND, 'keepinventory', [tag(T.STRING, 'Name', 'keepinventory'), tag(T.STRING, 'Value', 'false')])
        ])
      ]
    };
    var raw = NBT.serialize(root, { littleEndian: true });
    var body = fflate.gzipSync(raw, { level: 6 });
    var out = new Uint8Array(8 + body.length);
    var dv = new DataView(out.buffer);
    dv.setInt32(0, 10, true);
    dv.setInt32(4, raw.length, true);
    out.set(body, 8);
    var level = decodeLevelDat(out);
    var w = new World('demo-world');
    w.entries.set('level.dat', { data: out, dirty: false });
    w.entries.set('levelname.txt', { data: new TextEncoder().encode('Demo World'), dirty: false });
    w.level = level;
    return w;
  }

  global.MCWorld = {
    World: World,
    openArchive: openArchive,
    openFiles: openFiles,
    decodeLevelDat: decodeLevelDat,
    encodeLevelDat: encodeLevelDat,
    demoLevelDat: demoLevelDat,
    textOf: textOf
  };
})(typeof window !== 'undefined' ? window : globalThis);
