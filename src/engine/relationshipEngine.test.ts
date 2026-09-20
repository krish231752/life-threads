import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateReceiptConnection,
  getConnectionsForReceipt,
  traceDiscoveryChain,
  calculateLifeStats,
  discoverKeyThreads,
  clearConnectionCache,
} from './relationshipEngine';
import { Receipt } from '../types';

describe('Relationship Engine Logic', () => {
  beforeEach(() => {
    clearConnectionCache();
  });

  const sampleReceiptA: Receipt = {
    id: 'rcpt-test-1',
    type: 'music',
    title: 'Nils Frahm — Says',
    subtitle: 'Late night listening on headphones',
    timestamp: '2025-01-10T02:00:00Z',
    location: {
      name: 'East Austin Studio',
      city: 'Austin',
      area: 'East Austin',
    },
    tags: ['ambient', 'modular', 'synthesis'],
    metadata: {
      mood: 'contemplative',
    },
  };

  const sampleReceiptB: Receipt = {
    id: 'rcpt-test-2',
    type: 'searches',
    title: 'Analog tape saturation techniques',
    subtitle: 'Search query',
    timestamp: '2025-01-10T02:15:00Z', // 15 mins later
    location: {
      name: 'East Austin Studio',
      city: 'Austin',
      area: 'East Austin',
    },
    tags: ['synthesis', 'production'],
    metadata: {
      query: 'analog tape saturation techniques',
    },
  };

  const sampleReceiptC: Receipt = {
    id: 'rcpt-test-3',
    type: 'purchases',
    title: 'Moog Subharmonicon Synth',
    subtitle: 'Gear purchase',
    timestamp: '2025-01-11T14:00:00Z',
    location: {
      name: 'Switched On Electronics',
      city: 'Austin',
    },
    tags: ['modular', 'hardware'],
    metadata: {
      amount: 699,
    },
  };

  it('calculates strong relationship for temporally and spatially proximate moments', () => {
    const { score, reasons } = calculateReceiptConnection(sampleReceiptA, sampleReceiptB);
    expect(score).toBeGreaterThan(0.5);
    expect(reasons.some((r) => r.type === 'temporal')).toBe(true);
    expect(reasons.some((r) => r.type === 'spatial')).toBe(true);
    expect(reasons.some((r) => r.type === 'semantic')).toBe(true);
  });

  it('caches pairwise relationship scores for high-performance lookups', () => {
    const res1 = calculateReceiptConnection(sampleReceiptA, sampleReceiptB);
    // Call again in reverse argument order
    const res2 = calculateReceiptConnection(sampleReceiptB, sampleReceiptA);
    expect(res1.score).toBe(res2.score);
    expect(res1.reasons.length).toBe(res2.reasons.length);
  });

  it('returns sorted top connections for a receipt', () => {
    const all = [sampleReceiptA, sampleReceiptB, sampleReceiptC];
    const connections = getConnectionsForReceipt(sampleReceiptA.id, all, 0.1, 5);
    expect(connections.length).toBeGreaterThanOrEqual(1);
    expect(connections[0].receipt.id).toBe(sampleReceiptB.id);
  });

  it('traces a discovery chain across connected moments', () => {
    const all = [sampleReceiptA, sampleReceiptB, sampleReceiptC];
    const { chain, story, transitions } = traceDiscoveryChain(sampleReceiptA.id, all, 3);
    expect(chain.length).toBeGreaterThanOrEqual(2);
    expect(chain[0].id).toBe(sampleReceiptA.id);
    expect(transitions.length).toBe(chain.length - 1);
    expect(story).toBeTruthy();
  });

  it('calculates life stats cleanly for empty and populated datasets', () => {
    const emptyStats = calculateLifeStats([]);
    expect(emptyStats.totalMoments).toBe(0);
    expect(emptyStats.totalSpend).toBe(0);

    const populatedStats = calculateLifeStats([sampleReceiptA, sampleReceiptB, sampleReceiptC]);
    expect(populatedStats.totalMoments).toBe(3);
    expect(populatedStats.totalSpend).toBe(699);
    expect(populatedStats.totalPlaces).toBeGreaterThanOrEqual(2);
  });
});
