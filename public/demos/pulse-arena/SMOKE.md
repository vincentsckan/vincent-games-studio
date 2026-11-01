# Pulse Arena smoke

Serve demos root, then:

```bash
python3 -m http.server 8766 --bind 127.0.0.1 -d public/demos
node public/demos/pulse-arena/smoke.mjs
```

Happy path: lobby → start → WASD → jump → slide → weapons 1–5 → kill bot → Tab scoreboard → catalog back link.
