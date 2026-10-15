import { existsSync } from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const ARTIFACT_DIR = '/Users/reza/.gemini/antigravity-cli/brain/69145af9-c951-40a9-9157-294c753b349a';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const executablePath = existsSync(CHROME_PATH) ? CHROME_PATH : undefined;

const VIEWPORTS = [
  { name: 'desktop_1440', width: 1440, height: 900 },
  { name: 'laptop_1024', width: 1024, height: 768 },
  { name: 'tablet_768', width: 768, height: 1024 },
  { name: 'mobile_390', width: 390, height: 844, isMobile: true },
];

async function capture() {
  const browser = await chromium.launch({
    headless: true,
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
      isMobile: vp.isMobile || false,
    });
    const page = await context.newPage();
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Capture Above-the-fold
    await page.screenshot({ path: path.join(ARTIFACT_DIR, `${vp.name}_top.png`) });

    // Scroll to community section if available
    const communityEl = await page.$('[data-testid="community-section"]');
    if (communityEl) {
      await communityEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, `${vp.name}_community.png`) });
    }

    await context.close();
  }

  await browser.close();
  console.log('All viewports captured successfully!');
}

capture().catch(console.error);
