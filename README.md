# ClearPath: Dynamic Orchestration Simulator

ClearPath is an enterprise-grade, browser-based orchestration simulator designed specifically for **Product Managers** and **Business Analysts (BAs)**. It serves as a visual bridge between business requirements and technical implementation, allowing teams to architect, simulate, and document complex transactional state pipelines without writing backend code.

## 🌟 The Vision for Product Teams
Traditionally, explaining a complex banking logic flow (like a global limits check or a parallel sanctions screening) requires static flowcharts and lengthy Confluence pages. 

**ClearPath changes this paradigm.**

Instead of drawing a flowchart, a BA can construct a living, breathing state machine. You define the payload, write the business logic, and literally **Run the Simulation** to prove the requirements work before handing them off to the engineering team.

### Core Capabilities for Analysts:
1. **Rapid Requirement Prototyping:** Build interactive forms instantly. Paste a sample JSON payload, and ClearPath dynamically generates the UI inputs, sliders, and dropdowns needed to test it.
2. **Visual Logic Architecture:** Architect non-linear pipelines. Need a stage to loop back if the clearing window is closed? Need parallel processing for Fraud and Sanctions? ClearPath handles advanced routing natively.
3. **Living Documentation (Import/Export):** Stop losing work in email threads. A BA can architect a pipeline, hit **Export**, and attach the `.json` file to a Jira ticket. The engineer simply hits **Import** to load the exact state machine into their local studio.
4. **IntelliSense for Business Rules:** You don't need to be an engineer to write logic. The built-in Monaco Editor provides VS Code-style autocomplete, reading your exact payload schema to help you write expressions perfectly.

## 🚀 Key Features

* **Turing-Complete Expression Engine:** Safely evaluate complex rules using a sandboxed native JavaScript executor. Mutate the state mid-flight (e.g., `context.retries++`) and evaluate conditions.
* **Rich UI Form Definitions:** Define advanced UI components directly in your payload (e.g., `_type: "slider"`, `_type: "select"`) to create beautiful, interactive demos.
* **React Flow Visualization:** Watch your pipeline execute in real-time. Nodes light up Green (Passed), Red (Breached), or Yellow (Amber/Manual Review) as the simulation processes data.
* **Persistent Context Management:** Save your custom architectures directly to your browser's local storage. Build a library of specific test cases (e.g., "High-Risk EU Wire") and switch between them instantly.
* **Day/Night Enterprise Theming:** A beautiful glassmorphic UI that fully supports light and dark modes.

## 🛠️ How to Use It

### 1. Define the Context (Left Panel)
The Context represents the "data payload" moving through your system.
* Use the **JSON Tab** to paste a raw payload, or select a predefined Template from the dropdown.
* Switch to the **Visual Tab** to manipulate the variables using toggles and inputs.
* Click **Save Context** to persist your current setup to Local Storage for future sessions!

### 2. Build the Pipeline (Middle Panel)
* Click **+ Add Stage** to create a validation step.
* Write a business rule in the Monaco Editor. Use standard JavaScript (e.g., `context.amount > 1000 ? "AMBER" : "PASSED"`).
* Need branching? Export the pipeline, edit the `"routing"` block to define parallel paths, and import it back.

### 3. Run the Simulation (Right Panel)
* Click **Run Simulation**.
* Watch the pipeline process the data stage-by-stage.
* View the **Output Context** diffs under each stage to see exactly how your payload mutated during the journey.

## 📦 Tech Stack
* **Vite + React:** Blazing fast frontend framework.
* **Zustand:** Lightweight global state management (with LocalStorage persistence).
* **Tailwind CSS v4:** Utility-first styling with comprehensive CSS variable theming.
* **Monaco Editor:** Real-time TypeScript/JavaScript IntelliSense.
* **React Flow:** Node-based diagramming and dynamic layout generation.
