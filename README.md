# dev-mochi

Project-focused status line for Claude Code. The project IS the beast.

No sprites. No quips. No XP. Just your project's identity, mission, roadmap, and metrics — always visible, zero token cost.

The status line is free screen real estate that doesn't consume API tokens. Dev-mochi fills it with the one thing that keeps every agent on task: **what you're building, why, and what's next.**

## What it shows (6 lines)

```
DEV-MOCHI · Project-focused status line for Claude Code │ dev → github.com/midnightnow/dev-mochi
⎇ main │ Opus 4.6 (1M context) │ ━━━─────────── 19%
5h ◆◆◆◆◆◇◇◇◇◇ 50% 6m→13:36 │ 7d ◆◆◆◇◇◇◇◇◇◇ 33% │ +317/-173 ↓30.4K↑100.0K
■ Statusline renderer  ■ Config format  ▶ npm publish  □ Multi-project support
PITCH │ Keep every AI agent focused on your project — not on being cute
Node.js · Claude Code Status Line API
```

**Line 5 rotates** every 6 seconds through your full context:
- **PITCH** — elevator pitch
- **VISION** — what it becomes
- **MOONSHOT** — the 10x dream
- **ROADMAP** — NOW / NEXT / THEN / MOON (one per cycle)
- **NEXT** — immediate action items (one per cycle)

This is the context that gets copy-pasted into every agent, every worktree, every session. One file, one truth.

## Install

```bash
# Clone
git clone https://github.com/midnightnow/dev-mochi.git ~/.claude/dev-mochi

# Point Claude Code at it (~/.claude/settings.json)
{
  "statusLine": {
    "type": "command",
    "command": "node ~/.claude/dev-mochi/statusline.js",
    "refreshInterval": 6
  }
}
```

## Configure

Drop a `.devmochi.json` in your project root. This is the single source of truth that keeps every agent — Claude Code, worktrees, subagents — locked on your project:

```json
{
  "name": "YOUR-PROJECT",
  "mission": "One-line current mission — what you're fixing/building right now",
  "pitch": "One-line elevator pitch — why this matters",
  "vision": "What this becomes at scale",
  "moonshot": "The 10x dream — where this goes if everything works",
  "brief": "Design brief one-liner",
  "stack": "Your tech stack",
  "stage": "staging",
  "target": "your-staging-url.web.app",
  "roadmap": [
    "NOW: What you're building this week",
    "NEXT: What unlocks after NOW ships",
    "THEN: The medium-term play",
    "MOON: The endgame"
  ],
  "next_steps": [
    "Immediate action item 1",
    "Immediate action item 2",
    "Immediate action item 3"
  ],
  "tracker": [
    { "label": "Feature A", "status": "done" },
    { "label": "Feature B", "status": "active" },
    { "label": "Feature C", "status": "pending" },
    { "label": "Feature D", "status": "blocked" }
  ]
}
```

### Tracker statuses

| Status | Icon | Meaning |
|--------|------|---------|
| `done` | ■ (green) | Shipped |
| `active` | ▶ (yellow) | In progress |
| `blocked` | ■ (red) | Stuck |
| `pending` | □ (dim) | Not started |

### Fields

| Field | Purpose | Who reads it |
|-------|---------|-------------|
| `name` | Project identity — shown in BOLD on line 1 | You + every agent |
| `mission` | Current sprint goal — what's broken or being built | Keeps agents on task |
| `pitch` | Why this project exists in one sentence | Context for architectural decisions |
| `vision` | What this becomes — the product at scale | Prevents over/under-engineering |
| `moonshot` | The 10x dream | Keeps ambition visible |
| `brief` | Design constraint one-liner | Shown on line 6, always visible |
| `stage` | `dev` / `staging` / `production` | Safety gate — agents see this |
| `target` | Deploy URL | Prevents wrong-target deploys |
| `roadmap` | NOW/NEXT/THEN/MOON | Rotating on line 5 |
| `next_steps` | Immediate action items | Rotating on line 5 |
| `tracker` | Feature status board | Line 4 — at-a-glance progress |

## Multi-agent use

The `.devmochi.json` is designed to be the thing you copy-paste (or symlink) into every context that needs project awareness:

- **Worktrees**: symlink `.devmochi.json` so every worktree agent sees the same mission
- **Subagents**: the status line runs per-agent, each one sees the project context
- **New sessions**: no ramp-up — the agent reads the status line and knows the mission instantly
- **Handoffs**: paste the JSON into a new conversation and the agent has full context

## Moonshot Protocol (MP-1)

Dev-mochi supports the Moonshot Protocol — a structured way to define your project's physics so agents can't drift into hallucinated progress.

### The 10 Fields

1. **Vision** — 10-year North Star. The world state after the project succeeds.
2. **Mission** — The unsexy engineering lever. How we move the world toward the vision.
3. **Pitch** — High-compression signal. One sentence to lock the AI into the core problem.
4. **Roadmap** — Verifiable milestones (Epochs). State changes, not dates.
5. **Moonshot** — The 10x goal. Radical outcomes requiring non-linear thinking.
6. **Low-Hanging Fruit** — Structural gaps that require zero "trying" — just execution.
7. **Quick Wins** — High-visibility victories to prove viability within 24 hours.
8. **Next Steps** — The immediate technical sequence.
9. **Current Project** — Name and scope of the beast being built.
10. **Sit Rep** — What's broken, what's working, where the momentum is right now.

### MP-1 Fields in `.devmochi.json`

```json
{
  "protocol": "MP-1",
  "name": "DEV-MOCHI",
  "vision": "Status lines as shared consciousness for all agents — zero context drift.",
  "mission": "Zero-dependency renderer reading project context from a single .json file.",
  "pitch": "Feed the project commits, not kibble — the status line IS the beast.",
  "moonshot": "Status line that auto-evolves its roadmap from git history.",
  "roadmap": ["Epoch 1: Renderer Core", "Epoch 2: Cross-agent sync", "Epoch 3: npm distribution"],
  "low_hanging": ["Normalize flat configs so old schema doesn't break"],
  "quick_wins": ["MISSION and PITCH visible in terminal refresh cycle"],
  "next_steps": ["npm publish", "Worktree symlink helper"],
  "sit_rep": "Core renderer functional. Dual-schema landed. Ready for npm publish.",
  "moat": "Zero-dependency Node stdlib. <5ms render. Nothing to supply-chain attack.",
  "pre_mortem": ["Context leakage", "Dependency rot", "Hallucinated progress"]
}
```

### What rotates on Line 5

The renderer cycles through every MP-1 dimension every 6 seconds:

```
PITCH    │ Feed the project commits, not kibble...
VISION   │ Status lines as shared consciousness for all agents...
MOAT     │ Zero-dependency Node stdlib. <5ms render...
MOONSHOT │ Status line that auto-evolves its roadmap...
FRUIT    │ Normalize flat configs so old schema doesn't break
WIN      │ MISSION and PITCH visible in terminal refresh cycle
SITREP   │ Core renderer functional. Dual-schema landed...
EPOCHS   │ ■ Purified → ▶ Anchored → □ Distributed
ROADMAP  │ Epoch 1: Renderer Core (one per cycle)
NEXT     │ 1. npm publish (one per cycle)
RISK     │ Context leakage / Dependency rot / Hallucinated progress
```

Every agent that reads this status line knows: what we're building, why it matters, what can kill it, and what to do next. No ramp-up required.

## Why not a pet?

Most status line tools give you a virtual pet that reacts to your coding. Cute, but:

- Pet animations waste screen space on entertainment
- Personality quips add noise to your thinking
- XP/leveling systems gamify the wrong thing
- None of it helps the AI agent do its job better

Dev-mochi puts your **project mission, roadmap, and progress** where the pet would be. The creature you're raising is the product itself.

## Inspired by

- [claude-code-tamagotchi](https://github.com/Ido-Levi/claude-code-tamagotchi) — behavioral enforcement pet
- [tokburn](https://github.com/nicholasgriffintn/tokburn) — Tokemon status line (sprites + XP)

Dev-mochi takes the opposite approach: the project is the creature. Feed it commits, not kibble.

## License

MIT
