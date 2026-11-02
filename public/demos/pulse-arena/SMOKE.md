# Pulse Arena smoke

Serve demos root, then:

```bash
python3 -m http.server 8766 --bind 127.0.0.1 -d public/demos
node public/demos/pulse-arena/smoke.mjs
```

Happy path: lobby → start → multimedia + viewmodel → spawn clear → WASD → jump → slide → **no fence/wall embed** → **instant weapon switch 1–5 / wheel / Q** (viewmodel+bags) → kill bot → Tab scoreboard → **multi-map (≥7)** → containers switch → **E+ archetype** → **pickups** → yard fence regression → **boss spawn/damage** → SFX flag → hit/FX/mm6 gates → catalog back link.

Weapon switch gate: Digit1–5 / wheel / Q must change `weapon` + viewmodel with no blocking swap; ammo bags persist per slot; MM_EXPAND=`expand-v1-timer`; MM_VER=mm8 (crosshair + hotbar); MM_SCENE=mm6-realism; vm-* FP plates unchanged.

Timer gate: every map has `timeLimit` (yard/alley/oasis 120s · containers/dunes/platforms 150s · coliseum 180s); HUD `剩餘` countdown urgent≤30s / critical≤10s; map change / KeyN / `__loadMap` resets clock; expiry → end card 「時間到」 with 再來一局 / 下一關 / 返回大廳. Early clear via fragLimit or boss still ends before timer.

Dual-smoke (DO + Searching) required before Vincent-final.
