# dev-mochi

**Context enhancement for Claude Code.** Replace pet sprites with project context.

Claude Code reserves screen real estate for a status line — rendered client-side, refreshed after every message, costing **zero API tokens**. Most plugins fill this space with virtual pets, XP bars, and personality quips. Dev-mochi fills it with your project's mission, roadmap, and progress.

The status line is the one free slot in Claude Code where you can surface information at zero cost. Dev-mochi is built around that asymmetry: put project context where it's free (the terminal, for the human), and keep CLAUDE.md lean (the context window, for the AI).

## What it looks like

```
◆ YOUR-PROJECT · Rebuild auth flow and deploy to staging │ staging → my-app.web.app
⎇ feature/auth* │ Opus 4.6 (1M context) │ ━━━━━━──────── 38%
5h ◆◆◆◆◆◇◇◇◇◇ 50% 7m→14:20 │ 7d ◆◆◆◇◇◇◇◇◇◇ 33% 2d→04/16 │ +240/-85 ↓48.0K↑95.0K
■ Auth  ■ API routes  ▶ Dashboard  □ E2E tests  □ Deploy
ROADMAP │ NOW: Rebuild auth flow with session tokens
Node.js · Express · PostgreSQL │ Self-hosted identity layer for SMBs
```

**Six lines. Always visible. Zero tokens consumed.**

| Line | Content |
|------|---------|
| 1 | Project name, mission, stage, deploy target |
| 2 | Git branch, model, context window usage |
| 3 | Rate limits (5h/7d), lines changed, tokens in/out |
| 4 | Feature tracker with status icons |
| 5 | **Rotating context** — cycles every 6 seconds (see below) |
| 6 | Tech stack and design brief |

### Line 5 rotation

Every 6 seconds, line 5 advances to the next panel. Full cycle in ~90 seconds:

```
PITCH    │ Self-hosted identity layer — own your auth, own your users
VISION   │ Every SMB runs their own auth instead of renting it from Big Tech
MOAT     │ Zero vendor lock-in. Runs on a $5 VPS. No cloud dependencies
MOONSHOT │ Federated identity mesh across SMB networks
FRUIT    │ Session token rotation is a one-liner — just hasn't been wired
WIN      │ Login flow works E2E on staging with test credentials
SITREP   │ Auth rebuilt. API routes done. Dashboard blocked on token refresh
EPOCHS   │ ■ Purified → ▶ Anchored → □ Distributed
ROADMAP  │ NEXT: Dashboard integration with new session tokens
NEXT     │ 1. Wire token refresh into dashboard middleware
RISK     │ Scope creep into OAuth / Session fixation on shared hosts
```

## Install

```bash
git clone https://github.com/midnightnow/dev-mochi.git ~/.claude/dev-mochi
```

Add to `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "node ~/.claude/dev-mochi/statusline.js",
    "refreshInterval": 6
  }
}
```

## Configure

Drop a `.devmochi.json` in your project root:

```json
{
  "name": "YOUR-PROJECT",
  "mission": "What you're building or fixing right now",
  "pitch": "Why this project exists — one sentence",
  "vision": "What this becomes at scale",
  "moonshot": "The 10x dream if everything works",
  "sit_rep": "What's working, what's broken, where's momentum",
  "brief": "Design constraint one-liner",
  "stack": "Your tech stack",
  "stage": "staging",
  "target": "your-deploy-url.web.app",
  "roadmap": [
    "NOW: What you're building this week",
    "NEXT: What unlocks after NOW ships",
    "THEN: The medium-term play",
    "MOON: The endgame"
  ],
  "next_steps": [
    "Immediate action 1",
    "Immediate action 2"
  ],
  "tracker": [
    { "label": "Feature A", "status": "done" },
    { "label": "Feature B", "status": "active" },
    { "label": "Feature C", "status": "pending" },
    { "label": "Feature D", "status": "blocked" }
  ]
}
```

### Tracker icons

| Status | Icon | Meaning |
|--------|------|---------|
| `done` | ■ green | Shipped |
| `active` | ▶ yellow | In progress |
| `blocked` | ■ red | Stuck |
| `pending` | □ dim | Not started |

## Context dilution vs context enhancement

Claude Code injects system context on every turn: git status, CLAUDE.md, memory files, branch info. These are useful but they consume input tokens every message. The more you put in CLAUDE.md, the more you pay per turn.

The status line is the exception — the one injection point that costs zero tokens.

Most status line plugins fill this free space with entertainment: pixel sprites, hunger meters, XP progress bars, sassy quips about your code. This is **context dilution** — splitting your attention between entertainment and engineering.

Dev-mochi uses the same space for **context enhancement**. When your project name, deploy target, feature tracker, and current mission are always visible in the terminal, your prompts get more precise. More precise prompts mean less wasted output. Less wasted output means less context consumed per turn. The status line costs nothing but compresses your token spend everywhere else.

## Moonshot Protocol (MP-1)

A structured config format for defining a project so every agent session starts oriented. If you can articulate these 10 things, context loss stops being a problem.

| # | Field | What it answers |
|---|-------|----------------|
| 1 | **Vision** | Where does this go in 10 years? |
| 2 | **Mission** | What's the unsexy lever we're pulling today? |
| 3 | **Pitch** | One sentence — why does this matter? |
| 4 | **Roadmap** | What are the verifiable state changes (not dates)? |
| 5 | **Moonshot** | What's the 10x outcome? |
| 6 | **Low-Hanging Fruit** | What gaps just need execution, not thinking? |
| 7 | **Quick Wins** | What proves viability in 24 hours? |
| 8 | **Next Steps** | What's the immediate technical sequence? |
| 9 | **Current Project** | Name and scope of the beast |
| 10 | **Sit Rep** | What's broken, working, and where's momentum? |

All 10 fields rotate on line 5. Additional MP-1 fields:

```json
{
  "protocol": "MP-1",
  "moat": "What makes this impossible to copy in 24 hours",
  "low_hanging": ["Gap that just needs execution"],
  "quick_wins": ["24-hour proof of viability"],
  "sit_rep": "Honest current status",
  "epochs": [
    { "name": "Purified", "status": "done" },
    { "name": "Anchored", "status": "active" },
    { "name": "Distributed", "status": "pending" }
  ],
  "pre_mortem": ["How this fails", "And what kills it"]
}
```

## Multi-agent use

The `.devmochi.json` is designed to be the single source of truth across all contexts:

- **Worktrees** — symlink so every worktree agent sees the same mission
- **Subagents** — status line runs per-agent, each one reads the config
- **New sessions** — no ramp-up, the project context is already visible
- **Handoffs** — paste the JSON into a new conversation for instant orientation
- **CLAUDE.md** — reference the file so the AI reads it too (opt-in, costs tokens)

## Technical

- **Zero dependencies** — Node.js stdlib only. Nothing to install, nothing to break.
- **<5ms render** — reads JSON, writes ANSI to stdout.
- **10-directory walk** — finds `.devmochi.json` from any subdirectory or worktree depth.
- **Dual schema** — flat config for simple projects, structured/nested for complex ones.
- **ANSI truecolor** — context bars, rate limit diamonds, tracker icons, color-coded panels.

## Inspired by

- [claude-code-tamagotchi](https://github.com/Ido-Levi/claude-code-tamagotchi) — behavioral enforcement pet
- [tokburn](https://github.com/nicholasgriffintn/tokburn) — Tokemon status line with sprites and XP

Dev-mochi takes the opposite approach. The project is the creature. Feed it commits, not kibble.

## License

MIT
