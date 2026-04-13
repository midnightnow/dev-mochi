# I replaced my Claude Code pet with project context (dev-mochi)

**GitHub:** https://github.com/midnightnow/dev-mochi

---

Claude Code reserves screen real estate for a status line at the bottom of every session. It runs a shell command, renders the output, and refreshes after each assistant message. It costs zero API tokens — it's rendered client-side, completely outside the context window.

Most status line plugins fill this space with virtual pets, XP bars, and personality quips. Tokemon sprites. Tamagotchi hunger levels. Sassy commentary about your variable names.

This is context dilution. Not in the token sense — the status line doesn't eat tokens — but in the cognitive sense. Every line of your terminal is a signal channel. If half your screen is "your pet is hungry" and the other half is your actual conversation, you're splitting attention between entertainment and engineering.

## The optimisation

The status line is the one free slot in Claude Code where you can surface information at zero cost. Dev-mochi fills it with project context:

```
◆ YOUR-PROJECT · What you're building right now │ staging → your-app.web.app
⎇ feature/branch* │ Opus 4.6 (1M context) │ ━━━─────────── 19%
5h ◆◆◆◆◆◇◇◇◇◇ 50% 6m→13:36 │ 7d ◆◆◆◇◇◇◇◇◇◇ 33% │ +317/-173 ↓30.4K↑100.0K
■ Auth  ▶ Payments  □ Deploy
PITCH │ Why this project exists in one sentence
Your tech stack │ Design constraint
```

Line 5 rotates every 6 seconds through your project's full context: vision, mission, pitch, roadmap, moonshot, next steps, current status, known risks. Full cycle in ~90 seconds.

You configure it with a single `.devmochi.json` in your project root:

```json
{
  "name": "YOUR-PROJECT",
  "mission": "What you're building right now",
  "pitch": "Why this matters in one sentence",
  "sit_rep": "What's working, what's broken, where's momentum",
  "roadmap": ["NOW: This week", "NEXT: After that", "MOON: The endgame"],
  "next_steps": ["First action", "Second action"],
  "stage": "staging",
  "target": "your-deploy-url.web.app",
  "tracker": [
    { "label": "Auth", "status": "done" },
    { "label": "Payments", "status": "active" },
    { "label": "Deploy", "status": "pending" }
  ]
}
```

## Why this changes how you work

When your project name, deploy target, feature tracker, and current mission are always visible in the terminal, you stop spending conversation turns re-establishing context. Your prompts get more precise because you're looking at the status board while you type. More precise prompts mean less wasted output. Less wasted output means less context consumed per turn. The status line costs zero tokens but it compresses your token spend everywhere else.

That's context enhancement — using free screen real estate to make the paid context window more efficient.

## The wider problem: headers and footers

Claude Code injects system context on every turn: git status, CLAUDE.md, memory files, branch info. These are useful but they're not free — they consume input tokens every message. The more you add to CLAUDE.md, the more you pay per turn.

The status line is the exception. It's the one injection point that doesn't cost tokens. Dev-mochi is built around that asymmetry: put project context where it's free (the status line for the human), and keep CLAUDE.md lean (the context window for the AI).

If you want the AI to read it too, the `.devmochi.json` is just a JSON file in your project root. Reference it from CLAUDE.md and both sides see the same source of truth. But the status line alone — visible to you, invisible to the model — already tightens the feedback loop.

## Moonshot Protocol (MP-1)

I ended up building a structured config format for defining a project in 10 fields. I call it MP-1. The idea: if you can articulate these 10 things, every agent session starts with full orientation.

1. **Vision** — 10-year North Star
2. **Mission** — the unsexy lever you're pulling today
3. **Pitch** — one sentence, pure signal
4. **Roadmap** — state changes (epochs), not dates
5. **Moonshot** — the 10x outcome
6. **Low-Hanging Fruit** — gaps that just need execution
7. **Quick Wins** — prove viability in 24 hours
8. **Next Steps** — immediate sequence
9. **Current Project** — name and scope
10. **Sit Rep** — honest status right now

All 10 fields rotate on line 5 of the status line. You always know where the project stands without opening a file or asking the AI.

## Technical

- Zero dependencies — Node.js stdlib only, nothing to install
- <5ms render — reads JSON, writes ANSI
- Walks 10 directories up from cwd — works in subdirectories and worktrees
- Flat and structured config schemas both supported
- Multi-agent: symlink `.devmochi.json` into worktrees for shared context

## Install (30 seconds)

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

Drop a `.devmochi.json` in your project root. Done.

---

Curious what other people are doing with their status lines. Are you optimising the space or just vibing with a pixel crab? Both valid — I just found I wanted the project context more.

MIT licensed.
