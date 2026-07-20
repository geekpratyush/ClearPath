import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

const URL = 'https://geekpratyush.github.io/ClearPath/';
const OUTPUT_DIR = path.resolve(__dirname);
const VIDEO_PATH = path.join(OUTPUT_DIR, 'raw_recording.webm');

async function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

(async () => {
  const browser = await chromium.launch({ headless: false });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: OUTPUT_DIR,
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();

  console.log('🎬 Scene 1: Loading ClearPath...');
  await page.goto(URL, { waitUntil: 'networkidle' });
  await delay(3000); // Hold on landing view

  console.log('🎬 Scene 2: Exploring the Pipeline Workspace...');
  // Click the "Add Stage" button if it exists
  const addStageBtn = page.getByRole('button', { name: /add stage/i });
  if (await addStageBtn.isVisible().catch(() => false)) {
    await addStageBtn.click();
    await delay(2000);
  }

  console.log('🎬 Scene 3: Editing Business Logic...');
  // Click on the first stage to open the editor
  const firstStage = page.locator('[data-stage]').first();
  if (await firstStage.isVisible().catch(() => false)) {
    await firstStage.click();
    await delay(2000);
  } else {
    // Fallback: try clicking into the middle panel area
    await page.mouse.click(960, 400);
    await delay(2000);
  }

  console.log('🎬 Scene 4: Opening Documentation / Help...');
  const docsBtn = page.getByRole('button', { name: /docs/i });
  if (await docsBtn.isVisible().catch(() => false)) {
    await docsBtn.click();
    await delay(3000);
    // Close it
    const closeBtn = page.getByRole('button', { name: /close/i });
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click();
      await delay(1000);
    }
  }

  console.log('🎬 Scene 5: Exporting the pipeline...');
  // Look for export buttons (JSON / PNG / SVG)
  const exportBtn = page.getByRole('button', { name: /export|json|png|svg/i }).first();
  if (await exportBtn.isVisible().catch(() => false)) {
    await exportBtn.click();
    await delay(2000);
  }

  console.log('🎬 Scene 6: Simulating...');
  const simulateBtn = page.getByRole('button', { name: /simulate|run/i });
  if (await simulateBtn.isVisible().catch(() => false)) {
    await simulateBtn.click();
    await delay(4000);
  }

  // Final hold to show results
  await delay(3000);

  console.log('✅ Recording complete. Closing browser...');
  await context.close();
  await browser.close();

  // Playwright saves the video to a temp file; rename it
  const files = fs.readdirSync(OUTPUT_DIR).filter((f) => f.endsWith('.webm') && f !== 'raw_recording.webm');
  if (files.length > 0) {
    fs.renameSync(path.join(OUTPUT_DIR, files[0]), VIDEO_PATH);
    console.log(`📹 Raw video saved to: ${VIDEO_PATH}`);
  }
})();
