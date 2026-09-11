import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:4000';
const BLOCKED_DOMAINS = ['qurancdn.com', 'quran.com', 'quran.foundation'];

/**
 * Setup strict network interceptor that tracks and aborts any outbound
 * request targeting external Quran domains.
 */
async function setupStrictOfflineGate(page: Page, externalRequests: string[]) {
  // Capture requests via page event
  page.on('request', (request) => {
    const url = request.url();
    if (BLOCKED_DOMAINS.some((domain) => url.includes(domain))) {
      externalRequests.push(url);
    }
  });

  // Intercept and abort external requests at route level
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
}

test.describe('Strict Offline Sovereign Architecture Gate', () => {
  test.describe.configure({ mode: 'serial' });

  test('1. Homepage (/) loads completely offline with 0 external requests', async ({ page }) => {
    const externalRequests: string[] = [];
    await setupStrictOfflineGate(page, externalRequests);

    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

    // Verify key homepage elements are visible
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('text=Al-Fatihah').first()).toBeVisible({ timeout: 15000 });

    // Assert zero external network leaks
    expect(externalRequests).toEqual([]);
  });

  test('2. Surah /1 and /6 render in Verse-by-Verse and Reading Mode offline', async ({ page }) => {
    const externalRequests: string[] = [];
    await setupStrictOfflineGate(page, externalRequests);

    // --- Surah 1: Verse-by-Verse ---
    await page.goto(`${BASE_URL}/1`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('text=Al-Fatihah').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=1:1').first()).toBeVisible({ timeout: 15000 });

    // --- Surah 1: Reading Mode ---
    await page.goto(`${BASE_URL}/1?reading=true`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('text=Al-Fatihah').first()).toBeVisible({ timeout: 15000 });

    // --- Surah 6: Verse-by-Verse ---
    await page.goto(`${BASE_URL}/6`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator("text=Al-An'am").first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=6:1').first()).toBeVisible({ timeout: 15000 });

    // --- Surah 6: Reading Mode ---
    await page.goto(`${BASE_URL}/6?reading=true`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator("text=Al-An'am").first()).toBeVisible({ timeout: 15000 });

    // Assert zero external network leaks
    expect(externalRequests).toEqual([]);
  });

  test('3. Pages /page/1 and /page/128 render offline', async ({ page }) => {
    const externalRequests: string[] = [];
    await setupStrictOfflineGate(page, externalRequests);

    // --- Page 1 ---
    await page.goto(`${BASE_URL}/page/1`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('text=Al-Fatihah').first()).toBeVisible({ timeout: 15000 });

    // --- Page 128 ---
    await page.goto(`${BASE_URL}/page/128`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator("text=Al-An'am").first()).toBeVisible({ timeout: 15000 });

    // Assert zero external network leaks
    expect(externalRequests).toEqual([]);
  });

  test('4. Juz /juz/1 renders offline', async ({ page }) => {
    const externalRequests: string[] = [];
    await setupStrictOfflineGate(page, externalRequests);

    await page.goto(`${BASE_URL}/juz/1`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('text=Al-Fatihah').first()).toBeVisible({ timeout: 15000 });

    // Assert zero external network leaks
    expect(externalRequests).toEqual([]);
  });

  test('5. Command Bar Search queries ("Al-Baqarah", "2:255", "Ayatul Kursi") work offline', async ({
    page,
  }) => {
    const externalRequests: string[] = [];
    await setupStrictOfflineGate(page, externalRequests);

    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

    // Open Search Modal via Sanctuary Command Bar or shortcut
    const commandBarBtn = page.locator('[data-testid="sanctuary-command-bar"]');
    if (await commandBarBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await commandBarBtn.click();
    } else {
      await page.keyboard.press('ControlOrMeta+K');
    }

    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    // Query 1: "Al-Baqarah"
    await searchInput.fill('');
    await searchInput.fill('Al-Baqarah');
    await expect(page.locator('text=Surah Al-Baqarah').first()).toBeVisible({ timeout: 15000 });

    // Query 2: "2:255"
    await searchInput.fill('');
    await searchInput.fill('2:255');
    await expect(
      page.locator('text=Surah Al-Baqarah 2:255').or(page.locator('text=2:255')).first(),
    ).toBeVisible({ timeout: 15000 });

    // Query 3: "Ayatul Kursi"
    await searchInput.fill('');
    await searchInput.fill('Ayatul Kursi');
    await expect(page.locator('text=Ayatul Kursi').first()).toBeVisible({ timeout: 15000 });

    // Assert zero external network leaks
    expect(externalRequests).toEqual([]);
  });

  test('6. Audio stream for /audio/reciters/9/001.mp3 is served locally with valid content', async ({
    request,
    page,
  }) => {
    const externalRequests: string[] = [];
    await setupStrictOfflineGate(page, externalRequests);

    // Direct HTTP request to the local audio endpoint
    const response = await request.get(`${BASE_URL}/audio/reciters/9/001.mp3`);
    expect(response.status()).toBe(200);

    const headers = response.headers();
    expect(headers['content-type']).toContain('audio/mpeg');

    const body = await response.body();
    // Verify audio buffer size > 500KB (full Minshawi Surah 1 recitation is ~703KB)
    expect(body.length).toBeGreaterThan(500000);

    // Assert zero external network leaks
    expect(externalRequests).toEqual([]);
  });
});
