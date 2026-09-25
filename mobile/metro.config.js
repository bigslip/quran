const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure .db and .wasm files are bundled as assets for expo-sqlite
if (!config.resolver.assetExts.includes('db')) {
  config.resolver.assetExts.push('db');
}
if (!config.resolver.assetExts.includes('wasm')) {
  config.resolver.assetExts.push('wasm');
}

module.exports = config;
