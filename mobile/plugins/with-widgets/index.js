const withAndroidWidgets = require('./withAndroidWidgets');
const withIosWidgets = require('./withIosWidgets');

/**
 * Unified Expo Config Plugin for Quran.ir Home Screen Widgets (iOS & Android).
 */
function withWidgets(config, options = {}) {
  config = withAndroidWidgets(config, options);
  config = withIosWidgets(config, options);
  return config;
}

module.exports = withWidgets;
module.exports.default = withWidgets;
module.exports.withWidgets = withWidgets;
