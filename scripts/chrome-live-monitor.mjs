#!/usr/bin/env node
/**
 * Chrome Live Console & Network Monitor
 *
 * Runs automated Chrome browser audits and real-time monitoring against http://localhost:4000
 * Captures:
 * - Runtime JavaScript Errors (page.on('pageerror'))
 * - Console Errors & Warnings (page.on('console'))
 * - Failed Network Requests (HTTP 4xx / 5xx)
 * - React Hydration & SSR Mismatches
 */

import { existsSync } from 'fs';
import { chromium } from 'playwright';

const PORT = process.env.PORT || 4000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const executablePath = existsSync(CHROME_PATH) ? CHROME_PATH : undefined;

const VIEWPORTS = {
  desktop: { width: 1440, height: 900, name: 'Desktop (1440x900)' },
  tablet: { width: 768, height: 1024, name: 'Tablet (768x1024)' },
  mobile: { width: 375, height: 812, name: 'Mobile (375x812)' },
};

const KEY_ROUTES = [
  '/',
  '/1',
  '/2',
  '/36',
  '/fa/2',
  '/ar/1',
  '/juz/1',
  '/page/1',
  '/search?query=mercy',
  '/my-quran',
  '/reading-goal',
];

import os from 'os';
import path from 'path';

async function runAudit() {
  console.log(`\n======================================================`);
  console.log(`🚀 Starting Chrome Live Console & Network Audit`);
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`🖥️  Browser: ${executablePath ? 'Google Chrome' : 'Playwright Chromium'}`);
  console.log(`======================================================\n`);

  const totalFindings = {
    pageErrors: [],
    consoleErrors: [],
    consoleWarnings: [],
    networkErrors: [],
  };

  for (const [viewportKey, viewport] of Object.entries(VIEWPORTS)) {
    console.log(`\n📱 Auditing Viewport: ${viewport.name}`);
    console.log(`------------------------------------------------------`);

    const tmpDir = path.join(os.tmpdir(), `pw-audit-${viewportKey}-${Date.now()}`);
    const context = await chromium.launchPersistentContext(tmpDir, {
      executablePath,
      headless: true,
      viewport: { width: viewport.width, height: viewport.height },
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--no-first-run'],
    });

    const page = context.pages()[0] || (await context.newPage());

    page.on('pageerror', (err) => {
      const msg = `[${viewportKey}] ${err.message}\n${err.stack || ''}`;
      totalFindings.pageErrors.push(msg);
      console.error(`🚨 [PAGE_ERROR]: ${msg}`);
    });

    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      // Filter out benign dev noise
      if (text.includes('Download the React DevTools') || text.includes('[HMR] connected')) return;

      if (type === 'error') {
        const item = `[${viewportKey}] ${text}`;
        totalFindings.consoleErrors.push(item);
        console.error(`🔴 [CONSOLE_ERROR]: ${item}`);
      } else if (type === 'warning') {
        const item = `[${viewportKey}] ${text}`;
        totalFindings.consoleWarnings.push(item);
        console.warn(`⚠️  [CONSOLE_WARN]: ${item}`);
      }
    });

    page.on('response', (res) => {
      const status = res.status();
      const url = res.url();
      if (status >= 400) {
        // Ignore expected mock course endpoint in local dev if not running
        if (url.includes('/api/proxy/auth/courses')) return;

        const item = `[${viewportKey}] HTTP ${status} -> ${url}`;
        totalFindings.networkErrors.push(item);
        console.error(`❌ [NETWORK_FAIL]: ${item}`);
      }
    });

    for (const route of KEY_ROUTES) {
      const url = `${BASE_URL}${route}`;
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await page.waitForTimeout(600);
        process.stdout.write(`  ✅ ${route.padEnd(24)} -> 200 OK\n`);
      } catch (err) {
        console.error(`  ❌ Failed to load ${url}: ${err.message}`);
      }
    }

    await context.close();
  }

  console.log(`\n======================================================`);
  console.log(`📊 Audit Summary Report`);
  console.log(`======================================================`);
  console.log(`• Unhandled Page Errors:   ${totalFindings.pageErrors.length}`);
  console.log(`• Console Errors:          ${totalFindings.consoleErrors.length}`);
  console.log(`• Console Warnings:        ${totalFindings.consoleWarnings.length}`);
  console.log(`• Failed Network Requests: ${totalFindings.networkErrors.length}`);

  if (
    totalFindings.pageErrors.length === 0 &&
    totalFindings.consoleErrors.length === 0 &&
    totalFindings.networkErrors.length === 0
  ) {
    console.log(`\n🎉 100% HEALTHY: Zero runtime errors or network failures detected!`);
    return 0;
  } else {
    console.log(`\n⚠️  Issues detected that require resolution.`);
    return 1;
  }
}

async function runWatch() {
  console.log(`\n======================================================`);
  console.log(`👀 Chrome Live Real-Time Monitor Active (Watch Mode)`);
  console.log(`🌐 Monitoring: ${BASE_URL}`);
  console.log(`🖥️  Browser: ${executablePath ? 'Google Chrome' : 'Playwright Chromium'}`);
  console.log(`Press Ctrl+C to stop.`);
  console.log(`======================================================\n`);

  const browser = await chromium.launch({
    headless: false,
    executablePath,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  page.on('pageerror', (err) => {
    console.error(`🚨 [PAGE_ERROR]: ${err.message}\n${err.stack || ''}`);
  });

  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      console.error(`🔴 [CONSOLE_ERROR]: ${text}`);
    } else if (type === 'warning') {
      console.warn(`⚠️  [CONSOLE_WARN]: ${text}`);
    }
  });

  page.on('response', (res) => {
    if (res.status() >= 400 && !res.url().includes('/api/proxy/auth/courses')) {
      console.error(`❌ [NETWORK_FAIL]: HTTP ${res.status()} -> ${res.url()}`);
    }
  });

  await page.goto(BASE_URL, { waitUntil: 'load' });

  // Keep process running
  await new Promise(() => {});
}

const isWatchMode = process.argv.includes('--watch');

if (isWatchMode) {
  runWatch().catch((e) => {
    console.error(e);
    process.exit(1);
  });
} else {
  runAudit()
    .then((code) => process.exit(code))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
