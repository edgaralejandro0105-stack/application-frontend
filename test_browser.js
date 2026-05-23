const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));

  console.log('Navigating to http://localhost:3001 ...');
  try {
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    console.log('Page loaded.');
  } catch (err) {
    console.error('Failed to load page:', err.message);
  }
  
  await browser.close();
})();
