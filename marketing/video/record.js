// ClearPath Full-Feature Demo Recording Script — AUDIO-SYNCED VERSION
// Reads timings.json (output of generate_audio.js) to hold each scene for
// exactly as long as its narration clip, ensuring perfect A/V sync.
//
// Run AFTER generate_audio.js:
//   node marketing/video/record.js

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const URL = 'https://geekpratyush.github.io/ClearPath/';
const OUTPUT_DIR = path.resolve(__dirname);
const TIMINGS_PATH = path.join(OUTPUT_DIR, 'timings.json');

// Load timings from generate_audio.js output
let TIMINGS = [];
if (fs.existsSync(TIMINGS_PATH)) {
  TIMINGS = JSON.parse(fs.readFileSync(TIMINGS_PATH, 'utf8'));
  console.log(`📋 Loaded timings for ${TIMINGS.length} scenes from timings.json`);
} else {
  console.error('❌ timings.json not found. Run generate_audio.js first!');
  process.exit(1);
}

// Returns holdMs for a given 1-indexed scene number
const hold = (sceneNum) => {
  const t = TIMINGS.find(t => t.scene === sceneNum);
  return t ? t.holdMs : 3000;
};

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function smoothMove(page, x, y, steps = 20) {
  for (let i = 1; i <= steps; i++) {
    const nx = 960 + ((x - 960) * i) / steps;
    const ny = 540 + ((y - 540) * i) / steps;
    await page.mouse.move(nx, ny);
    await delay(16);
  }
}

// Close any open modal via JS (bypasses overlay pointer-event interception)
async function closeModal(page) {
  await page.evaluate(() => {
    const overlay = document.querySelector('div.fixed.inset-0');
    if (overlay) {
      const btns = Array.from(overlay.querySelectorAll('button'));
      const xBtn = btns.find(btn => btn.querySelector('svg'));
      if (xBtn) xBtn.click();
    }
  });
  await delay(800);
}

(async () => {
  console.log('\n🎬 === ClearPath Audio-Synced Demo Recording ===\n');

  const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: OUTPUT_DIR, size: { width: 1920, height: 1080 } },
  });
  const page = await context.newPage();

  // ── Scene 1: App Load & Header (hold for narration duration) ─────────────
  console.log(`Scene 01 [${(hold(1)/1000).toFixed(1)}s]: Loading ClearPath + header overview`);
  await page.goto(URL, { waitUntil: 'networkidle' });
  await delay(2000);
  // Pan across header buttons left to right
  for (const x of [80, 300, 460, 610, 760, 870, 960]) {
    await smoothMove(page, x, 28, 12);
    await delay(400);
  }
  await delay(hold(1) - 2000 - (7 * 400 * 1.3)); // hold remaining time

  // ── Scene 2: Workspace Templates ─────────────────────────────────────────
  console.log(`Scene 02 [${(hold(2)/1000).toFixed(1)}s]: Workspace Templates`);
  await smoothMove(page, 175, 100);
  await delay(400);
  const templateSelect = page.locator('select').first();
  await templateSelect.selectOption('interactiveRisk');
  await delay(1200);
  await templateSelect.selectOption('facilityEligibility');
  await delay(1200);
  await templateSelect.selectOption('clearingLimits');
  await delay(hold(2) - 400 - 2400);

  // ── Scene 3: Context Payload - Form Tab ───────────────────────────────────
  console.log(`Scene 03 [${(hold(3)/1000).toFixed(1)}s]: Form Tab`);
  // Make sure Form tab is active
  await page.getByRole('button', { name: /^form/i }).first().click().catch(() => {});
  await smoothMove(page, 175, 350);
  await page.locator('div.flex-1.overflow-y-auto').first().evaluate(el => el.scrollTop = 0);
  await delay(600);
  await page.locator('div.flex-1.overflow-y-auto').first().evaluate(el => el.scrollTop = 250);
  await delay(800);
  await page.locator('div.flex-1.overflow-y-auto').first().evaluate(el => el.scrollTop = 0);
  await delay(hold(3) - 1400);

  // ── Scene 4: JSON Tab ─────────────────────────────────────────────────────
  console.log(`Scene 04 [${(hold(4)/1000).toFixed(1)}s]: JSON Tab`);
  await page.getByRole('button', { name: /^json/i }).first().click();
  await delay(800);
  await smoothMove(page, 175, 400);
  await delay(hold(4) - 800);

  // ── Scene 5: Notes Tab ────────────────────────────────────────────────────
  console.log(`Scene 05 [${(hold(5)/1000).toFixed(1)}s]: Notes Tab`);
  await page.getByRole('button', { name: /notes/i }).click();
  await delay(600);
  try {
    const noteArea = page.locator('textarea[placeholder*="pipeline requirements"]');
    await noteArea.waitFor({ timeout: 2000 });
    await noteArea.click({ force: true });
    const noteText = 'Requirement: Validate clearing limits before settlement approval.';
    for (const char of noteText) {
      await noteArea.press(char === ' ' ? 'Space' : char);
      await delay(35);
    }
  } catch (_) {}
  await delay(hold(5) - 600 - 2500);

  // ── Scene 6: Schema Builder Tab ───────────────────────────────────────────
  console.log(`Scene 06 [${(hold(6)/1000).toFixed(1)}s]: Schema Builder`);
  await page.getByRole('button', { name: /builder/i }).click();
  await delay(600);
  await smoothMove(page, 175, 400);
  await delay(hold(6) - 600);

  // ── Scene 7: Orchestration Pipeline Overview ──────────────────────────────
  console.log(`Scene 07 [${(hold(7)/1000).toFixed(1)}s]: Pipeline Overview`);
  await smoothMove(page, 750, 70);
  await delay(600);
  await smoothMove(page, 960, 70);
  await delay(600);
  await smoothMove(page, 1150, 70); // toward Add Stage
  await delay(hold(7) - 1200);

  // ── Scene 8: Collapse / Expand All ───────────────────────────────────────
  console.log(`Scene 08 [${(hold(8)/1000).toFixed(1)}s]: Collapse/Expand All`);
  await page.locator('button[title="Collapse All"]').click();
  await delay(1000);
  await page.locator('button[title="Expand All"]').click();
  await delay(hold(8) - 1000);

  // ── Scene 9: Add Stage ────────────────────────────────────────────────────
  console.log(`Scene 09 [${(hold(9)/1000).toFixed(1)}s]: Add Stage`);
  const addStageBtn = page.getByRole('button', { name: /add stage/i });
  await addStageBtn.hover();
  await delay(500);
  await addStageBtn.click();
  await delay(hold(9) - 500);

  // ── Scene 10: Edit Stage Name ─────────────────────────────────────────────
  console.log(`Scene 10 [${(hold(10)/1000).toFixed(1)}s]: Edit Stage Name`);
  const lastNameInput = page.locator('input[placeholder="Stage Name..."]').last();
  await lastNameInput.click({ clickCount: 3 });
  await lastNameInput.fill('Collateral Validation');
  await delay(hold(10));

  // ── Scene 11: Change Stage Shape ─────────────────────────────────────────
  console.log(`Scene 11 [${(hold(11)/1000).toFixed(1)}s]: Change Shape`);
  const shapeSelect = page.locator('select').filter({ hasText: 'Rectangle' }).last();
  await shapeSelect.selectOption('diamond');
  await delay(800);
  await shapeSelect.selectOption('ellipse');
  await delay(800);
  await shapeSelect.selectOption('rectangle');
  await delay(hold(11) - 1600);

  // ── Scene 12: Approval Workflow ───────────────────────────────────────────
  console.log(`Scene 12 [${(hold(12)/1000).toFixed(1)}s]: Approval Workflow`);
  const approvalSelect = page.locator('select').filter({ hasText: 'Draft' }).last();
  if (await approvalSelect.count() > 0) {
    await approvalSelect.selectOption('review');
    await delay(1000);
    await approvalSelect.selectOption('approved');
  }
  await delay(hold(12) - 1000);

  // ── Scene 13: Business Requirement ───────────────────────────────────────
  console.log(`Scene 13 [${(hold(13)/1000).toFixed(1)}s]: Business Requirement`);
  const reqBtn = page.locator('button[title="Add Requirement"], button[title="Edit Requirement"]').first();
  if (await reqBtn.isVisible().catch(() => false)) {
    await reqBtn.click();
    await delay(600);
    try {
      const reqArea = page.locator('textarea[placeholder*="business rules"]').first();
      await reqArea.waitFor({ timeout: 2000 });
      await reqArea.fill('Validate collateral meets minimum margin requirements before proceeding.');
    } catch (_) {}
  }
  await delay(hold(13) - 600);

  // ── Scene 14: Maximize Editor ────────────────────────────────────────────
  console.log(`Scene 14 [${(hold(14)/1000).toFixed(1)}s]: Maximize Editor`);
  const maxBtn = page.locator('button[title="Maximize editor"]').first();
  if (await maxBtn.isVisible().catch(() => false)) {
    await maxBtn.click();
    await delay(hold(14) * 0.8);
    const minBtn = page.locator('button[title="Restore size"]').first();
    if (await minBtn.isVisible().catch(() => false)) await minBtn.click();
    await delay(hold(14) * 0.2);
  } else {
    await delay(hold(14));
  }

  // ── Scene 15: Pipeline JSON View ─────────────────────────────────────────
  console.log(`Scene 15 [${(hold(15)/1000).toFixed(1)}s]: Pipeline JSON View`);
  await page.locator('button').filter({ hasText: 'JSON' }).nth(1).click();
  await delay(800);
  await smoothMove(page, 750, 400);
  await delay(hold(15) - 800);
  await page.locator('button').filter({ hasText: 'Visual' }).first().click();
  await delay(500);

  // ── Scene 16: Simulation Panel Overview ──────────────────────────────────
  console.log(`Scene 16 [${(hold(16)/1000).toFixed(1)}s]: Simulation Panel`);
  await smoothMove(page, 1650, 50);
  await delay(500);
  for (const label of ['JSON', 'SVG', 'PNG']) {
    const btn = page.locator('button').filter({ hasText: label }).last();
    if (await btn.isVisible().catch(() => false)) {
      await btn.hover();
      await delay(500);
    }
  }
  await delay(hold(16) - 2000);

  // ── Scene 17: Run Simulation ──────────────────────────────────────────────
  console.log(`Scene 17 [${(hold(17)/1000).toFixed(1)}s]: Run Simulation`);
  const runBtn = page.getByRole('button', { name: /run simulation/i });
  await runBtn.hover();
  await delay(600);
  await runBtn.click();
  // Wait for simulation to complete (stages animate), then hold for remainder
  await delay(Math.max(hold(17), 10000));

  // ── Scene 18: Flow Diagram Results ───────────────────────────────────────
  console.log(`Scene 18 [${(hold(18)/1000).toFixed(1)}s]: Flow Diagram`);
  await smoothMove(page, 1650, 400);
  await delay(1000);
  await page.mouse.wheel(0, -80);
  await delay(600);
  await page.mouse.wheel(0, 80);
  await delay(hold(18) - 1600);

  // ── Scene 19: Help Modal ──────────────────────────────────────────────────
  console.log(`Scene 19 [${(hold(19)/1000).toFixed(1)}s]: Help Modal`);
  await page.getByRole('button', { name: /^help/i }).click();
  await delay(hold(19) - 800);
  await closeModal(page);

  // ── Scene 20: Docs Modal ──────────────────────────────────────────────────
  console.log(`Scene 20 [${(hold(20)/1000).toFixed(1)}s]: Docs Modal`);
  await page.getByRole('button', { name: /^docs/i }).click();
  await delay(hold(20) - 800);
  await closeModal(page);

  // ── Scene 21: Theme Toggle ────────────────────────────────────────────────
  console.log(`Scene 21 [${(hold(21)/1000).toFixed(1)}s]: Theme Toggle`);
  const themeBtn = page.locator('button[title*="Switch to"]');
  await themeBtn.waitFor({ state: 'visible', timeout: 3000 });
  await themeBtn.click();
  await delay(Math.round(hold(21) * 0.6));
  await themeBtn.click();
  await delay(Math.round(hold(21) * 0.4));

  // ── Scene 22: Final Wide Shot ─────────────────────────────────────────────
  console.log(`Scene 22 [${(hold(22)/1000).toFixed(1)}s]: Final Overview`);
  await smoothMove(page, 960, 540);
  await delay(hold(22));

  console.log('\n✅ All 22 scenes recorded. Closing browser...');
  await context.close();
  await browser.close();

  // Rename Playwright's UUID-named webm
  const files = fs.readdirSync(OUTPUT_DIR).filter(
    f => f.endsWith('.webm') && !f.startsWith('raw_recording')
  );
  if (files.length > 0) {
    const dest = path.join(OUTPUT_DIR, 'raw_recording.webm');
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
    fs.renameSync(path.join(OUTPUT_DIR, files[0]), dest);
    console.log(`📹 Raw video saved to: ${dest}`);
  }
})();
