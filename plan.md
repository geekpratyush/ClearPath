# ClearPath Implementation Plan

## 1. Project Initialization & Architecture
- [x] Create project directory and configure `package.json` with dependencies.
- [x] Initialize Vite React TypeScript template.
- [x] Install Tailwind CSS v4, Zustand, Lucide React, xyflow, expr-eval.
- [x] Configure Tailwind CSS and create `index.css` with enterprise brand theme.

## 2. Server Setup (Express)
- [ ] Create `server.ts` with basic Express setup and CORS.
- [ ] Implement simulation REST endpoint `/api/simulate`.
- [ ] Implement Markdown export REST endpoint `/api/export`.
- [ ] Serve Vite frontend in production.

## 3. Global State Management (Zustand)
- [ ] Define initial context object (Customer Pool Limit, Facility Limit, DODL, Payload).
- [ ] Define pipeline stages (Ingress, Limit Check, Compliance, Routing).
- [ ] Create Zustand store to manage active context, simulation history, and UI state.

## 4. Frontend Component Layout
- [ ] Implement the Application Shell (Header with Title, Dark Mode Toggle).
- [ ] Build **Left Panel: Context & Data Structure Editor**
  - Split view: JSON Editor Tab & Form Tab for real-time context adjustment.
- [ ] Build **Middle Panel: Visual Pipeline & Expression Canvas**
  - Render stage cards showing state.
  - Integrate textarea for `expr-eval` expression logic rules for each stage.
  - Display live output state preview.
- [ ] Build **Right Panel: Simulation Execution & Artifact Export**
  - Simulation execution button.
  - Visual data flow map using `@xyflow/react` (React Flow).
  - Export buttons for JSON, Markdown, and Canvas Image.

## 5. Expression Engine Integration
- [ ] Wire `expr-eval` (or sandboxed function) into the pipeline logic.
- [ ] Support mutation of the context (e.g., `context.utilized = context.utilized + context.amount`).

## 6. Polish and Finalization
- [ ] Apply enterprise visual styling (glassmorphism, micro-animations, sleek typography).
- [ ] Test the pipeline execution end-to-end.
- [ ] Test the backend endpoints.
