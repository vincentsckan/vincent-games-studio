# Pulse Arena smoke

Serve demos root, then:

```bash
python3 -m http.server 8766 --bind 127.0.0.1 -d public/demos
node public/demos/pulse-arena/smoke.mjs
```

Happy path: lobby → start → multimedia + viewmodel → spawn clear → WASD → jump → slide → **no fence/wall embed** → weapons 1–5 → kill bot → Tab scoreboard → **multi-map (≥7)** → containers switch → **E+ archetype** → **pickups** → yard fence regression → **boss spawn/damage** → SFX flag → catalog back link.

Dual-smoke (DO + Searching) required before Vincent-final.
