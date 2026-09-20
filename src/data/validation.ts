import { Receipt, ReceiptType } from '../types';

export const MAX_DATASET_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB maximum
export const MAX_RECEIPTS_LIMIT = 2000;
export const MAX_STRING_LENGTH = 1000;

export const VALID_RECEIPT_TYPES: Set<ReceiptType> = new Set([
  'music',
  'movies',
  'places',
  'purchases',
  'photos',
  'messages',
  'searches',
  'events',
  'notes',
]);

/**
 * Strips dangerous HTML tags and script patterns to prevent XSS.
 */
export function sanitizeString(val: unknown, maxLength = MAX_STRING_LENGTH): string {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  // Strip script tags, HTML tags, and dangerous javascript: or data: URIs
  const cleaned = str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '');
  return cleaned.length > maxLength ? cleaned.slice(0, maxLength) + '...' : cleaned;
}

/**
 * Validates whether an ISO string or date representation is a valid, parseable date.
 */
export function isValidDate(val: unknown): boolean {
  if (!val || typeof val !== 'string' && typeof val !== 'number') return false;
  const parsed = Date.parse(String(val));
  return !isNaN(parsed) && parsed > 0 && parsed < 253402300799000; // between 1970 and 9999
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitizedData?: any[];
}

/**
 * Validates raw JSON input string for size, syntax, structure, and constraints.
 */
export function validateRawDatasetInput(rawJson: string): ValidationResult {
  if (!rawJson || !rawJson.trim()) {
    return { valid: false, error: 'Dataset input is empty.' };
  }

  // Check character size constraint (2MB)
  if (rawJson.length > MAX_DATASET_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'Dataset is too large to process safely in the browser (Maximum size: 2MB).',
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch (err: any) {
    return {
      valid: false,
      error: `Malformed JSON: ${err?.message || 'Syntax error in JSON structure.'}`,
    };
  }

  if (!parsed || typeof parsed !== 'object') {
    return {
      valid: false,
      error: 'Invalid root element. Expected a JSON array or an object containing a receipts array.',
    };
  }

  let rawList: unknown[] = [];
  if (Array.isArray(parsed)) {
    rawList = parsed;
  } else {
    const obj = parsed as Record<string, unknown>;
    const candidate = obj.receipts || obj.moments || obj.data || obj.items;
    if (Array.isArray(candidate)) {
      rawList = candidate;
    } else {
      return {
        valid: false,
        error: 'JSON must be an array of receipts or an object with a "receipts" or "moments" array.',
      };
    }
  }

  if (rawList.length === 0) {
    return { valid: false, error: 'Dataset contains 0 records. Please provide at least one receipt.' };
  }

  if (rawList.length > MAX_RECEIPTS_LIMIT) {
    return {
      valid: false,
      error: `Dataset exceeds maximum limit of ${MAX_RECEIPTS_LIMIT} moments for browser processing.`,
    };
  }

  return { valid: true, sanitizedData: rawList };
}
