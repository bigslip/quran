import clipboardCopy from 'clipboard-copy';

/**
 * Copy text to clipboard using the clipboardCopy library.
 *
 * @param {string} text
 * @returns {Promise<void>}
 */
export const copyTextToClipboard = async (text: string): Promise<void> => {
  return clipboardCopy(text);
};

export default copyTextToClipboard;
