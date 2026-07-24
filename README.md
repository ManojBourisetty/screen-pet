# Screen Pet

A fluffy 3D puppy that lives on your desktop. It runs after your cursor, has a
little house in the bottom-left corner, and takes commands from the menu bar
— all rendered as a transparent, always-on-top overlay that stays out of the
way of everything else you're doing.

## Features

- Transparent, click-through, always-on-top overlay window (won't steal focus
  or block clicks to apps underneath — only the puppy's own body is clickable,
  and it always keeps a small trailing offset from your cursor so it never
  sits directly on top of what you're about to click)
- A real 3D puppy rendered with Three.js/WebGL — primitive geometry (rounded
  body/head, floppy ears, capsule legs with paws, a collar, a curled tail)
  with per-vertex noise displacement for a fluffy silhouette and 3-point
  lighting for genuine depth/shading — no external models or textures
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

`npm start` bundles the renderer (Three.js needs a bundler since the CSP-
restricted renderer can't load bare npm imports directly) and then launches
Electron. Run `npm run build` on its own if you just want to rebuild the
bundle.

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
    ├── index.html             # canvas + house/bowl/leash/toy fixtures
    ├── app.js                 # wires the behavior controller + animation loop
    ├── dist/bundle.js         # esbuild output (generated, not committed)
    ├── styles/puppy.css
    └── puppy/
        ├── behaviorController.js # mode/state machine: auto-chase, sleep,
        │                          # behave, eat, play, drag
        ├── motion.js              # low-level 2D position easing + clamping
        ├── puppy3d.js             # Three.js scene: lights + primitive puppy model
        ├── puppyView.js           # per-frame 3D pose rig (legs/tail/head/eyes)
        ├── house.js               # house/bowl target coordinates
        ├── interactions.js        # hover hit-testing, drag, click-to-pet
        └── sound.js               # Web Audio synthesized bark/chirp
```
