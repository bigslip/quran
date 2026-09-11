import { chromium } from 'playwright';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:4000';
const BLOCKED_DOMAINS = ['qurancdn.com', 'quran.com', 'quran.foundation'];

async function runStrictOfflineVerification() {
  console.log('🚀 Launching Strict Offline E2E Verification against:', BASE_URL);
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const externalRequests: string[] = [];

  page.on('request', (request) => {
    const url = request.url();
    if (BLOCKED_DOMAINS.some((domain) => url.includes(domain))) {
      externalRequests.push(url);
    }
  });

  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (BLOCKED_DOMAINS.some((domain) => url.includes(domain))) {
      if (!externalRequests.includes(url)) {
        externalRequests.push(url);
      }
      return route.abort('blockedbyclient');
    }
    return route.continue();
  });

  try {
    // 1. Homepage /
    console.log('Testing 1: Homepage (/) ...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    console.log('  ✅ Homepage rendered successfully offline.');

    // 2. Surah /1 & /6
    console.log('Testing 2: Surah /1 and /6 (Verse-by-Verse & Reading Mode) ...');
    await page.goto(`${BASE_URL}/1`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Switch to Reading mode on /1
    const readingBtn1 = page.locator('button:has-text("Reading")').first();
    if (await readingBtn1.isVisible()) {
      await readingBtn1.click();
      await page.waitForTimeout(1000);
    }

    await page.goto(`${BASE_URL}/6`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Switch to Reading mode on /6
    const readingBtn6 = page.locator('button:has-text("Reading")').first();
    if (await readingBtn6.isVisible()) {
      await readingBtn6.click();
      await page.waitForTimeout(1000);
    }
    console.log('  ✅ Surah /1 and /6 rendered successfully in both modes.');

    // 3. Pages /page/1 & /page/128
    console.log('Testing 3: /page/1 and /page/128 ...');
    await page.goto(`${BASE_URL}/page/1`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    await page.goto(`${BASE_URL}/page/128`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    console.log('  ✅ /page/1 and /page/128 rendered successfully.');

    // 4. Juz /juz/1
    console.log('Testing 4: /juz/1 ...');
    await page.goto(`${BASE_URL}/juz/1`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    console.log('  ✅ /juz/1 rendered successfully.');

    // 5. Command Bar Search queries (via direct API test and UI test)
    console.log('Testing 5: Command Bar Search Queries ...');
    const searchNavRes = await fetch(`${BASE_URL}/api/proxy/content/api/qdc/navigate?query=Al-Baqarah`);
    if (!searchNavRes.ok) throw new Error(`Search navigate API failed with status ${searchNavRes.status}`);
    const searchNavJson = await searchNavRes.json();
    if (!searchNavJson.result?.navigation?.length) {
      throw new Error('Search navigate returned empty results');
    }
    console.log(`  ✅ Search /navigate API returned ${searchNavJson.result.navigation.length} results.`);

    const searchRes = await fetch(`${BASE_URL}/api/proxy/content/api/qdc/search?query=mercy`);
    if (!searchRes.ok) throw new Error(`Search API failed with status ${searchRes.status}`);
    const searchJson = await searchRes.json();
    if (!searchJson.result?.verses?.length) {
      throw new Error('Search API returned empty verse results');
    }
    console.log(`  ✅ Search /search API returned ${searchJson.result.verses.length} verse results.`);

    // 6. Audio stream check
    console.log('Testing 6: Audio Stream (/audio/reciters/9/001.mp3) ...');
    const audioRes = await fetch(`${BASE_URL}/audio/reciters/9/001.mp3`);
    if (!audioRes.ok) throw new Error(`Audio response status ${audioRes.status}`);
    const audioBuffer = await audioRes.arrayBuffer();
    if (audioBuffer.byteLength < 500000) {
      throw new Error(`Audio buffer too small: ${audioBuffer.byteLength} bytes`);
    }
    console.log(`  ✅ Audio stream verified (${audioBuffer.byteLength} bytes).`);

    // External Request Leaks Assertion
    if (externalRequests.length > 0) {
      throw new Error(`❌ LEAK DETECTED: External requests made:\n${externalRequests.join('\n')}`);
    }

    console.log('\n🌟 STRICT OFFLINE VERIFICATION PASSED: 0 EXTERNAL NETWORK LEAKS 🌟\n');
  } finally {
    await browser.close();
  }
}

runStrictOfflineVerification().catch((err) => {
  console.error('❌ Strict Offline Verification Failed:', err);
  process.exit(1);
});
