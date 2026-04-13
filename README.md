# dev-mochi

Project-focused status line for Claude Code. The project IS the beast.

No sprites. No quips. No XP. Just your project's identity, mission, roadmap, and metrics — always visible, zero token cost.

## What it shows (6 lines)

```
AIVA · Restore payment flow & client dashboard │ staging → my-app.web.app
⎇ feature/payments* │ Opus 4.6 (1M context) │ ━━━─────────── 19%
5h ◆◆◆◆◆◇◇◇◇◇ 50% 6m→13:36 │ 7d ◆◆◆◇◇◇◇◇◇◇ 33% │ +317/-173 ↓30.4K↑100.0K
■ Auth  ■ Payments  ▶ Dashboard  □ Deploy
VISION │ AI-native veterinary receptionist — answers calls, books appointments
Firebase · Stripe · Twilio │ Voice-first SaaS for vet clinics
```

**Line 5 rotates** every 6 seconds through your full context:
- **PITCH** — elevator pitch
- **VISION** — what it becomes
- **MOONSHOT** — the 10x dream
- **ROADMAP** — NOW / NEXT / THEN / MOON (one per cycle)
- **NEXT** — immediate action items (one per cycle)

## Install

```bash
# Copy the script
cp statusline.js ~/.claude/dev-mochi/statusline.js
chmod +x ~/.claude/dev-mochi/statusline.js

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

Drop a `.devmochi.json` in your project root:

```json
{
  "name": "MY-PROJECT",
  "mission": "One-line current mission",
  "pitch": "One-line elevator pitch",
  "vision": "What this becomes at scale",
  "moonshot": "The 10x dream",
  "brief": "Design brief one-liner",
  "stack": "Firebase · React · Stripe",
  "stage": "staging",
  "target": "my-app.web.app",
  "roadmap": [
    "NOW: What you're building this week",
    "NEXT: What unlocks after NOW ships",
    "THEN: The medium-term play",
    "MOON: The endgame"
  ],
  "next_steps": [
    "Immediate action item 1",
    "Immediate action item 2"
  ],
  "tracker": [
    { "label": "Auth", "status": "done" },
    { "label": "Payments", "status": "active" },
    { "label": "Dashboard", "status": "pending" }
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

## Why

Status lines don't consume API tokens — they're free screen real estate. Most status line tools fill that space with pet animations and personality quips. Dev-mochi fills it with the thing that actually matters: **what you're building and where you're going.**

The rotating context line ensures the AI (and you) always have the full picture: pitch, vision, roadmap, moonshot, and next steps — cycling through every 30 seconds without cluttering the prompt.

## Inspired by

- [tokburn](https://github.com/your/tokburn) — Tokemon status line (sprites + XP)
- [claude-code-tamagotchi](https://github.com/Ido-Levi/claude-code-tamagotchi) — behavioral enforcement pet

Dev-mochi takes the opposite approach: the project is the creature. Feed it commits, not kibble.

## License

MIT
