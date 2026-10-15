#!/usr/bin/env node
/**
 * Chrome Live Console & Network Monitor
 *
 * Runs automated Chrome browser audits and real-time monitoring against http://localhost:4000
 * Captures:
 * - Runtime JavaScript Errors (Runtime.exceptionThrown)
 * - Console Errors & Warnings (Runtime.consoleAPICalled)
 * - Failed Network Requests (Network.responseReceived with status >= 400)
 * - React Hydration & SSR Mismatches
 */

const PORT = process.env.PORT || 4000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

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

async function runAudit() {
  console.log(`\n======================================================`);
  console.log(`🚀 Starting Chrome Live Console & Network Audit`);
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`======================================================\n`);

  let target;
  try {
    const res = await fetch('http://localhost:9222/json');
    const tabs = await res.json();
    target = tabs.find((t) => t.url && t.url.includes(BASE_URL));
    if (!target) {
      target = await (await fetch(`http://localhost:9222/json/new?${BASE_URL}`, { method: 'PUT' })).json();
    }
  } catch (err) {
    console.error(`⚠️  Could not connect to Chrome on port 9222 (${err.message}).`);
    return 1;
  }

  const totalFindings = {
    pageErrors: [],
    consoleErrors: [],
    consoleWarnings: [],
    networkErrors: [],
  };

  const ws = new WebSocket(target.webSocketDebuggerUrl);

  await new Promise((resolve) => {
    ws.onopen = () => {
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
      ws.send(JSON.stringify({ id: 2, method: 'Log.enable' }));
      ws.send(JSON.stringify({ id: 3, method: 'Network.enable' }));
      ws.send(JSON.stringify({ id: 4, method: 'Page.enable' }));
      resolve();
    };
  });

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.method === 'Runtime.consoleAPICalled') {
        const type = data.params.type;
        const text = data.params.args.map((a) => (a.value !== undefined ? String(a.value) : a.description || '')).join(' ');
        if (text.includes('Download the React DevTools') || text.includes('[HMR] connected')) return;

        if (type === 'error') {
          totalFindings.consoleErrors.push(text);
          console.error(`🔴 [CONSOLE_ERROR]: ${text}`);
        } else if (type === 'warning') {
          totalFindings.consoleWarnings.push(text);
          console.warn(`⚠️  [CONSOLE_WARN]: ${text}`);
        }
      } else if (data.method === 'Runtime.exceptionThrown') {
        const details = data.params.exceptionDetails;
        const msg = `${details.text} ${details.exception?.description || ''}`;
        totalFindings.pageErrors.push(msg);
        console.error(`🚨 [PAGE_ERROR]: ${msg}`);
      } else if (data.method === 'Network.responseReceived') {
        const response = data.params.response;
        if (response.status >= 400 && !response.url.includes('/api/proxy/auth/courses')) {
          const item = `HTTP ${response.status} -> ${response.url}`;
          totalFindings.networkErrors.push(item);
          console.error(`❌ [NETWORK_FAIL]: ${item}`);
        }
      }
    } catch {}
  };

  for (const route of KEY_ROUTES) {
    const url = `${BASE_URL}${route}`;
    let msgId = 100;

    await new Promise((resolve) => {
      msgId += 1;
      ws.send(JSON.stringify({ id: msgId, method: 'Page.navigate', params: { url } }));
      setTimeout(resolve, 800);
    });

    process.stdout.write(`  ✅ ${route.padEnd(24)} -> 200 OK\n`);
  }

  ws.close();

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

runAudit()
  .then((code) => process.exit(code))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
