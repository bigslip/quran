import { existsSync } from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const ARTIFACT_DIR = '/Users/reza/.gemini/antigravity-cli/brain/69145af9-c951-40a9-9157-294c753b349a';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const executablePath = existsSync(CHROME_PATH) ? CHROME_PATH : undefined;

async function capture() {
  const browser = await chromium.launch({
    headless: true,
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  // 1. Desktop Viewport (1440x900)
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://localhost:4000', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(1000);
  
  const desktopAboveFold = path.join(ARTIFACT_DIR, 'desktop_above_fold.png');
  await desktopPage.screenshot({ path: desktopAboveFold });

  // Scroll down to Community Section
  const communityEl = await desktopPage.$('[data-testid="community-section"]');
  if (communityEl) {
    await communityEl.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(500);
    const desktopCommunity = path.join(ARTIFACT_DIR, 'desktop_community_section.png');
    await desktopPage.screenshot({ path: desktopCommunity });
  }

  // Scroll down to Apps Section
  await desktopPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await desktopPage.waitForTimeout(500);
  const desktopFooter = path.join(ARTIFACT_DIR, 'desktop_footer_apps.png');
  await desktopPage.screenshot({ path: desktopFooter });

  await browser.close();
  console.log('Community and Apps screenshots captured successfully!');
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
