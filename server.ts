import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API endpoint for simulating the pipeline (if needed server-side)
app.post('/api/simulate', (req, res) => {
    try {
        const { context, expressions } = req.body;
        // The simulation is mostly done on the client side for visual feedback.
        // This endpoint could validate or re-run the simulation if needed.
        res.json({ success: true, message: "Simulation received." });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

app.post('/api/export', (req, res) => {
    try {
        const { simulationData } = req.body;
        
        // Generate AI-ready markdown specification
        let markdown = `# ClearPath Simulation Export\n\n`;
        markdown += `## Initial Context\n\`\`\`json\n${JSON.stringify(simulationData.initialContext, null, 2)}\n\`\`\`\n\n`;
        markdown += `## Pipeline Stages\n`;
        
        simulationData.stages.forEach((stage: any, index: number) => {
            markdown += `### Stage ${index + 1}: ${stage.name}\n`;
            markdown += `- **Expression:** \`${stage.expression}\`\n`;
            markdown += `- **Result Status:** ${stage.status}\n`;
            markdown += `- **Context After Stage:**\n\`\`\`json\n${JSON.stringify(stage.contextAfter, null, 2)}\n\`\`\`\n\n`;
        });
        
        res.json({ markdown });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Serve the static frontend in production
app.use(express.static(path.join(__dirname, 'client/dist')));

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`ClearPath Server running on http://localhost:${PORT}`);
});
