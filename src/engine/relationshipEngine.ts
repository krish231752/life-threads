import { Receipt, ReceiptType, ReceiptConnection, ConnectionReason, ThreadStory, LifeStats } from '../types';

/**
 * High-performance pairwise score memoization cache
 */
const connectionScoreCache = new Map<string, { score: number; reasons: ConnectionReason[] }>();
const MAX_CACHE_ENTRIES = 50000;

export function clearConnectionCache(): void {
  connectionScoreCache.clear();
}

/**
 * Calculate distance in minutes between two ISO timestamps
 */
export function getMinutesApart(ts1: string, ts2: string): number {
  const d1 = new Date(ts1).getTime();
  const d2 = new Date(ts2).getTime();
  return Math.abs(d1 - d2) / (1000 * 60);
}

/**
 * Formats time difference in human readable string
 */
export function formatTimeDifference(mins: number): string {
  if (mins < 1) return 'Happened almost simultaneously (< 1 min)';
  if (mins < 60) return `${Math.round(mins)} minutes apart`;
  const hours = mins / 60;
  if (hours < 24) return `${hours.toFixed(1)} hours apart`;
  const days = Math.round(hours / 24);
  return `${days} ${days === 1 ? 'day' : 'days'} apart`;
}

/**
 * Named entities recognized for semantic cross-matching
 */
const KEY_ENTITIES = [
  'elsewhere',
  'devoción',
  'bushwick',
  'austin',
  'brooklyn',
  'flight',
  'troutman',
  'leo',
  'modular',
  'ghostly',
  'wong kar-wai',
  'sakamoto',
  'superbooth',
  'barton springs',
  'sequoia',
  'hardware',
  'mission',
  'tartine',
  'ferry building',
  'marcus',
  'sound design',
];

/**
 * Calculates relationship score and explanatory reasons between two receipts
 * Fully memoized with symmetric pair key
 */
export function calculateReceiptConnection(
  r1: Receipt,
  r2: Receipt
): { score: number; reasons: ConnectionReason[] } {
  if (!r1 || !r2 || r1.id === r2.id) {
    return { score: 0, reasons: [] };
  }

  // Symmetric cache lookup
  const cacheKey = r1.id < r2.id ? `${r1.id}:${r2.id}` : `${r2.id}:${r1.id}`;
  const cached = connectionScoreCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const reasons: ConnectionReason[] = [];
  let score = 0;

  // 1. TEMPORAL PROXIMITY
  const mins = getMinutesApart(r1.timestamp, r2.timestamp);
  if (mins <= 35) {
    score += 0.40;
    const time1Str = new Date(r1.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const time2Str = new Date(r2.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    reasons.push({
      type: 'temporal',
      label: 'Immediate Temporal Cluster',
      description: `Occurred ${formatTimeDifference(mins)} (${time1Str} & ${time2Str})`,
      weight: 0.95,
      evidenceClass: 'observed',
    });
  } else if (mins <= 180) {
    score += 0.25;
    reasons.push({
      type: 'temporal',
      label: 'Same Active Session',
      description: `Occurred within ${formatTimeDifference(mins)} during the same active window`,
      weight: 0.75,
      evidenceClass: 'inferred',
    });
  } else if (mins <= 1440) {
    score += 0.12;
    reasons.push({
      type: 'temporal',
      label: 'Same Day Context',
      description: `Occurred on the same day (${formatTimeDifference(mins)})`,
      weight: 0.4,
      evidenceClass: 'inferred',
    });
  }

  // 2. SPATIAL PROXIMITY
  if (r1.location && r2.location) {
    if (r1.location.name && r2.location.name && r1.location.name.toLowerCase() === r2.location.name.toLowerCase()) {
      score += 0.35;
      reasons.push({
        type: 'spatial',
        label: 'Identical Location',
        description: `Both registered at ${r1.location.name}`,
        weight: 0.9,
        evidenceClass: 'observed',
      });
    } else if (r1.location.area && r2.location.area && r1.location.area.toLowerCase() === r2.location.area.toLowerCase()) {
      score += 0.20;
      reasons.push({
        type: 'spatial',
        label: 'Same Neighborhood',
        description: `Both occurred in ${r1.location.area}${r1.location.city ? `, ${r1.location.city}` : ''}`,
        weight: 0.6,
        evidenceClass: 'observed',
      });
    } else if (r1.location.city && r2.location.city && r1.location.city.toLowerCase() === r2.location.city.toLowerCase()) {
      score += 0.10;
      reasons.push({
        type: 'spatial',
        label: 'Same City',
        description: `Both anchored in ${r1.location.city}`,
        weight: 0.3,
        evidenceClass: 'inferred',
      });
    }
  }

  // 3. SEMANTIC CONVERGENCE (Shared tags & keywords)
  const sharedTags = r1.tags.filter((tag) => r2.tags.includes(tag));
  if (sharedTags.length > 0) {
    const boost = Math.min(sharedTags.length * 0.15, 0.45);
    score += boost;
    reasons.push({
      type: 'semantic',
      label: 'Thematic Link',
      description: `Shared key motifs: ${sharedTags.map((t) => `#${t}`).join(', ')}`,
      weight: 0.8,
      evidenceClass: 'observed',
    });
  }

  // Keyword cross-match across titles and descriptions
  const r1Text = `${r1.title} ${r1.subtitle} ${r1.description || ''}`.toLowerCase();
  const r2Text = `${r2.title} ${r2.subtitle} ${r2.description || ''}`.toLowerCase();

  const matchedEntities = KEY_ENTITIES.filter(
    (k) => r1Text.includes(k) && r2Text.includes(k)
  );

  if (matchedEntities.length > 0 && !sharedTags.some((t) => matchedEntities.includes(t))) {
    score += 0.20;
    reasons.push({
      type: 'semantic',
      label: 'Shared Named Entity',
      description: `Both involve reference to "${matchedEntities[0]}"`,
      weight: 0.7,
      evidenceClass: 'observed',
    });
  }

  // 4. BEHAVIORAL & CROSS-CATEGORY DIVERSITY
  if (r1.type !== r2.type && (mins <= 240 || sharedTags.length > 0)) {
    score += 0.12;
    reasons.push({
      type: 'behavioral',
      label: 'Cross-Domain Synergy',
      description: `Bridges distinct digital mediums (${r1.type.toUpperCase()} + ${r2.type.toUpperCase()})`,
      weight: 0.65,
      evidenceClass: 'inferred',
    });
  }

  // Specific behavioral patterns
  const isSearchThenAction =
    (r1.type === 'searches' && (r2.type === 'purchases' || r2.type === 'events')) ||
    (r2.type === 'searches' && (r1.type === 'purchases' || r1.type === 'events'));
  if (isSearchThenAction && mins < 48 * 60) {
    score += 0.20;
    reasons.push({
      type: 'sequential',
      label: 'Intent to Execution Chain',
      description: 'A search query was directly followed by real-world commitment',
      weight: 0.85,
      evidenceClass: 'inferred',
    });
  }

  const isEventThenCapture =
    (r1.type === 'events' && (r2.type === 'photos' || r2.type === 'purchases' || r2.type === 'messages')) ||
    (r2.type === 'events' && (r1.type === 'photos' || r1.type === 'purchases' || r1.type === 'messages'));
  if (isEventThenCapture && mins < 240) {
    score += 0.18;
    reasons.push({
      type: 'sequential',
      label: 'Live Moment Artifact',
      description: 'Direct physical receipt captured during the active event',
      weight: 0.85,
      evidenceClass: 'observed',
    });
  }

  // Cap score at 1.0
  const finalScore = Math.min(Number(score.toFixed(2)), 1.0);
  const result = { score: finalScore, reasons };

  // Evict if cache exceeds max size
  if (connectionScoreCache.size >= MAX_CACHE_ENTRIES) {
    connectionScoreCache.clear();
  }
  connectionScoreCache.set(cacheKey, result);

  return result;
}

/**
 * Pre-filters candidate receipts for a given target when datasets are large.
 * Uses temporal, spatial, and semantic inverted indices.
 */
function getCandidateReceipts(target: Receipt, allReceipts: Receipt[]): Receipt[] {
  // If small dataset, compare with all receipts directly
  if (allReceipts.length <= 60) {
    return allReceipts.filter((r) => r.id !== target.id);
  }

  const candidateIds = new Set<string>();
  const targetTime = new Date(target.timestamp).getTime();
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

  for (const other of allReceipts) {
    if (other.id === target.id) continue;

    // Temporal candidate
    const otherTime = new Date(other.timestamp).getTime();
    if (Math.abs(targetTime - otherTime) <= threeDaysMs) {
      candidateIds.add(other.id);
      continue;
    }

    // Spatial candidate
    if (
      target.location &&
      other.location &&
      (target.location.name === other.location.name || target.location.city === other.location.city)
    ) {
      candidateIds.add(other.id);
      continue;
    }

    // Tag candidate
    if (target.tags.some((t) => other.tags.includes(t))) {
      candidateIds.add(other.id);
      continue;
    }
  }

  // Fallback if index was too strict: ensure at least 20 candidates
  if (candidateIds.size < 15) {
    return allReceipts.filter((r) => r.id !== target.id);
  }

  return allReceipts.filter((r) => candidateIds.has(r.id));
}

/**
 * Computes all top connections for a specific receipt
 */
export function getConnectionsForReceipt(
  receiptId: string,
  receipts: Receipt[],
  minScore = 0.25,
  limit = 8
): (ReceiptConnection & { receipt: Receipt })[] {
  const target = receipts.find((r) => r.id === receiptId);
  if (!target) return [];

  const candidates = getCandidateReceipts(target, receipts);
  const results: (ReceiptConnection & { receipt: Receipt })[] = [];

  for (const other of candidates) {
    const { score, reasons } = calculateReceiptConnection(target, other);
    if (score >= minScore) {
      results.push({
        targetId: other.id,
        score,
        reasons,
        receipt: other,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Trace an interactive discovery path / "Connect the Dots" chain from any starting receipt
 */
export function traceDiscoveryChain(
  startReceiptId: string,
  allReceipts: Receipt[],
  maxDepth = 5
): {
  chain: Receipt[];
  transitions: { from: Receipt; to: Receipt; score: number; reasons: ConnectionReason[] }[];
  story: string;
  timespanMinutes: number;
} {
  if (!allReceipts.length) {
    return {
      chain: [],
      transitions: [],
      story: 'No moments available to connect.',
      timespanMinutes: 0,
    };
  }

  const start = allReceipts.find((r) => r.id === startReceiptId) || allReceipts[0];
  const chain: Receipt[] = [start];
  const visitedIds = new Set<string>([start.id]);
  const transitions: { from: Receipt; to: Receipt; score: number; reasons: ConnectionReason[] }[] = [];

  let current = start;

  while (chain.length < maxDepth) {
    const candidates = getConnectionsForReceipt(current.id, allReceipts, 0.2, 20)
      .filter((c) => !visitedIds.has(c.targetId))
      .sort((a, b) => {
        const aTypeNovelty = chain.some((r) => r.type === a.receipt.type) ? 0 : 0.2;
        const bTypeNovelty = chain.some((r) => r.type === b.receipt.type) ? 0 : 0.2;
        return (b.score + bTypeNovelty) - (a.score + aTypeNovelty);
      });

    if (candidates.length === 0) break;

    const nextConn = candidates[0];
    transitions.push({
      from: current,
      to: nextConn.receipt,
      score: nextConn.score,
      reasons: nextConn.reasons,
    });
    chain.push(nextConn.receipt);
    visitedIds.add(nextConn.receipt.id);
    current = nextConn.receipt;
  }

  // Calculate timespan
  const times = chain.map((r) => new Date(r.timestamp).getTime());
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const timespanMinutes = Math.round((maxTime - minTime) / (1000 * 60));

  // Build human micro-story
  const typesInChain = Array.from(new Set(chain.map((r) => r.type)));
  let story = `${chain.length} distinct moments across ${typesInChain.length} formats (${typesInChain.join(', ')}) connected across ${formatTimeDifference(timespanMinutes)}. `;

  if (timespanMinutes < 180) {
    story += 'This sequence represents an intense, unbroken pulse of creative focus or live physical presence.';
  } else {
    story += 'Tracing this thread reveals how a subtle impulse or search rippled across days and transformed into tangible decisions.';
  }

  return {
    chain,
    transitions,
    story,
    timespanMinutes,
  };
}

/**
 * Precomputes high-profile curated "Golden Threads" from the dataset
 */
export function discoverKeyThreads(receipts: Receipt[]): ThreadStory[] {
  if (!receipts.length) return [];
  const threads: ThreadStory[] = [];

  // 1. Curated Thread: The Elsewhere Breakthrough Night (Elena Vance)
  const elsewhereIds = ['rcpt-043', 'rcpt-044', 'rcpt-045', 'rcpt-046', 'rcpt-047', 'rcpt-048', 'rcpt-049', 'rcpt-050'];
  const elsewhereReceipts = receipts.filter((r) => elsewhereIds.includes(r.id));
  if (elsewhereReceipts.length >= 4) {
    threads.push({
      id: 'thread-breakthrough-night',
      title: 'The Elsewhere Breakthrough',
      leadReceiptId: 'rcpt-046',
      connectedReceiptIds: elsewhereReceipts.map((r) => r.id),
      categoryTypes: Array.from(new Set(elsewhereReceipts.map((r) => r.type))),
      locationName: 'Elsewhere (Zone One), Bushwick',
      timeSpanMinutes: 315,
      narrative:
        'Between 8:30 PM and 1:45 AM on January 17, 2025, eight disconnected receipts document a total creative tipping point. A soundcheck event led to modular synthesizer performance, a bar celebration tab, a triumphant text to co-producer Leo, and a late-night search for record contracts.',
      evidence: [
        '8 receipts within 5.2 hours at 599 Johnson Ave',
        'Soundcheck calendar event directly precedes 11:24 PM live premiere',
        'SMS sentiment shift: "The floor was actually vibrating"',
        'Note recorded at 1:45 AM: "Remember 11:24 PM"',
      ],
      coreInsight: 'A lifetime of private studio experimentation coalesced into a single 5-hour public triumph.',
      whyThisMatters: 'Demonstrates how months of solitary technical frustration crystallize into an undeniable public pivot when captured across 8 distinct digital streams.',
    });
  }

  // 2. Curated Thread: The Austin Departure Sequence (Elena Vance)
  const departureIds = ['rcpt-012', 'rcpt-013', 'rcpt-014', 'rcpt-015', 'rcpt-016', 'rcpt-017', 'rcpt-018'];
  const departureReceipts = receipts.filter((r) => departureIds.includes(r.id));
  if (departureReceipts.length >= 4) {
    threads.push({
      id: 'thread-departure-sequence',
      title: 'The Great Leap: Austin to Bushwick',
      leadReceiptId: 'rcpt-016',
      connectedReceiptIds: departureReceipts.map((r) => r.id),
      categoryTypes: Array.from(new Set(departureReceipts.map((r) => r.type))),
      locationName: 'Austin -> New York',
      timeSpanMinutes: 4320,
      narrative:
        'A sequence of searches about Bushwick acoustics and freight shipping on Oct 28 sparked messages to friend Sarah on Oct 29, culminating in a one-way JetBlue flight booking on Halloween night and a personal packing manifesto.',
      evidence: [
        'Query: "sublet Bushwick vs Greenpoint acoustics" within 24h of apartment messages',
        'Flight purchase of $248.60 (AUS -> JFK) confirmed 48 hours later',
        'Immediate creation of "The Packing Manifesto" note shedding all non-essential gear',
      ],
      coreInsight: 'A decision that appeared sudden was preceded by 72 hours of quiet, methodical digital inquiry.',
      whyThisMatters: 'Reveals that major life disruptions rarely happen on impulse; their digital footprints show days of silent, nocturnal preparation.',
    });
  }

  // 3. Curated Thread: The Sunday Devoción Sanctuary (Elena Vance)
  const devocionReceipts = receipts.filter(
    (r) =>
      r.location?.name?.toLowerCase().includes('devoción') ||
      r.title.toLowerCase().includes('devoción')
  );
  if (devocionReceipts.length >= 3) {
    threads.push({
      id: 'thread-devocion-sanctuary',
      title: 'The Williamsburg Coffee Sanctuary',
      leadReceiptId: devocionReceipts[0].id,
      connectedReceiptIds: devocionReceipts.map((r) => r.id),
      categoryTypes: Array.from(new Set(devocionReceipts.map((r) => r.type))),
      locationName: 'Devoción, Williamsburg',
      timeSpanMinutes: 100800,
      narrative:
        'Across 3 separate months, this plant-filled brick roastery served as an anchor. It connects early field recording notes on L-train acoustics with contract negotiations and international residency applications.',
      evidence: [
        'Repeated visits on Dec 5, Dec 18, and Feb 12',
        'Identical cortado purchase patterns ($10.50 - $11.75)',
        'Evolution from ambient listening to international Superbooth applications',
      ],
      coreInsight: 'Physical consistency provided the anchor for immense creative mobility.',
      whyThisMatters: 'Proves how creative stability requires physical rituals—an identical order and location creates safe ground for ambitious artistic risks.',
    });
  }

  // 4. Curated Thread: The Late-Night Taqueria & Modular Synthesis Era (Elena Vance)
  const lateAustinReceipts = receipts.filter(
    (r) => ['rcpt-001', 'rcpt-002', 'rcpt-003', 'rcpt-004', 'rcpt-005'].includes(r.id)
  );
  if (lateAustinReceipts.length >= 3) {
    threads.push({
      id: 'thread-midnight-austin',
      title: 'The 2:00 AM Synthesis Ritual',
      leadReceiptId: 'rcpt-001',
      connectedReceiptIds: lateAustinReceipts.map((r) => r.id),
      categoryTypes: Array.from(new Set(lateAustinReceipts.map((r) => r.type))),
      locationName: 'East 6th / Riverside, Austin',
      timeSpanMinutes: 90,
      narrative:
        'Between 1:42 AM and 3:10 AM, five distinct records trace Nils Frahm listening, analog tape saturation searches, a frustrated bassline text to Leo, late-night barbacoa tacos, and a private journal entry diagnosing "The Ceiling Problem."',
      evidence: [
        '5 digital receipts spanning audio, search, text, purchase, and private note in 88 minutes',
        'Immediate progression from sound design doubt to physical hunger to existential note',
      ],
      coreInsight: 'Late-night receipts expose the emotional friction that preceded the decision to relocate.',
      whyThisMatters: 'Unmasks the emotional crisis hidden beneath mundane receipts: late-night searches and taco runs mark the exact threshold of creative burn-out.',
    });
  }

  // 5. Curated Thread for Marcus Ray: The Mission Synthesis & Studio Sprint
  const marcusStudio = receipts.filter((r) =>
    r.tags.some((t) => ['synth', 'field-recording', 'coffee', 'mission', 'ambient'].includes(t)) ||
    Boolean(r.location?.area?.toLowerCase().includes('mission')) ||
    r.title.toLowerCase().includes('tartine')
  );
  if (threads.length === 0 && marcusStudio.length >= 4) {
    threads.push({
      id: 'thread-marcus-mission',
      title: 'The Mission District Audio Sprint',
      leadReceiptId: marcusStudio[0].id,
      connectedReceiptIds: marcusStudio.slice(0, 6).map((r) => r.id),
      categoryTypes: Array.from(new Set(marcusStudio.slice(0, 6).map((r) => r.type))),
      locationName: 'Mission District, San Francisco',
      timeSpanMinutes: 480,
      narrative:
        'A sequence of field recordings in Mission Dolores, Tartine morning purchases, modular patch designs, and evening sound check notes reveals a recurring creative loop in San Francisco.',
      evidence: [
        'Spatial concentration within 1.5 miles in the Mission corridor',
        'Interleaving coffee receipts and generative audio renders',
        'Direct connection between field audio capture and evening studio notes',
      ],
      coreInsight: 'Urban exploration directly fuels iterative sound synthesis workflows.',
      whyThisMatters: 'Shows how physical environments directly shape digital output and musical texture.',
    });
  }

  // 6. Generic Algorithmic Fallback for Any Custom Dataset
  if (threads.length < 3 && receipts.length >= 4) {
    const rankedReceipts = receipts
      .map((r) => ({
        receipt: r,
        connections: getConnectionsForReceipt(r.id, receipts, 0.25, 6),
      }))
      .sort((a, b) => b.connections.length - a.connections.length);

    const usedIds = new Set<string>();
    threads.forEach((th) => th.connectedReceiptIds.forEach((id) => usedIds.add(id)));

    for (const item of rankedReceipts) {
      if (threads.length >= 4) break;
      if (usedIds.has(item.receipt.id) || item.connections.length < 1) continue;

      const clusterReceipts = [item.receipt, ...item.connections.slice(0, 5).map((c) => c.receipt)];
      clusterReceipts.forEach((r) => usedIds.add(r.id));

      const times = clusterReceipts.map((r) => new Date(r.timestamp).getTime());
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);
      const timespanMins = Math.max(15, Math.round((maxTime - minTime) / (1000 * 60)));
      const types = Array.from(new Set(clusterReceipts.map((r) => r.type)));

      threads.push({
        id: `thread-auto-${item.receipt.id}`,
        title: `${item.receipt.title} (${types.length} Domains Linked)`,
        leadReceiptId: item.receipt.id,
        connectedReceiptIds: clusterReceipts.map((r) => r.id),
        categoryTypes: types,
        locationName: item.receipt.location?.name || item.receipt.location?.city || 'Cross-Location',
        timeSpanMinutes: timespanMins,
        narrative: `An emergent pattern linking ${clusterReceipts.length} moments across ${types.join(', ')}. Discovered through shared temporal clusters, matching motifs (${item.receipt.tags.slice(0, 2).join(', ')}), and sequential behavioral synergy.`,
        evidence: [
          `${clusterReceipts.length} receipts synchronized across ${formatTimeDifference(timespanMins)}`,
          `High multi-domain diversity spanning ${types.length} medium types`,
          `Average connection correlation: ${Math.round((item.connections[0]?.score || 0.6) * 100)}%`,
        ],
        coreInsight: 'Disconnected digital activities reflect a coherent underlying focus when analyzed across multiple dimensions.',
        whyThisMatters: 'Highlights the hidden synergy connecting seemingly unrelated digital breadcrumbs into an intentional life arc.',
      });
    }
  }

  return threads;
}

/**
 * Calculates overall statistical & storytelling summary
 */
export function calculateLifeStats(receipts: Receipt[]): LifeStats {
  const typeCounts: Record<ReceiptType, number> = {
    music: 0,
    movies: 0,
    places: 0,
    purchases: 0,
    photos: 0,
    messages: 0,
    searches: 0,
    events: 0,
    notes: 0,
  };

  if (!receipts.length) {
    return {
      totalMoments: 0,
      typeCounts,
      totalPlaces: 0,
      totalSpend: 0,
      dateRange: {
        start: new Date().toISOString(),
        end: new Date().toISOString(),
        daysCount: 0,
      },
      totalThreadsDiscovered: 0,
      totalChapters: 0,
      peakHour: {
        hour: 12,
        label: '12:00 PM — 2:00 PM',
        count: 0,
        description: 'Awaiting moment data to detect nocturnal spikes or daily rituals.',
      },
      crossMediumRate: 0,
    };
  }

  const placesSet = new Set<string>();
  const placeCounts: Record<string, { count: number; city: string }> = {};
  const hourHistogram = new Array(24).fill(0);
  let totalSpend = 0;

  for (const r of receipts) {
    typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
    if (r.location?.name) {
      placesSet.add(r.location.name);
      const key = r.location.name;
      if (!placeCounts[key]) {
        placeCounts[key] = { count: 0, city: r.location.city || '' };
      }
      placeCounts[key].count += 1;
    }
    if (r.metadata.amount && typeof r.metadata.amount === 'number') {
      totalSpend += r.metadata.amount;
    }

    try {
      const h = new Date(r.timestamp).getHours();
      if (!isNaN(h)) {
        hourHistogram[h] += 1;
      }
    } catch {
      // ignore invalid date
    }
  }

  // Determine Peak Hour
  let peakH = 23;
  let maxCount = 0;
  for (let i = 0; i < 24; i++) {
    if (hourHistogram[i] > maxCount) {
      maxCount = hourHistogram[i];
      peakH = i;
    }
  }

  const formatH = (h: number) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const num = h % 12 === 0 ? 12 : h % 12;
    return `${num}:00 ${ampm}`;
  };

  const peakHour = {
    hour: peakH,
    label: `${formatH(peakH)} — ${formatH((peakH + 2) % 24)}`,
    count: maxCount,
    description:
      peakH >= 22 || peakH <= 4
        ? 'Late-night nocturnal spike representing deep creative flow and private inquiry'
        : peakH >= 5 && peakH <= 11
        ? 'Morning ritual window with high concentration of coffee and reflective notes'
        : 'Afternoon momentum window with active collaboration and physical receipts',
  };

  // Determine Top Sanctuary
  let topSanctuaryName = '';
  let topSanctuaryCity = '';
  let topSanctuaryCount = 0;
  for (const [pName, pData] of Object.entries(placeCounts)) {
    if (pData.count > topSanctuaryCount) {
      topSanctuaryCount = pData.count;
      topSanctuaryName = pName;
      topSanctuaryCity = pData.city;
    }
  }

  const topSanctuary = topSanctuaryName
    ? {
        name: topSanctuaryName,
        city: topSanctuaryCity,
        count: topSanctuaryCount,
      }
    : undefined;

  const timestamps = receipts.map((r) => new Date(r.timestamp).getTime()).sort((a, b) => a - b);
  const start = timestamps.length ? new Date(timestamps[0]).toISOString() : new Date().toISOString();
  const end = timestamps.length ? new Date(timestamps[timestamps.length - 1]).toISOString() : new Date().toISOString();
  const daysCount = timestamps.length
    ? Math.max(1, Math.round((timestamps[timestamps.length - 1] - timestamps[0]) / (1000 * 60 * 60 * 24)))
    : 1;

  const threads = discoverKeyThreads(receipts);

  // Cross-medium connection calculation: % of receipts that connect strongly to a different medium type
  let multiMediumCount = 0;
  const sampleSize = Math.min(receipts.length, 30);
  for (const r of receipts.slice(0, sampleSize)) {
    const conns = getConnectionsForReceipt(r.id, receipts, 0.25, 4);
    if (conns.some((c) => c.receipt.type !== r.type)) {
      multiMediumCount += 1;
    }
  }
  const crossMediumRate = sampleSize > 0 ? Math.round((multiMediumCount / sampleSize) * 100) : 0;

  return {
    totalMoments: receipts.length,
    typeCounts,
    totalPlaces: placesSet.size,
    totalSpend: Math.round(totalSpend),
    dateRange: {
      start,
      end,
      daysCount,
    },
    totalThreadsDiscovered: threads.length,
    totalChapters: Math.min(receipts.length, 4),
    peakHour,
    topSanctuary,
    crossMediumRate,
  };
}
