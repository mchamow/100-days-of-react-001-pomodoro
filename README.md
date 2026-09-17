# 🍅 Pomodoro Timer

[![Test and deploy](https://github.com/mchamow/pomodoro/actions/workflows/deploy.yml/badge.svg)](https://github.com/mchamow/pomodoro/actions/workflows/deploy.yml)

**Day 1 of [100 Days of React](https://github.com/mchamow?tab=repositories)**: a simple focus timer that uses the Pomodoro technique.

**Live demo:** https://mchamow.github.io/pomodoro/

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

React 19 · TypeScript · Vite · Tailwind CSS + [shadcn/ui](https://ui.shadcn.com) (Base UI) · Vitest + Testing Library · deployed to GitHub Pages with GitHub Actions.

## Run locally

```bash
pnpm install
pnpm dev
pnpm test   # unit tests (Vitest)
```
