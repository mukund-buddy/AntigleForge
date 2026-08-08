/* thumbnail-downloader.js — preview each thumbnail size, verify real
   dimensions, and open the original file for Save-image-as saving.
   CSP-safe: DOM APIs + textContent; images from i.ytimg.com. */
import { showToast } from '../components/tg-toast.js';
import { parseVideoId, THUMB_SIZES, thumbnailUrl } from '../validate/youtube.js';

const $ = (id) => document.getElementById(id);

const SAMPLE_URL = 'https://www.youtube.com/watch?v=kpdVvvglzSo';
const PLACEHOLDER_W = 120;

let currentId = null;
let activeSize = null;

function renderError(msg) {
  const err = $('urlError');
  err.hidden = false;
  err.textContent = msg;
  $('detected').textContent = '';
  ['tabs', 'preview', 'actions', 'thumbGrid'].forEach(function (id) { $(id).hidden = true; });
  $('previewNote').hidden = true;
  $('gridNote').textContent = '';
}

function clearError() {
  $('urlError').hidden = true;
  $('urlError').textContent = '';
}

function buildTabs() {
  const tabs = $('tabs');
  tabs.textContent = '';
  tabs.hidden = false;
  THUMB_SIZES.forEach(function (size) {
    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (size.key === activeSize ? ' is-active' : '');
    btn.type = 'button';
    btn.setAttribute('role', 'tab');
    btn.dataset.size = size.key;
    btn.title = size.label;
    btn.textContent = size.tab;
    btn.addEventListener('click', function () { selectSize(size.key); });
    tabs.appendChild(btn);
  });
}

function selectSize(key) {
  if (!currentId) return;
  activeSize = key;
  const tabs = $('tabs');
  Array.prototype.forEach.call(tabs.children, function (btn) {
    const on = btn.dataset.size === key;
    btn.classList.toggle('is-active', on);
    btn.setAttribute('aria-selected', String(on));
  });

  const img = $('previewImg');
  img.removeAttribute('src');
  $('preview').hidden = false;
  $('actions').hidden = false;
  $('openTab').href = thumbnailUrl(currentId, key);
  $('previewNote').hidden = true;
  $('previewNote').textContent = '';

  const probe = new Image();
  probe.onload = function () {
    if (activeSize !== key) return;
    const realW = probe.naturalWidth;
    const realH = probe.naturalHeight;
    const note = $('previewNote');
    note.hidden = false;
    if (key !== 'default' && realW <= PLACEHOLDER_W) {
      note.innerHTML = '';
      note.appendChild(document.createTextNode('This size does not exist for this video — YouTube serves a grey placeholder instead. Try the hqdefault size.'));
      note.classList.add('thumb-miss');
    } else {
      note.classList.remove('thumb-miss');
      note.textContent = 'Actual file size: ' + realW + '×' + realH + ' px — this is what gets saved.';
    }
    img.src = thumbnailUrl(currentId, key);
    img.width = Math.min(realW || 480, 640);
    img.alt = 'Preview of the ' + key + ' thumbnail size';
  };
  probe.onerror = function () {
    if (activeSize !== key) return;
    const note = $('previewNote');
    note.hidden = false;
    note.classList.remove('thumb-miss');
    note.textContent = 'Preview could not be loaded from YouTube right now — the link below still works.';
  };
  probe.src = thumbnailUrl(currentId, key);
}

function buildGrid() {
  const grid = $('thumbGrid');
  grid.textContent = '';
  grid.hidden = false;
  $('gridNote').textContent = 'Quick sizes — click a tab above for the full preview.';
  $('gridNote').hidden = false;

  THUMB_SIZES.forEach(function (size) {
    const row = document.createElement('div');
    row.className = 'thumb-row';

    const lbl = document.createElement('span');
    lbl.className = 'thumb-row-lbl';
    const strong = document.createElement('span');
    strong.textContent = size.label;
    const dims = document.createElement('small');
    dims.textContent = size.width + '×' + size.height;
    lbl.appendChild(strong);
    lbl.appendChild(dims);

    const url = document.createElement('span');
    url.className = 'thumb-row-url';
    url.textContent = thumbnailUrl(currentId, size.key);

    const open = document.createElement('a');
    open.className = 'btn btn-ghost';
    open.href = url.textContent;
    open.target = '_blank';
    open.rel = 'noopener';
    open.textContent = 'Open';

    row.appendChild(lbl);
    row.appendChild(url);
    row.appendChild(open);
    grid.appendChild(row);
  });
}

function render() {
  const parsed = parseVideoId($('videoUrl').value);
  if (!parsed.ok) {
    renderError(parsed.reason === 'empty' ? '' : 'Could not find a video ID in that link.');
    currentId = null;
    return;
  }
  clearError();
  currentId = parsed.id;
  activeSize = 'maxresdefault';
  $('detected').textContent = 'Video ID — ' + currentId;
  buildTabs();
  selectSize(activeSize);
  buildGrid();
}

function wire() {
  $('fFetch').addEventListener('click', render);
  $('fSample').addEventListener('click', function () {
    $('videoUrl').value = SAMPLE_URL;
    render();
    showToast('Sample link loaded');
  });
  $('videoUrl').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      render();
    }
  });
  $('videoUrl').addEventListener('input', clearError);
}

function init() {
  wire();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
