import { existsSync } from 'fs';
import { chromium } from 'playwright';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const executablePath = existsSync(CHROME_PATH) ? CHROME_PATH : undefined;

async function check() {
  const browser = await chromium.launch({
    headless: true,
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  const consoleMessages = [];
  const pageErrors = [];

  page.on('console', (msg) => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });

  page.on('pageerror', (err) => {
    pageErrors.push({ message: err.message, stack: err.stack });
  });

  try {
    const response = await page.goto('http://localhost:4000', { waitUntil: 'networkidle', timeout: 15000 });
    console.log('HTTP Status:', response ? response.status() : 'null');
  } catch (e) {
    console.log('Navigation error:', e.message);
  }

  await page.waitForTimeout(2000);

  const title = await page.title();
  const htmlSnippet = await page.evaluate(() => document.body.innerHTML.slice(0, 1000));

  console.log('Page Title:', title);
  console.log('Page Errors:', JSON.stringify(pageErrors, null, 2));
  console.log('Console Messages:', JSON.stringify(consoleMessages, null, 2));
  console.log('HTML snippet:', htmlSnippet);

  await browser.close();
}

check().catch(console.error);
