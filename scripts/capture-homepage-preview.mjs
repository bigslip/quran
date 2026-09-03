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

  // Scroll down to Chapter Scrubber & Grid
  await desktopPage.evaluate(() => window.scrollTo(0, 500));
  await desktopPage.waitForTimeout(500);
  const desktopScrubber = path.join(ARTIFACT_DIR, 'desktop_scrubber_grid.png');
  await desktopPage.screenshot({ path: desktopScrubber });

  // Scroll down to Below the Fold Sections (Topics, Learning, Community, Apps)
  await desktopPage.evaluate(() => window.scrollTo(0, 1800));
  await desktopPage.waitForTimeout(500);
  const desktopBelowFold = path.join(ARTIFACT_DIR, 'desktop_below_fold.png');
  await desktopPage.screenshot({ path: desktopBelowFold });

  // 2. Mobile Viewport (390x844 - iPhone 14)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:4000', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);

  const mobileAboveFold = path.join(ARTIFACT_DIR, 'mobile_above_fold.png');
  await mobilePage.screenshot({ path: mobileAboveFold });

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
