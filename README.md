# 🍅 Pomodoro Timer

**Day 1 of [100 Days of React](https://github.com/mchamow?tab=repositories&q=100-days-of-react)**: a simple focus timer that uses the Pomodoro technique.

**Live demo:** https://mchamow.github.io/100-days-of-react-001-pomodoro/

## Features

- Focus / short break / long break sessions (25 / 5 / 15 min by default)
- A long break after every 4 focus sessions, with dots showing progress through the cycle
- A progress ring, with the remaining time also shown in the browser tab title
- A chime when a session ends, generated with the Web Audio API (no audio files)
- Stays accurate in background tabs because it counts down to an end time instead of counting ticks
- Today's finished focus sessions, remembered in `localStorage`
- Adjustable durations, optional auto-start of the next session, sound on/off
- Keyboard shortcuts: <kbd>Space</kbd> start/pause · <kbd>R</kbd> reset · <kbd>S</kbd> skip
- Light and dark themes

## Tech

React 19 · TypeScript · Vite · deployed to GitHub Pages with GitHub Actions.

## Run locally

```bash
pnpm install
pnpm dev
```
