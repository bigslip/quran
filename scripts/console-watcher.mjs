#!/usr/bin/env node
/**
 * Real-time Console and Error Watcher
 * Connects over CDP or launches browser to listen to all console events and runtime errors.
 */

import { chromium } from 'playwright';

const PORT = process.env.PORT || 4000;
const BASE_URL = `http://localhost:${PORT}`;

async function startWatcher() {
  console.log(`\n======================================================`);
  console.log(`👀 Console Watcher Active on ${BASE_URL}`);
  console.log(`======================================================\n`);

  let browser;
  try {
    browser = await chromium.connectOverCDP('http://localhost:9222');
    console.log('🔗 Connected to Chrome CDP on port 9222');
  } catch {
    browser = await chromium.launch({
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--no-first-run'],
    });
    console.log('🚀 Launched Headless Chrome instance');
  }

  const context = browser.contexts()[0] || (await browser.newContext({ viewport: { width: 1440, height: 900 } }));
  const page = context.pages()[0] || (await context.newPage());

  page.on('pageerror', (err) => {
    console.error(`🚨 [PAGE_ERROR]: ${err.message}\n${err.stack || ''}`);
  });

  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    if (text.includes('Download the React DevTools') || text.includes('[HMR] connected')) return;

    if (type === 'error') {
      console.error(`🔴 [CONSOLE_ERROR]: ${text}`);
    } else if (type === 'warning') {
      console.warn(`⚠️  [CONSOLE_WARN]: ${text}`);
    } else {
      console.log(`ℹ️  [CONSOLE_${type.toUpperCase()}]: ${text}`);
    }
  });

  page.on('response', (res) => {
    if (res.status() >= 400 && !res.url().includes('/api/proxy/auth/courses')) {
      console.error(`❌ [NETWORK_FAIL]: HTTP ${res.status()} -> ${res.url()}`);
    }
  });

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  console.log(`✅ Loaded ${BASE_URL} (Page Title: "${await page.title()}")`);
  console.log(`Listening for live console logs and network events...\n`);

  // Keep alive
  await new Promise(() => {});
}

startWatcher().catch((err) => {
  console.error('Watcher failed:', err);
});
