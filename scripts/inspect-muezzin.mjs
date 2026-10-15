import { existsSync } from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const ARTIFACT_DIR = '/Users/reza/.gemini/antigravity-cli/brain/69145af9-c951-40a9-9157-294c753b349a';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const executablePath = existsSync(CHROME_PATH) ? CHROME_PATH : undefined;

async function inspectDemo() {
  const browser = await chromium.launch({
    headless: true,
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  // Try several candidate URLs
  const candidateUrls = [
    'https://nauthemes.com/demo/muezzin/',
    'https://muezzin.nauthemes.com/',
    'https://demo.nauthemes.com/muezzin/',
  ];

  for (const url of candidateUrls) {
    try {
      console.log('Navigating to', url);
      const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      if (res && res.status() < 400) {
        console.log('Success reaching', url);
        await page.waitForTimeout(3000);
        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'muezzin_demo_top.png') });
        
        // Extract typography, fonts, colors
        const designDetails = await page.evaluate(() => {
          const headings = Array.from(document.querySelectorAll('h1, h2, h3, .heading')).slice(0, 5).map(el => {
            const style = window.getComputedStyle(el);
            return {
              tag: el.tagName,
              text: el.textContent?.trim().slice(0, 50),
              fontFamily: style.fontFamily,
              fontSize: style.fontSize,
              fontWeight: style.fontWeight,
              color: style.color,
              letterSpacing: style.letterSpacing,
            };
          });

          const bodyStyle = window.getComputedStyle(document.body);
          return {
            title: document.title,
            bodyFont: bodyStyle.fontFamily,
            bodyColor: bodyStyle.color,
            bodyBg: bodyStyle.backgroundColor,
            headings,
          };
        });

        console.log(JSON.stringify(designDetails, null, 2));
        await browser.close();
        return;
      }
    } catch (e) {
      console.log('Failed reaching', url, e.message);
    }
  }

  await browser.close();
}

inspectDemo().catch(console.error);
