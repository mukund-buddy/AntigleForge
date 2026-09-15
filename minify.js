#!/usr/bin/env node

/**
 * AntigleForge Minifier
 * Minifies JS and CSS files for faster loading
 * Usage: node minify.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

// ==================== JS MINIFIER ====================
function minifyJS(code) {
  let result = code;

  // Remove multi-line comments (preserve license comments with @preserve or /*!)
  result = result.replace(/\/\*(?![\s\S]*?\*\/)[\s\S]*?\*\//g, '');

  // Remove single-line comments (but not URLs with //)
  result = result.replace(/(?<![:"'])\/\/.*$/gm, '');

  // Remove leading/trailing whitespace per line
  result = result.replace(/^\s+|\s+$/gm, '');

  // Remove empty lines
  result = result.replace(/\n\s*\n/g, '\n');

  // Collapse multiple spaces to one
  result = result.replace(/  +/g, ' ');

  // Remove newlines (careful with semicolons)
  result = result.replace(/\n/g, ' ');

  // Remove spaces around operators
  result = result.replace(/\s*([{}();,=:+\-*/<>!&|?[\]])\s*/g, '$1');

  // Restore spaces where needed (avoid breaking keywords)
  result = result.replace(/([a-zA-Z0-9_$])([{}();,=:+\-*/<>!&|?[\]])/g, '$1 $2');
  result = result.replace(/([{}();,=:+\-*/<>!&|?[\]])([a-zA-Z0-9_$])/g, '$1 $2');

  // Add back semicolons where needed (after closing brace before identifier)
  result = result.replace(/\}([a-zA-Z$_])/g, '}$1');
  result = result.replace(/; /g, ';');
  result = result.replace(/ ;/g, ';');

  // Remove trailing semicolons before closing brace
  result = result.replace(/;\}/g, '}');

  // Clean up multiple semicolons
  result = result.replace(/;{2,}/g, ';');

  return result.trim();
}

// ==================== CSS MINIFIER ====================
function minifyCSS(code) {
  let result = code;

  // Remove comments
  result = result.replace(/\/\*[\s\S]*?\*\//g, '');

  // Remove newlines
  result = result.replace(/\n/g, ' ');

  // Collapse whitespace
  result = result.replace(/\s{2,}/g, ' ');

  // Remove spaces around selectors and braces
  result = result.replace(/\s*{\s*/g, '{');
  result = result.replace(/\s*}\s*/g, '}');
  result = result.replace(/\s*:\s*/g, ':');
  result = result.replace(/\s*;\s*/g, ';');
  result = result.replace(/\s*,\s*/g, ',');

  // Remove last semicolons before closing brace
  result = result.replace(/;}/g, '}');

  // Remove leading/trailing whitespace
  result = result.trim();

  return result;
}

// ==================== FILE PROCESSING ====================
function processDirectory(dir, stats) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules and minified output dirs
      if (entry.name === 'node_modules' || entry.name === 'min') continue;
      processDirectory(fullPath, stats);
    } else {
      const ext = path.extname(entry.name).toLowerCase();

      if (ext === '.js' && !entry.name.endsWith('.min.js')) {
        minifyFile(fullPath, 'js', stats);
      } else if (ext === '.css' && !entry.name.endsWith('.min.css')) {
        minifyFile(fullPath, 'css', stats);
      }
    }
  }
}

function minifyFile(filePath, type, stats) {
  const code = fs.readFileSync(filePath, 'utf8');
  const originalSize = Buffer.byteLength(code, 'utf8');

  let minified;
  if (type === 'js') {
    minified = minifyJS(code);
  } else {
    minified = minifyCSS(code);
  }

  const minifiedSize = Buffer.byteLength(minified, 'utf8');
  const saved = originalSize - minifiedSize;
  const percent = ((saved / originalSize) * 100).toFixed(1);

  // Create output path
  const relPath = path.relative(ROOT, filePath);
  const minPath = path.join(ROOT, 'min', relPath);
  const minDir = path.dirname(minPath);

  // Ensure output directory exists
  fs.mkdirSync(minDir, { recursive: true });

  // Write minified file
  fs.writeFileSync(minPath, minified, 'utf8');

  stats.push({
    file: relPath,
    original: originalSize,
    minified: minifiedSize,
    saved: saved,
    percent: percent
  });
}

// ==================== HTML UPDATER ====================
function updateHTMLReferences() {
  const htmlFiles = ['index.html', 'tools.html', 'tools/uuid-generator.html', 'tools/command-generator.html', 'tools/shape-generator.html'];

  for (const htmlFile of htmlFiles) {
    const fullPath = path.join(ROOT, htmlFile);
    if (!fs.existsSync(fullPath)) continue;

    let html = fs.readFileSync(fullPath, 'utf8');
    const original = html;

    // Replace CSS references: style.css -> min/style.min.css
    html = html.replace(/href="(\.\.\/)?assets\/css\/style\.css"/g, 'href="$1min/assets/css/style.min.css"');

    // Replace JS references: main.js -> min/main.min.js etc.
    html = html.replace(/src="(\.\.\/)?assets\/js\/main\.js"/g, 'src="$1min/assets/js/main.min.js"');
    html = html.replace(/src="(\.\.\/)?assets\/js\/performance\.js"/g, 'src="$1min/assets/js/performance.min.js"');
    html = html.replace(/src="(\.\.\/)?assets\/js\/components\.js"/g, 'src="$1min/assets/js/components.min.js"');
    html = html.replace(/src="(\.\.\/)?assets\/js\/tools\/command-generator\.js"/g, 'src="$1min/assets/js/tools/command-generator.min.js"');

    if (html !== original) {
      // Backup original
      const backupPath = fullPath + '.bak';
      if (!fs.existsSync(backupPath)) {
        fs.writeFileSync(backupPath, original, 'utf8');
      }
      fs.writeFileSync(fullPath, html, 'utf8');
      console.log(`  Updated references in: ${htmlFile}`);
    }
  }
}

// ==================== MAIN ====================
console.log('AntigleForge Minifier');
console.log('='.repeat(40));

const stats = [];

console.log('\nMinifying files...');
processDirectory(ROOT, stats);

// Print results
console.log('\nResults:');
console.log('-'.repeat(70));
console.log(`${'File'.padEnd(45)} ${'Before'.padStart(8)} ${'After'.padStart(8)} ${'Saved'.padStart(8)}`);
console.log('-'.repeat(70));

let totalOriginal = 0, totalMinified = 0;

for (const s of stats) {
  totalOriginal += s.original;
  totalMinified += s.minified;
  const sizeStr = formatSize(s.original);
  const minStr = formatSize(s.minified);
  const savedStr = formatSize(s.saved);
  console.log(`${s.file.padEnd(45)} ${sizeStr.padStart(8)} ${minStr.padStart(8)} ${savedStr.padStart(8)} (${s.percent}%)`);
}

console.log('-'.repeat(70));
const totalSaved = totalOriginal - totalMinified;
const totalPercent = ((totalSaved / totalOriginal) * 100).toFixed(1);
console.log(`${'TOTAL'.padEnd(45)} ${formatSize(totalOriginal).padStart(8)} ${formatSize(totalMinified).padStart(8)} ${formatSize(totalSaved).padStart(8)} (${totalPercent}%)`);

console.log(`\nMinified files saved to: min/`);
console.log(`\nTo use minified files, run: node minify.js --apply`);
console.log(`To restore originals, run: node minify.js --restore`);

if (process.argv.includes('--apply')) {
  console.log('\nUpdating HTML references...');
  updateHTMLReferences();
  console.log('Done! HTML files now point to minified versions.');
}

if (process.argv.includes('--restore')) {
  console.log('\nRestoring original files...');
  const backups = findBackups(ROOT);
  for (const b of backups) {
    fs.copyFileSync(b, b.replace('.bak', ''));
    fs.unlinkSync(b);
    console.log(`  Restored: ${path.relative(ROOT, b.replace('.bak', ''))}`);
  }
  console.log('Done!');
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  return (bytes / 1024).toFixed(1) + ' KB';
}

function findBackups(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== 'node_modules' && e.name !== 'min') {
      results.push(...findBackups(full));
    } else if (e.name.endsWith('.bak')) {
      results.push(full);
    }
  }
  return results;
}
