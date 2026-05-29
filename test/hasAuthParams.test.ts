import { describe, expect, it } from '@jest/globals';

import {
  hasAuthParams,
  normalizeError,
  renewSilentError,
  signinError,
  signoutError,
} from '../src/utils.js';

const loc = (search: string, hash: string): Location =>
  ({ search, hash }) as Location;

describe('hasAuthParams', () => {
  it('should detect code + state in the query string', () => {
    expect(hasAuthParams(loc('?code=abc&state=xyz', ''))).toBe(true);
  });

  it('should detect error + state in the query string', () => {
    expect(hasAuthParams(loc('?error=denied&state=xyz', ''))).toBe(true);
  });

  it('should detect code + state in the fragment', () => {
    expect(hasAuthParams(loc('', '#code=abc&state=xyz'))).toBe(true);
  });

  it('should return false without a state parameter', () => {
    expect(hasAuthParams(loc('?code=abc', ''))).toBe(false);
  });

  it('should return false for an unrelated URL', () => {
    expect(hasAuthParams(loc('?foo=bar', ''))).toBe(false);
  });
});

describe('normalizeError', () => {
  it('should extract the fields from an Error instance', () => {
    const err = new Error('boom');
    const fields = normalizeError(err, 'fallback');

    expect(fields.name).toBe('Error');
    expect(fields.message).toBe('boom');
    expect(fields.innerError).toBe(err);
    expect(typeof fields.stack).toBe('string');
  });

  it('should use defaults for a non-object thrown value', () => {
    const fields = normalizeError('just a string', 'fallback message');

    expect(fields.name).toBe('Error');
    expect(fields.message).toBe('fallback message');
    expect(fields.innerError).toBe('just a string');
    expect(typeof fields.stack).toBe('string');
  });

  it('should use defaults when an object field is not a string', () => {
    const fields = normalizeError(
      { name: 42, message: null },
      'fallback message',
    );

    expect(fields.name).toBe('Error');
    expect(fields.message).toBe('fallback message');
  });

  it('should tag each error with its source', () => {
    expect(signinError(new Error('a')).source).toBe('signinCallback');
    expect(signoutError(new Error('b')).source).toBe('signoutCallback');
    expect(renewSilentError(new Error('c')).source).toBe('renewSilent');
  });
});
