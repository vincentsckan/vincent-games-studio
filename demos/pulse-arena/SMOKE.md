# Pulse Arena smoke

Serve demos root, then:

```bash
python3 -m http.server 8766 --bind 127.0.0.1 -d public/demos
node public/demos/pulse-arena/smoke.mjs
```

Happy path: lobby → start → multimedia + viewmodel → spawn clear → WASD → jump → slide → **no fence/wall embed** → **instant weapon switch 1–5 / wheel / Q** (viewmodel+bags) → kill bot → Tab scoreboard → **multi-map (≥7)** → containers switch → **E+ archetype** → **pickups** → yard fence regression → **boss spawn/damage** → SFX flag → hit/FX/mm6 gates → catalog back link.

Weapon switch gate: Digit1–5 / wheel / Q must change `weapon` + viewmodel with no blocking swap; ammo bags persist per slot; MM_EXPAND=`expand-v1-weaponswitch`; MM_VER=mm7 (hotbar icons); MM_SCENE=mm6-realism; vm-* FP plates unchanged.

Dual-smoke (DO + Searching) required before Vincent-final.
