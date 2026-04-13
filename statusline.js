#!/usr/bin/env node
/**
 * dev-mochi v3 — Project-focused status line for Claude Code
 *
 * The project IS the beast. Every line keeps the AI focused on what
 * we're building, why, and what's next. No sprites. No quips. No XP.
 *
 * Moonshot Protocol (MP-1) — 10 fields:
 *   1. vision          — 10-year North Star
 *   2. mission         — unsexy engineering lever
 *   3. pitch           — high-compression signal
 *   4. roadmap/epochs  — verifiable state changes, not dates
 *   5. moonshot        — 10x non-linear goal
 *   6. low_hanging     — structural gaps, zero trying
 *   7. quick_wins      — 24-hour proof of viability
 *   8. next_steps      — immediate technical sequence
 *   9. name/project    — name + scope of the beast
 *  10. sit_rep         — what's broken, working, where's momentum
 *
 * Plus: moat, constraints, tracker, stack, stage, target
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
  magenta: fg(180, 100, 180),
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

// ── Config Loader + Schema Normalizer ───────────────────────────────────────

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

// Normalize nested or flat schema into a uniform interface
function normalize(raw) {
  if (!raw) return null;

  // Detect nested schema by presence of identity/vision objects
  const nested = raw.identity && typeof raw.identity === 'object';

  return {
    // Protocol
    protocol:  raw.protocol || null,

    // Identity
    name:      nested ? raw.identity.name : raw.name,
    geometry:  nested ? raw.identity.geometry : raw.geometry,
    manifold:  nested ? raw.identity.manifold : raw.manifold,

    // Vision
    mission:   nested ? (raw.vision && raw.vision.mission) : raw.mission,
    pitch:     nested ? (raw.vision && raw.vision.pitch) : raw.pitch,
    moonshot:  nested ? (raw.vision && raw.vision.moonshot) : raw.moonshot,
    vision:    nested ? null : raw.vision,

    // Moat + Physics
    moat:      raw.moat || null,
    physics:   raw.physics || null,

    // Roadmap
    current_deck: nested ? (raw.roadmap && raw.roadmap.current_deck) : raw.current_deck,
    milestones:   nested ? (raw.roadmap && raw.roadmap.milestones) : null,
    roadmap:      nested ? null : raw.roadmap,

    // Epochs (MP-1: replace months with state changes)
    epochs:    raw.epochs || null,

    // First Domino (MP-1: 24-hour collapse action)
    first_domino: raw.first_domino || null,

    // Low-Hanging Fruit (MP-1: structural gaps, zero trying)
    low_hanging: raw.low_hanging || null,

    // Quick Wins (MP-1: 24-hour proof of viability)
    quick_wins: raw.quick_wins || null,

    // Sit Rep (MP-1: what's broken, working, where's momentum)
    sit_rep: raw.sit_rep || null,

    // Pre-Mortem (MP-1: black swans + circuit breakers)
    pre_mortem: raw.pre_mortem || null,

    // Constraints
    constraints: raw.constraints || null,

    // Shared fields
    stack:       raw.stack,
    stage:       raw.stage,
    target:      raw.target,
    brief:       raw.brief,
    next_steps:  raw.next_steps || [],
    tracker:     raw.tracker || [],
  };
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

// Line 1: IDENTITY — name | geometry | manifold  OR  name · mission | stage → target
function L1(cfg, cwd) {
  const name = (cfg && cfg.name) || projectName(cwd);
  let line = C.accent + BOLD + '\u25C6 ' + name.toUpperCase() + RESET;

  if (cfg && cfg.geometry) {
    line += SEP + C.white + cfg.geometry + RESET;
  }
  if (cfg && cfg.manifold) {
    line += SEP + C.gold + cfg.manifold + RESET;
  }

  // Fall back to mission for flat configs without geometry
  if (cfg && !cfg.geometry && cfg.mission) {
    line += DIM + ' \u00b7 ' + RESET + C.white + truncate(cfg.mission, 55) + RESET;
  }

  if (cfg && cfg.stage) line += SEP + C.orange + cfg.stage + RESET;
  if (cfg && cfg.target) line += DIM + ' \u2192 ' + RESET + DIM + cfg.target + RESET;

  return line;
}

// Line 2: branch | model | context bar
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
  const add = (data.cost && data.cost.total_lines_added) || 0;
  const rem = (data.cost && data.cost.total_lines_removed) || 0;
  const tIn = (data.context_window && data.context_window.total_input_tokens) || 0;
  const tOut = (data.context_window && data.context_window.total_output_tokens) || 0;
  let stats = C.green + '+' + add + RESET + DIM + '/' + RESET + C.red + '-' + rem + RESET;
  if (tIn || tOut) stats += DIM + ' \u2193' + RESET + abbreviate(tIn) + DIM + '\u2191' + RESET + abbreviate(tOut);
  parts.push(stats);
  return parts.join(SEP);
}

// Line 4: tracker OR constraints
function L4(cfg) {
  if (!cfg) return DIM + '\u254C'.repeat(60) + RESET;

  const parts = [];

  // Tracker items
  if (cfg.tracker && cfg.tracker.length) {
    parts.push(cfg.tracker.slice(0, 6).map(t =>
      (ICO[t.status] || ICO.pending) + ' ' + DIM + t.label + RESET
    ).join('  '));
  }

  // Constraints inline (if present and room)
  if (cfg.constraints) {
    const cParts = [];
    if (cfg.constraints.currency) cParts.push(C.orange + cfg.constraints.currency + RESET);
    if (cfg.constraints.revenue) cParts.push(C.muted + cfg.constraints.revenue + RESET);
    if (cfg.constraints.forbidden && cfg.constraints.forbidden.length) {
      cParts.push(C.red + '\u2718 ' + cfg.constraints.forbidden.join(', ') + RESET);
    }
    if (cParts.length) {
      if (parts.length) parts.push(SEP);
      parts.push(cParts.join(DIM + ' \u00b7 ' + RESET));
    }
  }

  return parts.length ? parts.join('') : DIM + '\u254C'.repeat(60) + RESET;
}

// Line 5: rotating context — cycles through all project dimensions + MP-1 protocol
function L5(cfg) {
  if (!cfg) return '';

  const panels = [];

  // Mission (always first if geometry is on line 1)
  if (cfg.geometry && cfg.mission) {
    panels.push({ label: 'MISSION', text: cfg.mission, color: C.white });
  }

  // Pitch
  if (cfg.pitch) panels.push({ label: 'PITCH', text: cfg.pitch, color: C.gold });

  // Vision (flat schema)
  if (cfg.vision) panels.push({ label: 'VISION', text: cfg.vision, color: C.blue });

  // Moat (MP-1)
  if (cfg.moat) panels.push({ label: 'MOAT', text: cfg.moat, color: C.green });

  // Moonshot
  if (cfg.moonshot) panels.push({ label: 'MOONSHOT', text: cfg.moonshot, color: C.accent });

  // Physics (MP-1: hard limits)
  if (cfg.physics) panels.push({ label: 'PHYSICS', text: cfg.physics, color: C.gold });

  // Low-Hanging Fruit (MP-1: structural gaps, zero trying)
  if (cfg.low_hanging && cfg.low_hanging.length) {
    cfg.low_hanging.forEach(f => {
      panels.push({ label: 'FRUIT', text: typeof f === 'string' ? f : f.text || f, color: C.green });
    });
  } else if (cfg.low_hanging && typeof cfg.low_hanging === 'string') {
    panels.push({ label: 'FRUIT', text: cfg.low_hanging, color: C.green });
  }

  // Quick Wins (MP-1: 24-hour proof)
  if (cfg.quick_wins && cfg.quick_wins.length) {
    cfg.quick_wins.forEach(w => {
      panels.push({ label: 'WIN', text: typeof w === 'string' ? w : w.text || w, color: C.gold });
    });
  } else if (cfg.quick_wins && typeof cfg.quick_wins === 'string') {
    panels.push({ label: 'WIN', text: cfg.quick_wins, color: C.gold });
  }

  // First Domino (MP-1: 24hr collapse action)
  if (cfg.first_domino) panels.push({ label: 'DOMINO', text: cfg.first_domino, color: C.red });

  // Sit Rep (MP-1: current state of the battlefield)
  if (cfg.sit_rep) panels.push({ label: 'SITREP', text: cfg.sit_rep, color: C.yellow });

  // Epochs (MP-1: state transitions, not months)
  if (cfg.epochs && cfg.epochs.length) {
    const epochStr = cfg.epochs.map((e, i) => {
      if (typeof e === 'string') return e;
      // Support { name, status } objects
      const ico = e.status === 'done' ? '\u25A0' : e.status === 'active' ? '\u25B6' : '\u25A1';
      return ico + ' ' + (e.name || e);
    }).join(' \u2192 ');
    panels.push({ label: 'EPOCHS', text: epochStr, color: C.magenta });
  }

  // Current deck (nested schema)
  if (cfg.current_deck) {
    panels.push({ label: 'DECK', text: cfg.current_deck, color: C.magenta });
  }

  // Milestones (nested schema)
  if (cfg.milestones && cfg.milestones.length) {
    cfg.milestones.forEach(m => {
      panels.push({ label: 'MILESTONE', text: m, color: C.orange });
    });
  }

  // Roadmap (flat schema)
  if (cfg.roadmap && cfg.roadmap.length) {
    cfg.roadmap.forEach(r => {
      panels.push({ label: 'ROADMAP', text: r, color: C.orange });
    });
  }

  // Next steps
  if (cfg.next_steps && cfg.next_steps.length) {
    cfg.next_steps.forEach((s, i) => {
      panels.push({ label: 'NEXT', text: (i + 1) + '. ' + s, color: C.cyan });
    });
  }

  // Pre-Mortem (MP-1: black swans — surfaces risks so agents don't walk into them)
  if (cfg.pre_mortem && cfg.pre_mortem.length) {
    const risks = cfg.pre_mortem.map(r => typeof r === 'string' ? r : r.risk || r).join(' / ');
    panels.push({ label: 'RISK', text: risks, color: C.red });
  }

  // Constraints platform
  if (cfg.constraints && cfg.constraints.platform) {
    panels.push({ label: 'PLATFORM', text: cfg.constraints.platform, color: C.muted });
  }

  if (panels.length === 0) return '';

  const idx = Math.floor(Date.now() / 6000) % panels.length;
  const p = panels[idx];
  return p.color + BOLD + p.label + RESET + SEP + C.white + truncate(p.text, 70) + RESET;
}

// Line 6: stack | brief
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
const raw = loadConfig(cwd);
const cfg = normalize(raw);
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
