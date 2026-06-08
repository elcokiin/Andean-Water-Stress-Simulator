<p align="center">
  <img src="./apps/web/public/favicon.svg" alt="HydroSim icon" width="72" height="72" />
</p>

# HydroSim: Regional Water Collapse Simulator

[![Bun](https://img.shields.io/badge/Bun-1.3.10-black?style=flat-square&logo=bun)](https://bun.sh)
[![React](https://img.shields.io/badge/React-19-149eca?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-0.184-black?style=flat-square&logo=three.js)](https://threejs.org)
[![Astro](https://img.shields.io/badge/Astro-6-ff5d01?style=flat-square&logo=astro&logoColor=white)](https://astro.build)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

HydroSim is an interactive regional water simulation for Boyaca, Colombia. It
models how Tunja, Duitama, and Sogamoso could approach a hydrological point of
no return under sustained drought conditions associated with El Nino.

The project combines a React landing page, a Three.js simulation interface, an
Astro documentation site, and reusable causal/system-flow diagrams.

## Demo Video

> [!NOTE]
> Add the simulator video here. The recording should focus on the Three.js model
> in action; the landing page and documentation site do not need to be shown.

<!--
Recommended options:

1. Upload the video to the repository or GitHub release assets and paste the URL:
   https://github.com/user-attachments/assets/your-video-id

2. Or keep a local preview asset:
   <video src="./docs/demo.mp4" controls width="100%"></video>
-->

## Overview

The simulator is based on a System Dynamics / Forrester model that represents
reservoir storage, population demand, inflow, evaporation, infiltration, paramo
coverage, and feedback loops that can accelerate collapse.

The core research question is:

> When, and under which sustained drought conditions, do the water reserves of
> Tunja, Duitama, and Sogamoso cross a critical threshold where short and
> medium-term recovery becomes unviable?

The current model uses a 15% reservoir level as the critical Point of No Return
(PNR) threshold, combined with low recharge conditions during severe El Nino
scenarios.

## Features

- **Interactive 3D simulator** built with React Three Fiber, Drei, and Three.js.
- **City-specific profiles** for Tunja, Duitama, and Sogamoso.
- **Scenario switching** between baseline calibration, moderate El Nino, and
  extraordinary El Nino conditions.
- **Live control panel** with playback, reset, speed, configuration, metrics,
  and collapse-state indicators.
- **Configurable model parameters** for climate, demand, and infrastructure.
- **Charts and trajectory panels** for reservoir and water-balance behavior.
- **Keyboard shortcuts** for fast exploration of the simulation.
- **Astro/Starlight documentation** covering the methodology, hypothesis, and
  system diagrams.
- **Reusable React Flow diagrams** packaged separately for the docs app.

## Model Scope

HydroSim focuses on three urban water subsystems in Boyaca:

| City     | Main source                          | Demand           | Growth      |
| -------- | ------------------------------------ | ---------------- | ----------- |
| Tunja    | Teatinos Reservoir                   | 148 L/person/day | 1.4% annual |
| Duitama  | La Playa Reservoir                   | 132 L/person/day | 1.1% annual |
| Sogamoso | Chicamocha River and related intakes | 140 L/person/day | 0.9% annual |

The simulation evaluates:

- Historical calibration from 2000 to 2023.
- Projection and exploration from 2024 onward.
- ONI-driven drought stress.
- Demand growth and rationing pressure.
- Storage loss through extraction, evaporation, filtration, and weak recharge.

> [!IMPORTANT]
> This is an educational simulation project. It is designed for scenario
> exploration and systems thinking, not for operational water-resource planning.

## Architecture

```text
.
+-- apps
|   +-- web        # Vite + React + Three.js simulator and landing page
|   +-- docs       # Astro + Starlight documentation site
+-- packages
|   +-- diagrams   # Shared React Flow diagrams used by the docs app
+-- DOMAIN_DOC.html
+-- package.json
+-- turbo.json
```

### Workspace Apps

| Package                    | Purpose                                          |
| -------------------------- | ------------------------------------------------ |
| `@proyecto-final/web`      | Main web app, landing page, and `/model` UI.     |
| `@proyecto-final/docs`     | Documentation site for methodology and diagrams. |
| `@proyecto-final/diagrams` | Reusable diagram components exported to docs.    |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) 1.3.10 or newer
- A browser with WebGL support
- Git

### Install Dependencies

```bash
bun install
```

### Run Everything

```bash
bun run dev
```

By default, this starts the workspace development servers through Turborepo.
Open:

- Web app: `http://localhost:5173`
- Simulator: `http://localhost:5173/model`
- Docs: `http://localhost:4321`

The web app reads `VITE_DOCS_URL` from `apps/web/.env` to link to the docs site.
The default value is:

```bash
VITE_DOCS_URL=http://localhost:4321
```

### Run One App

```bash
bun run --filter @proyecto-final/web dev
bun run --filter @proyecto-final/docs dev
```

## Useful Commands

```bash
bun run build
bun run lint
bun run typecheck
bun run format:check
bun run test
```

For scoped work, use the package filters:

```bash
bun run --filter @proyecto-final/web test
bun run --filter @proyecto-final/docs build
```

## Simulator Shortcuts

| Shortcut     | Action                                 |
| ------------ | -------------------------------------- |
| `Space`      | Start or pause the simulation.         |
| `ArrowRight` | Advance one simulation step.           |
| `ArrowLeft`  | Go back one simulation step.           |
| `R`          | Reset the scenario.                    |
| `C`          | Open or close model configuration.     |
| `G`          | Show or hide trajectory charts.        |
| `P`          | Minimize or restore the control panel. |
| `M`          | Toggle ambient audio.                  |
| `K`          | Show or hide shortcut badges.          |
| `D`          | Toggle light/dark theme.               |
| `H`          | Start the guided model tour.           |

## Documentation

The documentation app expands the project context beyond the simulator UI:

- Regional hydrological simulation overview.
- Methodology and hypothesis.
- Main system flow.
- Climate impact flow.
- Demand management flow.
- Point-of-no-return flow.

Start it with:

```bash
bun run --filter @proyecto-final/docs dev
```

Then open `http://localhost:4321`.

## Validation

The model logic has focused Vitest coverage for:

- Rain intensity behavior.
- Hydrological model calculations.
- Metrics generation.
- Simulation history.

Run the full project test task with:

```bash
bun run test
```

Or run a targeted suite directly:

```bash
bunx vitest run apps/web/src/lib/hydrosim/engine/__tests__/model.test.ts
```
