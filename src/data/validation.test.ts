import { describe, it, expect } from 'vitest';
import { sanitizeString, validateRawDatasetInput } from './validation';

describe('Data Security & Sanitization', () => {
  it('strips script tags and malicious HTML payloads', () => {
    const malicious = '<script>alert("pwned")</script>Hello <b onmouseover="steal()">World</b>';
    const cleaned = sanitizeString(malicious);
    expect(cleaned).not.toContain('<script>');
    expect(cleaned).not.toContain('onmouseover');
    expect(cleaned).toContain('Hello');
    expect(cleaned).toContain('World');
  });

  it('strips javascript: pseudo-protocol URIs', () => {
    const payload = 'javascript:alert(1)';
    const cleaned = sanitizeString(payload);
    expect(cleaned).not.toContain('javascript:');
  });

  it('rejects empty or whitespace-only inputs', () => {
    const result = validateRawDatasetInput('   ');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Dataset input is empty.');
  });

  it('rejects input exceeding maximum size limit', () => {
    const hugeString = 'a'.repeat(2.5 * 1024 * 1024);
    const result = validateRawDatasetInput(hugeString);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('too large to process safely');
  });

  it('rejects malformed syntax JSON', () => {
    const result = validateRawDatasetInput('{ invalid json }');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Malformed JSON');
  });

  it('accepts valid JSON array of records', () => {
    const validJson = JSON.stringify([
      { id: '1', title: 'Coffee at Devocion', type: 'purchases', timestamp: '2025-01-01T12:00:00Z' }
    ]);
    const result = validateRawDatasetInput(validJson);
    expect(result.valid).toBe(true);
    expect(result.sanitizedData).toBeDefined();
    expect(Array.isArray(result.sanitizedData)).toBe(true);
  });

  it('accepts valid JSON object with receipts key', () => {
    const validJson = JSON.stringify({
      receipts: [
        { id: '2', title: 'Live at Elsewhere', type: 'events', timestamp: '2025-01-02T12:00:00Z' }
      ]
    });
    const result = validateRawDatasetInput(validJson);
    expect(result.valid).toBe(true);
    expect(result.sanitizedData).toBeDefined();
  });
});
