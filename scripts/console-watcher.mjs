#!/usr/bin/env node
/**
 * Real-time Console & Error Watcher
 * Connects directly via Chrome DevTools Protocol (CDP) WebSocket on port 9222
 * to stream runtime errors, warnings, and console logs in real-time.
 */

const PORT = process.env.PORT || 4000;
const BASE_URL = `http://localhost:${PORT}`;

async function startWatcher() {
  console.log(`\n======================================================`);
  console.log(`👀 Chrome Real-Time Console & Error Watcher`);
  console.log(`🌐 Target: ${BASE_URL}`);
  console.log(`======================================================\n`);

  let target;
  try {
    const res = await fetch('http://localhost:9222/json');
    const tabs = await res.json();
    target = tabs.find(t => t.url && t.url.includes(BASE_URL));
    if (!target) {
      console.log(`Creating new Chrome tab pointing to ${BASE_URL}...`);
      target = await (await fetch(`http://localhost:9222/json/new?${BASE_URL}`, { method: 'PUT' })).json();
    }
  } catch (err) {
    console.error(`⚠️  Could not connect to Chrome on port 9222 (${err.message}). Make sure Chrome is running with --remote-debugging-port=9222.`);
    return;
  }

  if (!target || !target.webSocketDebuggerUrl) {
    console.error('❌ Failed to retrieve WebSocket Debugger URL from Chrome target.');
    return;
  }

  console.log(`🔗 Connected to Chrome Tab: "${target.title || BASE_URL}"`);
  console.log(`📡 WebSocket: ${target.webSocketDebuggerUrl}\n`);

  const ws = new WebSocket(target.webSocketDebuggerUrl);

  ws.onopen = () => {
    console.log('✅ DevTools Protocol connected! Listening for live console and page events...\n');
    ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
    ws.send(JSON.stringify({ id: 2, method: 'Log.enable' }));
    ws.send(JSON.stringify({ id: 3, method: 'Network.enable' }));
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.method === 'Runtime.consoleAPICalled') {
        const type = data.params.type;
        const text = data.params.args.map(a => a.value !== undefined ? String(a.value) : (a.description || '')).join(' ');
        if (text.includes('Download the React DevTools') || text.includes('[HMR] connected')) return;

        if (type === 'error') {
          console.error(`🔴 [CONSOLE_ERROR]: ${text}`);
        } else if (type === 'warning') {
          console.warn(`⚠️  [CONSOLE_WARN]: ${text}`);
        } else {
          console.log(`ℹ️  [CONSOLE_${type.toUpperCase()}]: ${text}`);
        }
      } else if (data.method === 'Runtime.exceptionThrown') {
        const details = data.params.exceptionDetails;
        console.error(`🚨 [PAGE_EXCEPTION]: ${details.text} - ${details.exception?.description || ''}`);
      } else if (data.method === 'Log.entryAdded') {
        const entry = data.params.entry;
        if (entry.level === 'error') {
          console.error(`🔴 [LOG_ERROR]: ${entry.text}`);
        } else if (entry.level === 'warning') {
          console.warn(`⚠️  [LOG_WARN]: ${entry.text}`);
        }
      }
    } catch {
      // Ignore JSON parse errors for non-standard frames
    }
  };

  ws.onerror = (err) => {
    console.error(`❌ WebSocket error: ${err.message}`);
  };

  ws.onclose = () => {
    console.log('🔌 Chrome DevTools connection closed.');
  };

  // Keep alive
  await new Promise(() => {});
}

startWatcher().catch(console.error);
