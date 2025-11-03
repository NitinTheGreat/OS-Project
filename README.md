# OS Memory Management Simulator – Page Replacement Visualizer

An interactive, browser-based visualizer for classic page replacement algorithms used in Operating Systems. Watch how memory frames evolve over time for FIFO, LRU, Optimal, and Clock algorithms—with smooth animations, per-step statistics, and a helpful info panel.

## Features

- Multiple algorithms
  - FIFO (First-In, First-Out)
  - LRU (Least Recently Used)
  - Optimal (theoretical best)
  - Clock (second-chance)
- Smooth step animations
  - Each step animates briefly for readability
  - On replacement, the evicted frame is marked with a diagonal cross and the old page value
- Preset and custom inputs
  - Choose curated scenarios or enter your own reference string and frame count
- Live statistics per step
  - Page Faults, Hit Rate, Frame Utilization, Total References
- Timeline + playback controls
  - Play/Pause, Next/Previous, Reset, and scrub via timeline slider
- Export utilities
  - Take a PNG screenshot of the canvas
  - Export a detailed execution trace as a text file
- Modern terminal-style UI
  - Responsive layout and clean, accessible styling

## Quick start

This is a static web app—no build required.

- Windows (PowerShell):
  ```powershell
  start .\index.html
  ```
- Or double-click `index.html` in your file manager.

## How to use

1. Algorithm: Click one of the algorithm buttons (FIFO / LRU / Optimal / Clock).
2. Input Mode:
   - Preset: pick a scenario from the dropdown.
   - Custom: enter Frame Count and a comma-separated Reference String (e.g., `7,0,1,2,0,3,0,4,...`).
3. Speed: adjust the slider to change playback speed.
4. Playback:
   - Reset ⟲, Previous ◄◄, Play/Pause ▶/⏸, Next ►►
   - Use the timeline slider to scrub to a specific step
5. Export: Screenshot (PNG) or Export Trace (TXT).

## What you’ll see

- Memory Visualization: frames drawn as boxes, current reference highlighted
- Replacement marker: when a fault causes replacement, the replaced frame gets a diagonal X and shows the evicted value
- Statistics: faults and hit rate update as the timeline advances
- Info panel: human-readable action per step (e.g., “Replaced page 3 with page 7”)

## Algorithms implemented

- FIFO: replace the page that has been in memory the longest
- LRU: replace the least recently used page (tracked via last access)
- Optimal: replace the page used farthest in the future (idealized; requires future knowledge)
- Clock: second-chance algorithm using a circular pointer and reference bits

## Preset scenarios

- Scenario 1: Light Load (small, repeating working set)
- Scenario 2: Normal Load (mixed references)
- Scenario 3: Heavy Load (working set > frames)
- Scenario 4: Worst Case (thrashing)

## Customization tips

- Frame Count: 1–8 frames are supported by default (tweak limits in `index.html` if needed)
- Reference String: comma-separated integers; spaces are allowed
- Animation Speed: 0.5x to 3x via the speed slider

## Project structure

```
algorithms.js   # Legacy algorithms file (kept for reference; not required by index.html)
animations.js   # Legacy animation helpers (kept for reference; not required by index.html)
index.html      # App shell and layout
script.js       # Consolidated app logic (algorithms, UI, drawing, animation)
styles.css      # Styling and responsive layout
README.md       # This file
```

Note: The app has been consolidated so that `script.js` contains the core logic and canvas rendering. The page only includes `script.js` to avoid duplicate class/constant definitions.

## Tech stack

- HTML5 Canvas for visualization
- Vanilla JavaScript (no framework)
- CSS for styling and responsive layout

## Development notes

- Open `index.html` directly in a browser for quickest iteration.
- The consolidated `script.js` defines both the animation engine and the page replacement simulator.
- Each simulation step records whether a page fault occurred and, if so, which frame/page was replaced (`replacedIndex`, `replacedPage`)—used to render the diagonal X overlay.

## License

This project is for educational purposes. Add a license file if you plan to distribute it.
