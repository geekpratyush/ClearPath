// Step 1: Generate all scene audio files AND output timings.json
// Run with: node marketing/video/generate_audio.js
// Outputs: marketing/video/scene_N.mp3 files + marketing/video/timings.json

const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.resolve(__dirname);

const SCENES = [
  "Welcome to ClearPath — your enterprise-grade orchestration and financial simulation platform.",
  "ClearPath ships with powerful built-in workspace templates. Here we switch between Clearing Limits, Facility Eligibility, and more — each instantly populating the full pipeline and context payload.",
  "The Context Payload panel is your data input layer. In Form view, you get rich interactive controls — sliders, dropdowns, toggles, and grouped fields — designed for business analysts, not just developers.",
  "Switch to JSON view for direct access to the raw payload. Any edits here instantly sync with the Form view.",
  "The Notes tab is your requirements scratchpad. Document intent, acceptance criteria, and approval notes — all stored alongside your workspace.",
  "The Schema Builder lets you visually design your context payload structure. Drag to reorder, add new fields of any type, and delete what you don't need — no JSON editing required.",
  "The Orchestration Pipeline is the heart of ClearPath. Each stage represents a rule, check, or transformation in your financial workflow.",
  "Use Collapse All and Expand All to get a bird's-eye view of your pipeline or drill into a specific stage.",
  "Adding a new stage is instant. Click Add Stage and a new block appears, ready to configure.",
  "Every stage has a fully editable name. Just click and type — keeping your pipeline self-documenting.",
  "Choose the flowchart shape for each stage: Rectangle for processes, Diamond for decisions, Ellipse for start and end, or Parallelogram for input-output operations.",
  "ClearPath has a built-in approval workflow. Move stages from Draft to Review, then lock them as Approved — making the stage read-only and protected from accidental changes.",
  "Attach a business requirement directly to any stage. This creates a bridge between your technical expression and the human-readable rule it enforces.",
  "The integrated Monaco code editor powers every stage. Maximize it for complex logic and get full IntelliSense with auto-complete on your live context object.",
  "Switch to JSON view to see the raw stage definitions. You can paste or import a pre-built pipeline from any external source.",
  "The Simulation panel on the right shows a live ReactFlow diagram that auto-layouts as you build and updates in real time.",
  "Hit Run Simulation. ClearPath evaluates every stage against your context payload. Watch the nodes light up — green for passed, red for breached, amber for conditional routes.",
  "After simulation, the flow diagram shows each node's final status with color-coded indicators, showing exactly where data flowed and which rules fired.",
  "The built-in Help manual gives you a quick reference for key concepts, expression syntax, and keyboard shortcuts — always available right inside the app.",
  "The full Documentation portal provides deep-dive guides on architecture, ES6 rule logic, stage routing, and workflows — everything your team needs to get productive fast.",
  "ClearPath supports both dark and light themes, adapting to your team's preference or presentation environment.",
  "That's ClearPath in action. From context payload to pipeline orchestration, live simulation, and export — a complete platform for building, validating, and communicating financial business logic.",
];

function getMp3Duration(filePath) {
  try {
    const result = execSync(
      `ffprobe -v quiet -print_format json -show_streams "${filePath}"`,
      { encoding: 'utf8' }
    );
    const info = JSON.parse(result);
    const stream = info.streams.find(s => s.codec_type === 'audio');
    return stream ? parseFloat(stream.duration) : 0;
  } catch (_) {
    return 0;
  }
}

async function generateAllAudio() {
  const timings = [];

  for (let i = 0; i < SCENES.length; i++) {
    const sceneDir = path.join(OUTPUT_DIR, `scene_${i + 1}_tmp`);
    fs.mkdirSync(sceneDir, { recursive: true });

    const tts = new MsEdgeTTS();
    await tts.setMetadata('en-US-AriaNeural', OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

    console.log(`🔊 Scene ${String(i + 1).padStart(2, '0')}: "${SCENES[i].slice(0, 55)}..."`);
    await tts.toFile(sceneDir, SCENES[i]);

    const src = path.join(sceneDir, 'audio.mp3');
    const dest = path.join(OUTPUT_DIR, `scene_${i + 1}.mp3`);
    fs.renameSync(src, dest);
    fs.rmdirSync(sceneDir);

    const duration = getMp3Duration(dest);
    // Add 1.5s padding so viewer can absorb content before scene changes
    const holdMs = Math.round((duration + 1.5) * 1000);
    timings.push({ scene: i + 1, durationSec: parseFloat(duration.toFixed(2)), holdMs });
    console.log(`   ✅ Duration: ${duration.toFixed(2)}s  → video hold: ${holdMs}ms`);

    await new Promise(r => setTimeout(r, 250));
  }

  // Write timings.json for record.js to consume
  const timingsPath = path.join(OUTPUT_DIR, 'timings.json');
  fs.writeFileSync(timingsPath, JSON.stringify(timings, null, 2));
  console.log(`\n📋 Timings saved to: ${timingsPath}`);

  // Stitch all clips into narration.mp3
  const listFile = path.join(OUTPUT_DIR, 'audio_list.txt');
  const audioParts = timings.map(t => path.join(OUTPUT_DIR, `scene_${t.scene}.mp3`));
  fs.writeFileSync(listFile, audioParts.map(p => `file '${p}'`).join('\n'));

  console.log('\n🔗 Concatenating into narration.mp3...');
  const narrationPath = path.join(OUTPUT_DIR, 'narration.mp3');
  execSync(`ffmpeg -y -f concat -safe 0 -i "${listFile}" -c copy "${narrationPath}"`, { stdio: 'inherit' });

  fs.unlinkSync(listFile);
  for (const f of audioParts) if (fs.existsSync(f)) fs.unlinkSync(f);

  const totalSec = timings.reduce((sum, t) => sum + t.durationSec + 1.5, 0);
  console.log(`\n✅ Narration done. Total video time needed: ${totalSec.toFixed(1)}s`);
}

generateAllAudio().catch(console.error);
