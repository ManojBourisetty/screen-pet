# Screen Pet

A fluffy puppy that lives on your desktop. It runs after your cursor, has a
little house in the bottom-left corner, and takes commands from the menu bar
— all rendered as a transparent, always-on-top overlay that stays out of the
way of everything else you're doing.

## Features

- Transparent, click-through, always-on-top overlay window (won't steal focus
  or block clicks to apps underneath — only the puppy's own body is clickable,
  and it always keeps a small trailing offset from your cursor so it never
  sits directly on top of what you're about to click)
- Original fluffy-fur look via an SVG turbulence/displacement filter — no
  external art assets
- Follows your cursor with momentum, and falls back to idle/roam/auto-nap
  behavior when the cursor's been still for a while
- A doghouse + food bowl fixed at the bottom-left corner
- Menu bar commands: **Sleep** (walks home and naps), **Behave** (walks to
  the house and stays on a leash until released), **Feed** (eats at the
  bowl), **Play fetch** (chases a tossed toy and brings it back)
- Click to pet (heart particles + happy sound), drag to pick up and carry
- Procedurally synthesized sounds (Web Audio) — no audio files to license

## Requirements

- Node.js 18+
- macOS or Windows (built and tested on macOS)

## Run it

```bash
npm install
npm start
```

## Build a distributable (macOS)

```bash
npm run dist:mac
```

## Project structure

```
src/
├── main/
│   └── main.js               # window, tray menu, IPC
├── preload.js                 # contextBridge API exposed to renderer
└── renderer/
    ├── index.html             # puppy SVG + house/bowl/leash/toy fixtures
    ├── app.js                 # wires the behavior controller + animation loop
    ├── styles/puppy.css
    └── puppy/
        ├── behaviorController.js # mode/state machine: auto-chase, sleep,
        │                          # behave, eat, play, drag
        ├── motion.js              # low-level position easing + clamping
        ├── house.js               # house/bowl target coordinates
        ├── interactions.js        # hover hit-testing, drag, click-to-pet
        └── sound.js               # Web Audio synthesized bark/chirp
```
