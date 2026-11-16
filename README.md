# Half Wave Rectifier – Virtual Lab

A static, responsive virtual lab for studying a single-diode half-wave rectifier. Built with HTML, CSS, SVG, Canvas, and vanilla JavaScript; there is no backend, login, build step, or paid service.

## Run locally

Open `index.html` in a modern browser. Internet access is only needed to load the optional Google Fonts; the experiment itself works offline with system font fallbacks.

## Deploy to GitHub Pages

Upload or push the contents of this folder to a GitHub repository, enable GitHub Pages for the desired branch and folder, and open the published site. All project asset references are relative.

## Files

- `index.html` — exactly seven experiment sections and page content
- `style.css` — responsive blue and white layout
- `script.js` — quizzes, waveform drawing, simulation readings, and observation table
- `assets/srm-logo.png` — supplied SRM logo

## Simulation model

The source is sinusoidal and the silicon diode is modeled with a constant 0.7 V forward drop: Vout = max(0, Vin − 0.7 V). Average and RMS output values are numerically integrated over one cycle. Ripple factor is AC RMS divided by DC average; efficiency is DC load power divided by total output load power; PIV is the source peak. The load is purely resistive and no filter capacitor is modeled.
