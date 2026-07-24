# Screen Pet

A fluffy puppy that lives on your desktop. It wanders around the bottom of your
screen, naps when it gets tired, and reacts when you click, pet, or pick it up
— all rendered as a transparent, always-on-top overlay that stays out of the
way of everything else you're doing.

## Features

- Transparent, click-through, always-on-top overlay window (won't steal focus
  or block clicks to apps underneath, except directly over the puppy)
- Original fluffy-fur look via an SVG turbulence/displacement filter — no
  external art assets
- Idle, walk, and sleep states with randomized timing so it feels alive
- Click to pet (heart particles + happy sound), drag to pick up and carry
- Menu bar tray with Pause/Resume, puppy size, and Quit
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
│   └── main.js          # window, tray, IPC
├── preload.js            # contextBridge API exposed to renderer
└── renderer/
    ├── index.html
    ├── app.js             # wires movement + interactions together
    ├── styles/puppy.css
    └── puppy/
        ├── movement.js     # idle/walk/sleep state machine
        ├── interactions.js # hover hit-testing, drag, click-to-pet
        └── sound.js        # Web Audio synthesized bark/chirp
```
