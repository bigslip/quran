export const CDN_HOST = '';
export const CDN_ASSETS_VERSION = '1';

/**
 * Generate versioned URL of static asset
 *
 * @param {string} path the path of static asset
 * @returns {string}
 */

export const makeCDNUrl = (path?: string) => {
  if (!path) {
    return '';
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (!CDN_HOST) {
    return `${cleanPath}?v=${CDN_ASSETS_VERSION}`;
  }
  return `${CDN_HOST}${cleanPath}?v=${CDN_ASSETS_VERSION}`;
};
