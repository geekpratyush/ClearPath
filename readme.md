# ClearPath - Dynamic Credit Limit & Liquidity Orchestration Simulator

ClearPath is a production-ready, self-contained Node.js web application built for Business Analysts (BAs) to visually orchestrate, simulate, and document complex global credit limits, clearing validation rules, and transactional state pipelines across multiple geographical contexts.

## Architecture

*   **Frontend**: React (Vite-based), Tailwind CSS v4, Zustand for state management, `@xyflow/react` for visual pipeline diagramming, Lucide React for icons.
*   **Backend**: Node.js with Express, providing REST endpoints for simulation execution and artifact export.
*   **Core Logic**: Uses `expr-eval` (or custom sandboxed JS execution) for an embedded expression engine.

## Features

1.  **Context Editor (Left Panel)**: JSON or form-based editing of the multi-layered data context (Clearing Parameters, Facility Limits, Transaction Payload).
2.  **Visual Pipeline & Expression Canvas (Middle Panel)**: Four distinct pipeline stages with an embedded text editor for dynamic rule evaluation.
3.  **Simulation & Artifact Export (Right Panel)**: Visually simulates the transaction's state changes, produces dynamic data flow maps, and enables one-click exports (JSON, Markdown Specs, PNG).

## Getting Started

1.  Navigate to `client` and run `npm install`.
2.  Start the frontend: `npm run dev`.
3.  Navigate to the root and run `npm start` for the backend (once implemented).
