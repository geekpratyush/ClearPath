<div align="center">
  <img src="client/public/logo.svg" alt="ClearPath Logo" width="300" />
  <h1>ClearPath: Enterprise Orchestration & Simulation Engine</h1>
  <p><em>The ultimate bridge between Business Analysts, Product Managers, and IT Engineering.</em></p>
  
  <p>
    <a href="https://geekpratyush.github.io/ClearPath/"><strong>Live Application Demo</strong></a> | 
    <a href="https://github.com/geekpratyush/ClearPath"><strong>GitHub Repository</strong></a>
  </p>
</div>

---

ClearPath is a stunning, state-of-the-art, browser-based orchestration simulator. It empowers **Product Managers**, **Business Analysts (BAs)**, and **Engineers** to architect, simulate, document, and export complex transactional state pipelines—all through a premium glassmorphic UI without requiring any backend deployments.

## The Vision

Traditionally, explaining complex business rules (e.g., global limits checks, parallel sanctions screening, fraud detection) requires static flowcharts and lengthy Wiki pages that quickly become outdated.

**ClearPath changes the paradigm entirely.**

Instead of drawing static diagrams, you construct a **living, breathing state machine**. You define the payload structure, write the exact business logic using native ES6, and literally **Run the Simulation** to prove the requirements work *before* handing them off to the engineering team.

---

## Epic Feature Set

### 1. AI-Ready Architecture
* **Export as AI Prompt:** ClearPath features a dedicated **AI Export** engine. With one click, your entire workspace (Context JSON, Pipeline Stages, and Business Notes) is serialized into a highly-optimized prompt. You can paste this directly into Claude or ChatGPT to automatically generate unit tests, identify edge cases, or produce stunning Mermaid.js architecture diagrams!
* **Living Documentation:** Say goodbye to stale docs. The platform features an extensive built-in **Documentation Modal** that auto-embeds actual WebP recordings of your application running, detailed ES6 writing guides, and component breakdowns.

### 2. Dynamic Context Engine
* **Rapid Requirement Prototyping:** Paste any raw JSON payload into the `Context Editor`. ClearPath instantly parses it and dynamically generates a rich UI form for you to manipulate!
* **Rich UI Definitions:** Force the generation of advanced HTML elements by adding a `_type` field to your JSON. Supported types include `slider`, `select`, `toggle`, etc. (e.g., `_type: "slider", min: 0, max: 100`).
* **Environment Management:** Upload `.json` files to instantly load an environment, or download your current state to attach it to Jira tickets.

### 3. ES6 Business Rules Engine
* **Turing-Complete Expressions:** Write your validation logic using modern **ES6 (ECMAScript 2015+)**.
* **Mutate State Mid-Flight:** Because stages share the global `context` object, you can dynamically inject calculated fields (e.g., `context.transactionFee = context.amount * 0.05`) to pass data downstream!
* **Intelligent Auto-Complete:** Powered by Monaco Editor, you get world-class syntax highlighting and VS Code-level IntelliSense as you type.
* **Support for Advanced JS:** Use array methods (`map`, `filter`, `reduce`), optional chaining (`?.`), nullish coalescing (`??`), and object destructuring directly inside your pipeline stages.

### 4. Visual Flow & Routing
* **React Flow Visualization:** The Middle Panel features an auto-laying React Flow graph.
* **Dynamic Node Reordering:** Use up/down arrows to shift stages around, and watch the visual graph animate and reorganize itself instantly.
* **Intelligent Routing Paths:** Nodes can return statuses like `PASSED`, `AMBER`, or `FAILED`. When exported, you can define explicit JSON routing tables to dictate parallel execution or loop-backs for manual review branches.

### 5. Premium Aesthetics
* **Glassmorphism Design:** Built on Tailwind CSS v4, the application features a deeply immersive, semi-transparent frosted glass design that looks breathtaking.
* **Dynamic Animations:** Micro-interactions, hover states, fade-ins, and auto-animating nodes keep the interface feeling responsive and alive.
* **Dark / Light Modes:** Seamless toggle between a vibrant, sleek Dark mode and a clean, legible Light mode.

---

## How to Master ClearPath

### 1. Define the Context (Left Panel)
The Context represents the "data payload" moving through your system.
1. Switch to the **JSON Tab** and paste a raw payload.
2. Switch back to the **Visual Tab** to manipulate the variables using the auto-generated toggles, sliders, and inputs.
3. Click the **Upload / Download** icons in the header to persist your work.

### 2. Build the Pipeline (Middle Panel)
1. Click **+ Add Stage** to create a validation step.
2. Name your stage (e.g., "AML Compliance Check").
3. Write a business rule in the Monaco Editor using ES6 (e.g., `context.riskScore.value > 80 ? "FAILED" : "PASSED"`).
4. Watch the visual graph build your architecture in real time.

### 3. Run the Simulation & Document (Right Panel)
1. Write down specific business rules or ACs in the **Workspace Notes**.
2. Click the **Run** button to watch the pipeline process the data stage-by-stage.
3. Observe exactly which nodes turned Green (Passed) or Red (Breached).
4. Click **Export as AI Prompt** to share the workflow with your AI assistant.

---

## Tech Stack
* **Vite + React:** Blazing fast frontend build tool and rendering library.
* **Zustand:** Lightweight global state management for cross-panel synchronization.
* **Tailwind CSS v4:** Utility-first styling enabling the premium glassmorphism aesthetic.
* **Monaco Editor:** Real-time TypeScript/JavaScript IntelliSense.
* **React Flow:** Node-based diagramming and dynamic layout generation.
* **Lucide React:** Beautiful, consistent iconography.

---

## Quick Start (Development)

To run ClearPath locally and start architecting pipelines:

```bash
cd client
npm install
npm run dev
```

The application will launch automatically. Press the **Docs** button in the top right header to explore the interactive, built-in system documentation!
