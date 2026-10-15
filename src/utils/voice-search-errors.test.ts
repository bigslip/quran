import { describe, it, expect } from 'vitest';
import { getErrorKeyFromCode, getErrorKeyFromMessage } from './voice-search-errors';

describe('voice-search-errors', () => {
  describe('getErrorKeyFromCode', () => {
    it('returns whitelisted error keys for supported codes', () => {
      expect(getErrorKeyFromCode('not-allowed')).toBe('voice.no-permission');
      expect(getErrorKeyFromCode('no-speech')).toBe('voice.no-speech');
      expect(getErrorKeyFromCode('network')).toBe('voice.network');
    });

    it('falls back to voice.error for unknown codes', () => {
      expect(getErrorKeyFromCode('some-weird-error')).toBe('voice.error');
    });
  });

  describe('getErrorKeyFromMessage', () => {
    it('detects network errors from error message', () => {
      expect(getErrorKeyFromMessage('User is offline')).toBe('voice.network');
      expect(getErrorKeyFromMessage('network connection dropped')).toBe('voice.network');
    });

    it('falls back to voice.error for general or undefined error messages', () => {
      expect(getErrorKeyFromMessage('Permission denied')).toBe('voice.error');
      expect(getErrorKeyFromMessage(undefined)).toBe('voice.error');
      expect(getErrorKeyFromMessage(null as any)).toBe('voice.error');
    });
  });
});
