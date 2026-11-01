# Pulse Arena smoke

Serve demos root, then:

```bash
python3 -m http.server 8766 --bind 127.0.0.1 -d public/demos
node public/demos/pulse-arena/smoke.mjs
```

Happy path: lobby → start → multimedia + **viewmodel arms/gun visible** → spawn clear → WASD → jump → slide → **no fence/wall embed (sprint+slide)** → weapons 1–5 (each with viewmesh) → kill bot → Tab scoreboard → catalog back link.
