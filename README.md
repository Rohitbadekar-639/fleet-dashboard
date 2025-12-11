# MapUp - Fleet Tracking Dashboard (Assessment Submission)

This repository contains the Fleet Tracking Dashboard built for the MapUp assessment.

-- Live deployment: [Fleet Dashboard App](https://fleet-dashboard-rouge.vercel.app/)

## How to use the live demo

1. Click the live link above to open the dashboard.
2. Press the **Play** button to start the simulation. You'll see the `Simulation time` update and metrics change as events are processed.
3. **Select a trip** from the left panel or **click a marker on the map** to view detailed trip information (location, fuel, distance, events, alerts).
4. Use the **Speed buttons** (1x / 5x / 10x) to change how fast the simulation progresses.
5. Press **Reset** to go back to the start and clear all trip data.

## Submission Statement

I used AI tools (ChatGPT) to scaffold and accelerate the initial implementation but I have studied, understood, and verified every line of code in this repository. I am the author of the final dashboard as deployed at the live URL above and can explain and modify any part of the application during an interview or live coding session. If you would like, I can walk through the event processing logic, simulation controls, and map integration step-by-step.

## What this project includes

- A React + Vite single-page app that simulates and visualizes 5 concurrent vehicle trips
- Real-time simulation using timestamped event data in `src/data/`
- Playback controls (play/pause/reset and speed selection)
- Fleet summary metrics and per-trip details
- Leaflet map with live-updating markers and popups

## How to run locally

1. Install dependencies:

```bash
npm install
```

2. Run dev server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

## Quick architecture overview

`App.jsx` loads the event data from `src/data/`, sorts events by timestamp, and simulates time progression via a timer. Events up to the current simulation time are applied sequentially to per-trip state objects using `applyEventToTrip()`. UI components (`TripList`, `FleetMap`, `TripDetails`, `FleetSummary`, `PlaybackControls`) read derived state and re-render. `useMemo` is used for summary calculations to avoid unnecessary recomputation.

## Key files

- `src/App.jsx` — simulation orchestration, event processing, main layout
- `src/components/FleetMap.jsx` — Leaflet map and markers
- `src/components/TripList.jsx` — selectable list of trips
- `src/components/TripDetails.jsx` — detailed trip view and alerts
- `src/components/FleetSummary.jsx` — metric cards
- `src/data/*.json` — five trip event datasets used by the simulation