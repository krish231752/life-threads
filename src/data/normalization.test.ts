import { describe, it, expect } from 'vitest';
import { normalizeDataset } from './normalization';

describe('Dataset Normalization & Resilient Parsing', () => {
  it('normalizes legacy field names into standard Receipt structure', () => {
    const rawItems = [
      {
        id: 'legacy-1',
        category: 'music', // legacy for type
        name: 'Avril 14th', // legacy for title
        text: 'Listening on loop', // legacy for subtitle
        cost: 1.29, // legacy for amount
        venue: 'Home Studio', // legacy for location
        time: '2025-01-15T22:30:00Z',
        tags: 'ambient, aphex, piano', // string instead of array
      }
    ];

    const normalized = normalizeDataset(rawItems);
    expect(normalized).toHaveLength(1);
    const item = normalized[0];

    expect(item.id).toBe('legacy-1');
    expect(item.type).toBe('music');
    expect(item.title).toBe('Avril 14th');
    expect(item.subtitle).toBe('Listening on loop');
    expect(item.metadata.amount).toBe(1.29);
    expect(item.location?.name).toBe('Home Studio');
    expect(item.tags).toEqual(['ambient', 'aphex', 'piano']);
  });

  it('generates fallback IDs when missing', () => {
    const rawItems = [
      { title: 'Unnamed moment', type: 'notes', timestamp: '2025-01-01T00:00:00Z' },
      { title: 'Second moment', type: 'searches', timestamp: '2025-01-01T01:00:00Z' },
    ];

    const normalized = normalizeDataset(rawItems);
    expect(normalized).toHaveLength(2);
    expect(normalized[0].id).toBeTruthy();
    expect(normalized[1].id).toBeTruthy();
    expect(normalized[0].id).not.toBe(normalized[1].id);
  });

  it('handles invalid timestamps safely without throwing', () => {
    const rawItems = [
      { id: 'bad-date', title: 'Corrupted time', timestamp: 'not-a-valid-date', type: 'notes' }
    ];

    const normalized = normalizeDataset(rawItems);
    expect(normalized).toHaveLength(1);
    expect(normalized[0].timestamp).toBeTruthy();
    expect(() => new Date(normalized[0].timestamp)).not.toThrow();
  });

  it('sanitizes strings during normalization', () => {
    const rawItems = [
      {
        id: 'xss-item',
        title: '<script>alert(1)</script>Safe Title',
        subtitle: '<img src=x onerror=alert(2)>Safe Subtitle',
        type: 'notes',
        timestamp: '2025-01-01T12:00:00Z',
      }
    ];

    const normalized = normalizeDataset(rawItems);
    expect(normalized[0].title).not.toContain('<script>');
    expect(normalized[0].title).toContain('Safe Title');
    expect(normalized[0].subtitle).not.toContain('onerror');
  });
});
