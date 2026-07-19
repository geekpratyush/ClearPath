const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:5175/ClearPath/', { waitUntil: 'networkidle0' });
  
  // App view
  await page.screenshot({ path: 'public/real_app_view.png' });

  // Left panel view
  const leftPanel = await page.$('.w-\\[350px\\]');
  if (leftPanel) await leftPanel.screenshot({ path: 'public/real_left_panel.png' });

  // Middle panel view
  const middlePanel = await page.$('.flex-1.min-w-\\[500px\\]');
  if (middlePanel) await middlePanel.screenshot({ path: 'public/real_middle_panel.png' });

  // Right panel view
  const rightPanel = await page.$('.w-\\[450px\\]');
  if (rightPanel) await rightPanel.screenshot({ path: 'public/real_right_panel.png' });

  await browser.close();
  console.log("Screenshots captured!");
})();
