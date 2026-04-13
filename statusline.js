#!/usr/bin/env node
/**
 * dev-mochi — Project-focused status line for Claude Code
 *
 * The project IS the beast. Every line keeps the AI focused on what
 * we're building, why, and what's next. No sprites. No quips. No XP.
 *
 * Reads .devmochi.json from workspace root for project context.
 * Cycles through vision/pitch/roadmap/moonshot on a timer so the AI
 * always has the full picture without eating input tokens.
 *
 * Config format (.devmochi.json):
 * {
 *   "name": "PROJECT",
 *   "mission": "one-line current mission",
 *   "pitch": "one-line elevator pitch",
 *   "vision": "what this becomes",
 *   "moonshot": "the 10x dream",
 *   "stack": "tech stack summary",
 *   "stage": "staging|production|dev",
 *   "target": "deploy target URL",
 *   "roadmap": ["NOW: ...", "NEXT: ...", "THEN: ...", "MOON: ..."],
 *   "next_steps": ["step 1", "step 2", ...],
 *   "tracker": [{ "label": "Feature", "status": "done|active|blocked|pending" }]
 * }
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// ── ANSI ────────────────────────────────────────────────────────────────────

const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';
const DIM    = '\x1b[90m';
const ITALIC = '\x1b[3m';

function fg(r, g, b) { return `\x1b[38;2;${r};${g};${b}m`; }

const C = {
  green:   fg(80, 180, 80),
  yellow:  fg(200, 170, 60),
  red:     fg(200, 70, 70),
  cyan:    fg(100, 180, 200),
  orange:  fg(220, 140, 50),
  white:   fg(220, 220, 220),
  muted:   fg(120, 120, 120),
  accent:  fg(140, 120, 200),
  gold:    fg(220, 190, 80),
  blue:    fg(90, 140, 210),
};

const SEP = DIM + ' \u2502 ' + RESET;

// ── Helpers ─────────────────────────────────────────────────────────────────

function abbreviate(n) {
  n = n || 0;
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}

function fmtTime(epoch) {
  if (!epoch) return '';
  const d = epoch - Math.floor(Date.now() / 1000);
  if (d <= 0) return 'now';
  const days = Math.floor(d / 86400), hrs = Math.floor((d % 86400) / 3600), mins = Math.floor((d % 3600) / 60);
  if (days > 0) return days + 'd' + hrs + 'h';
  if (hrs > 0) return hrs + 'h' + (mins ? mins + 'm' : '');
  return mins + 'm';
}

function fmtTarget(epoch) {
  if (!epoch) return '';
  const d = epoch - Math.floor(Date.now() / 1000);
  if (d <= 0) return 'now';
  const dt = new Date(epoch * 1000);
  if (d < 86400) return String(dt.getHours()).padStart(2, '0') + ':' + String(dt.getMinutes()).padStart(2, '0');
  return String(dt.getMonth() + 1).padStart(2, '0') + '/' + String(dt.getDate()).padStart(2, '0');
}

function truncate(s, max) {
  if (!s) return '';
  return s.length > max ? s.slice(0, max - 1) + '\u2026' : s;
}

// ── Bars ────────────────────────────────────────────────────────────────────

const bG = fg(70, 160, 70), bY = fg(180, 150, 50), bR = fg(180, 60, 60), bE = fg(50, 50, 50);
function bc(p) { return p >= 80 ? bR : p >= 50 ? bY : bG; }
function pc(p) { return p >= 80 ? C.red : p >= 50 ? C.yellow : C.green; }

function ctxBar(pct, w) {
  const f = Math.round((pct / 100) * w);
  return bc(pct) + '\u2501'.repeat(f) + RESET + bE + '\u2500'.repeat(w - f) + RESET;
}

function limBar(pct, w) {
  const f = Math.round((pct / 100) * w);
  return bc(pct) + '\u25C6'.repeat(f) + RESET + bE + '\u25C7'.repeat(w - f) + RESET;
}

// ── Status Icons ────────────────────────────────────────────────────────────

const ICO = {
  done:    C.green + '\u25A0' + RESET,
  active:  C.yellow + '\u25B6' + RESET,
  blocked: C.red + '\u25A0' + RESET,
  pending: DIM + '\u25A1' + RESET,
};

// ── Project Config ──────────────────────────────────────────────────────────

function loadConfig(cwd) {
  let dir = cwd;
  for (let i = 0; i < 10; i++) {
    try { return JSON.parse(fs.readFileSync(path.join(dir, '.devmochi.json'), 'utf8')); } catch (_) {}
    const p = path.dirname(dir);
    if (p === dir) break;
    dir = p;
  }
  return null;
}

function gitBranch(cwd) {
  try {
    let b = execFileSync('git', ['-C', cwd, 'branch', '--show-current'], { encoding: 'utf8', timeout: 500, stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    const s = execFileSync('git', ['-C', cwd, 'status', '--porcelain'], { encoding: 'utf8', timeout: 500, stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    return b + (s ? '*' : '');
  } catch (_) { return ''; }
}

function projectName(cwd) {
  try { const p = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8')); if (p.name) return p.name; } catch (_) {}
  return path.basename(cwd);
}

// ── Line Builders ───────────────────────────────────────────────────────────

// Line 1: PROJECT NAME · mission | stage → target
function L1(cfg, cwd) {
  const name = (cfg && cfg.name) || projectName(cwd);
  let line = C.accent + BOLD + name.toUpperCase() + RESET;
  if (cfg && cfg.mission) line += DIM + ' \u00b7 ' + RESET + C.white + truncate(cfg.mission, 60) + RESET;
  if (cfg && cfg.stage) line += SEP + C.orange + cfg.stage + RESET;
  if (cfg && cfg.target) line += DIM + ' \u2192 ' + RESET + DIM + cfg.target + RESET;
  return line;
}

// Line 2: branch | model(size) | context bar
function L2(data, branch) {
  const parts = [];
  if (branch) parts.push(C.cyan + '\u2387 ' + RESET + branch);
  const model = (data.model && data.model.display_name) || 'Claude';
  const sz = (data.context_window && data.context_window.context_window_size) || 0;
  const alreadyHasSize = /\d+[KMG]?\s*(context|ctx)/i.test(model);
  const sizeTag = (!alreadyHasSize && sz) ? '(' + abbreviate(sz) + ')' : '';
  parts.push(DIM + model + sizeTag + RESET);
  const p = Math.round((data.context_window && data.context_window.used_percentage) || 0);
  parts.push(ctxBar(p, 14) + ' ' + pc(p) + p + '%' + RESET);
  return parts.join(SEP);
}

// Line 3: rate limits | lines | tokens
function L3(data) {
  const parts = [];
  const f5 = data.rate_limits && data.rate_limits.five_hour;
  if (f5) {
    const p = Math.round(f5.used_percentage || 0);
    const a = [fmtTime(f5.resets_at), fmtTarget(f5.resets_at)].filter(Boolean).join('\u2192');
    parts.push(DIM + '5h ' + RESET + limBar(p, 10) + ' ' + pc(p) + p + '%' + RESET + (a ? DIM + ' ' + a + RESET : ''));
  }
  const d7 = data.rate_limits && data.rate_limits.seven_day;
  if (d7) {
    const p = Math.round(d7.used_percentage || 0);
    const a = [fmtTime(d7.resets_at), fmtTarget(d7.resets_at)].filter(Boolean).join('\u2192');
    parts.push(DIM + '7d ' + RESET + limBar(p, 10) + ' ' + pc(p) + p + '%' + RESET + (a ? DIM + ' ' + a + RESET : ''));
  }
  // lines + tokens compact
  const add = (data.cost && data.cost.total_lines_added) || 0;
  const rem = (data.cost && data.cost.total_lines_removed) || 0;
  const tIn = (data.context_window && data.context_window.total_input_tokens) || 0;
  const tOut = (data.context_window && data.context_window.total_output_tokens) || 0;
  let stats = C.green + '+' + add + RESET + DIM + '/' + RESET + C.red + '-' + rem + RESET;
  if (tIn || tOut) stats += DIM + ' \u2193' + RESET + abbreviate(tIn) + DIM + '\u2191' + RESET + abbreviate(tOut);
  parts.push(stats);
  return parts.join(SEP);
}

// Line 4: tracker (feature status board)
function L4(cfg) {
  if (!cfg || !cfg.tracker || !cfg.tracker.length) return DIM + '\u254C'.repeat(60) + RESET;
  return cfg.tracker.slice(0, 8).map(t => (ICO[t.status] || ICO.pending) + ' ' + DIM + t.label + RESET).join('  ');
}

// Line 5: rotating context — cycles through vision/pitch/roadmap/moonshot/next_steps
// Each cycle is 6 seconds so you see everything in ~30s without reading tokens
function L5(cfg) {
  if (!cfg) return '';

  const panels = [];

  if (cfg.pitch) panels.push({ label: 'PITCH', text: cfg.pitch, color: C.gold });
  if (cfg.vision) panels.push({ label: 'VISION', text: cfg.vision, color: C.blue });
  if (cfg.moonshot) panels.push({ label: 'MOONSHOT', text: cfg.moonshot, color: C.accent });

  // Roadmap items as individual panels
  if (cfg.roadmap && cfg.roadmap.length) {
    cfg.roadmap.forEach(r => {
      panels.push({ label: 'ROADMAP', text: r, color: C.orange });
    });
  }

  // Next steps as individual panels
  if (cfg.next_steps && cfg.next_steps.length) {
    cfg.next_steps.forEach((s, i) => {
      panels.push({ label: 'NEXT', text: (i + 1) + '. ' + s, color: C.cyan });
    });
  }

  if (panels.length === 0) return '';

  // Cycle every 6 seconds
  const idx = Math.floor(Date.now() / 6000) % panels.length;
  const p = panels[idx];
  return p.color + BOLD + p.label + RESET + DIM + ' \u2502 ' + RESET + C.white + truncate(p.text, 70) + RESET;
}

// Line 6: stack | design brief one-liner
function L6(cfg) {
  if (!cfg) return '';
  const parts = [];
  if (cfg.stack) parts.push(DIM + cfg.stack + RESET);
  if (cfg.brief) parts.push(C.muted + ITALIC + truncate(cfg.brief, 50) + RESET);
  return parts.join(SEP);
}

// ── Main ────────────────────────────────────────────────────────────────────

let input = '';
try { if (!process.stdin.isTTY) input = fs.readFileSync(0, 'utf8'); } catch (_) {}
let data = {};
try { data = JSON.parse(input); } catch (_) {}

const cwd = (data.workspace && data.workspace.current_dir) || data.cwd || process.cwd();
const cfg = loadConfig(cwd);
const branch = gitBranch(cwd);

const lines = [
  L1(cfg, cwd),
  L2(data, branch),
  L3(data),
  L4(cfg),
  L5(cfg),
  L6(cfg),
].filter(Boolean);

process.stdout.write(lines.join('\n'));
