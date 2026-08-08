/* meta-tag-generator.js — generates SEO + Open Graph + Twitter tags and
   previews the social card. CSP-safe. */
import { buildMetaTags } from '../validate/web-tags.js';

const $ = (id) => document.getElementById(id);

function hostOf(url) {
  try { return new URL(url).host; } catch (_) { return 'yourdomain.example'; }
}

function render() {
  const t = {
    title: $('tTitle').value,
    description: $('tDesc').value,
    url: $('tUrl').value,
    image: $('tImage').value,
    type: $('tType').value,
    siteName: $('tSite').value,
    twitterHandle: $('tTwitter').value,
    keywords: $('tKeywords').value,
    robots: $('tRobots').value
  };
  $('metaOut').textContent = buildMetaTags(t);

  /* Social card preview */
  $('ogSite').textContent = t.siteName || hostOf(t.url);
  $('ogTitle').textContent = t.title || '—';
  const desc = t.description;
  $('ogDesc').textContent = desc ? (desc.length > 120 ? desc.slice(0, 120) + '…' : desc) : 'Add a description and the card preview comes alive.';

  const imgBox = $('ogImg');
  imgBox.textContent = '';
  if (t.image) {
    const img = document.createElement('img');
    img.src = t.image;
    img.alt = '';
    img.addEventListener('error', function () {
      if (img.parentNode) img.parentNode.removeChild(img);
      imgBox.textContent = 'og:image could not be loaded here — it will still work in platform debuggers.';
      imgBox.classList.remove('og-card-img--has');
    });
    imgBox.appendChild(img);
    imgBox.classList.add('og-card-img--has');
  } else {
    imgBox.textContent = 'Preview image appears here if you set og:image';
    imgBox.classList.remove('og-card-img--has');
  }

  const detected = $('metaDetected');
  const notes = [];
  if (t.title && t.title.length > 60) {
    notes.push('Title is ' + t.title.length + ' characters — search usually truncates around 60.');
  }
  if (desc && desc.length > 160) {
    notes.push('Description is ' + desc.length + ' characters — it may truncate in snippets.');
  }
  detected.className = 'chk-detected' + (notes.length ? ' is-error' : '');
  detected.textContent = notes.length
    ? notes.join(' ')
    : 'Generated ' + $('metaOut').textContent.split('\n').filter(Boolean).length + ' lines — paste them into the page head.';
}

function wire() {
  $('fGenerate').addEventListener('click', render);
  ['tTitle', 'tDesc', 'tUrl', 'tType', 'tSite', 'tTwitter', 'tKeywords', 'tRobots', 'tImage'].forEach(function (id) {
    $(id).addEventListener('input', render);
  });
  $('fSample').addEventListener('click', function () {
    $('tTitle').value = 'JSON Formatter — Pretty-Print & Minify JSON | The Antigle';
    $('tDesc').value = 'Pretty-print, validate, and minify JSON instantly in your browser. Clear error messages with exact line and column. Free, no upload.';
    $('tUrl').value = 'https://yourdomain.example/tools/json-formatter/';
    $('tImage').value = 'https://yourdomain.example/assets/img/social.png';
    $('tType').value = 'website';
    $('tSite').value = 'The Antigle';
    $('tTwitter').value = '@theantigle';
    $('tKeywords').value = 'json, formatter, validator, web tools';
    $('tRobots').value = 'index, follow';
    render();
  });
}

function init() {
  render();
  wire();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}