import { describe, expect, it } from 'vitest';
import { dataUrl } from '../../src/lib/data-url.js';

describe('dataUrl()', () => {
  it('adds the build version to data URLs', () => {
    expect(dataUrl('/data/conversations.json')).toMatch(
      /^\/data\/conversations\.json\?v=.+$/
    );
  });

  it('preserves existing query parameters', () => {
    expect(dataUrl('/data/media.json?type=image')).toMatch(
      /^\/data\/media\.json\?type=image&v=.+$/
    );
  });
});
