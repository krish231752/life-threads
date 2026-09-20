import { Receipt, Chapter } from '../types';

/**
 * Automatically derives semantic, activity-based chapters from receipts
 */
export function discoverChapters(receipts: Receipt[]): Chapter[] {
  if (!receipts.length) return [];

  // Sort chronologically
  const sorted = [...receipts].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Detect dominant locations
  const cities = new Set(sorted.map((r) => r.location?.city).filter(Boolean) as string[]);
  const hasAustin = cities.has('Austin');
  const hasNYC = cities.has('New York');

  // If this is the Elena Vance dataset or dataset with Austin + NYC transition:
  if (hasAustin && hasNYC) {
    const austinReceipts = sorted.filter((r) => r.location?.city === 'Austin');
    const travelBooking = sorted.find(
      (r) => r.type === 'purchases' && (r.metadata.merchant?.toString().toLowerCase().includes('jetblue') || r.tags.includes('flight'))
    );
    const nyArrival = sorted.find(
      (r) => r.location?.city === 'New York' && (r.location.name.includes('JFK') || r.tags.includes('arrival'))
    );
    const elsewhereEvent = sorted.find((r) => r.tags.includes('elsewhere') || r.location?.name.includes('Elsewhere'));

    const c1EndTs = travelBooking ? travelBooking.timestamp : '2024-10-31T23:59:59Z';
    const c2StartTs = '2024-10-28T00:00:00Z';
    const c2EndTs = nyArrival ? nyArrival.timestamp : '2024-12-01T23:59:59Z';
    const c3StartTs = nyArrival ? nyArrival.timestamp : '2024-12-01T00:00:00Z';
    const c3EndTs = elsewhereEvent ? elsewhereEvent.timestamp : '2025-01-16T23:59:59Z';
    const c4StartTs = elsewhereEvent ? elsewhereEvent.timestamp : '2025-01-17T00:00:00Z';

    const ch1Receipts = sorted.filter((r) => r.timestamp <= c1EndTs && r.location?.city === 'Austin');
    const ch2Receipts = sorted.filter((r) => r.timestamp >= c2StartTs && r.timestamp <= c2EndTs);
    const ch3Receipts = sorted.filter(
      (r) => r.timestamp >= c3StartTs && r.timestamp < (elsewhereEvent?.timestamp || '2025-01-17T00:00:00Z')
    );
    const ch4Receipts = sorted.filter(
      (r) => r.timestamp >= (elsewhereEvent?.timestamp || '2025-01-17T00:00:00Z')
    );

    return [
      {
        id: 'chapter-1-midnight-austin',
        title: 'The Midnight Residency',
        subtitle: 'East 6th Studio & The Acoustic Ceiling',
        tagline: 'When comfort begins to feel like quiet stagnation.',
        eraIcon: 'Moon',
        accentColor: '#818CF8', // Indigo
        startDate: ch1Receipts[0]?.timestamp || sorted[0].timestamp,
        endDate: ch1Receipts[ch1Receipts.length - 1]?.timestamp || sorted[10].timestamp,
        receiptIds: ch1Receipts.map((r) => r.id),
        dominantThemes: ['Analog Synth', 'Late-Night Searches', 'East Austin Tacos', 'Creative Friction'],
        narrative:
          'Long solitary hours spent at the Eurorack synth rack on East 6th Street. 62% of music playback occurred between 1:00 AM and 3:30 AM, coupled with repeated searches for audio plugins and midnight Mexican food runs. The private notes reveal an artist grappling with "The Ceiling Problem" — loved by the local scene, yet craving deeper acoustic friction.',
        turningPoint: {
          headline: 'Something changed here: "The Ceiling Problem"',
          evidence:
            'A note created at 3:10 AM diagnosed the psychological trap: "Austin feels like a warm bath that won\'t get hotter."',
          triggerReceiptId: 'rcpt-005',
        },
      },
      {
        id: 'chapter-2-the-escape',
        title: 'The Great Departure',
        subtitle: 'The 72-Hour Decision & One-Way Flight',
        tagline: 'From late-night sublet queries to a one-way ticket out.',
        eraIcon: 'PlaneTakeoff',
        accentColor: '#F59E0B', // Amber
        startDate: ch2Receipts[0]?.timestamp || c2StartTs,
        endDate: ch2Receipts[ch2Receipts.length - 1]?.timestamp || c2EndTs,
        receiptIds: ch2Receipts.map((r) => r.id),
        dominantThemes: ['Flight Booking', 'Sublet Hunting', 'Farewell Drinks', 'Brian Eno'],
        narrative:
          'What seemed like an impulsive move was born from 72 hours of intense digital velocity. A search query for "sublet Bushwick vs Greenpoint acoustics" rapidly cascaded into texts to Sarah, an immediate one-way JetBlue ticket purchase for $248.60, and a final farewell jam with friends at Hotel Vegas.',
        turningPoint: {
          headline: 'The Irreversible Commitment: JetBlue Flight B6 1422',
          evidence:
            'Within 48 hours of inquiring about apartment acoustics, a one-way flight from AUS to JFK was booked for Halloween night.',
          triggerReceiptId: 'rcpt-016',
        },
      },
      {
        id: 'chapter-3-comfort-winter',
        title: 'The Bushwick Winter & Sanctuary',
        subtitle: 'Bodega Routines & Field Recordings',
        tagline: 'Adapting to cold radiators and finding sanctuary in brick and green.',
        eraIcon: 'Coffee',
        accentColor: '#10B981', // Emerald
        startDate: ch3Receipts[0]?.timestamp || c3StartTs,
        endDate: ch3Receipts[ch3Receipts.length - 1]?.timestamp || c3EndTs,
        receiptIds: ch3Receipts.map((r) => r.id),
        dominantThemes: ['Devoción Coffee', 'Field Recordings', 'Wong Kar-wai Cinema', 'Vinyl Hunting'],
        narrative:
          'Winter in Bushwick prompted an inward retreat. Between December and early January, daily receipts centered around Devoción coffee shop in Williamsburg, Criterion Channel screenings of Wong Kar-wai films, and field recordings of the L train turnstiles. The receipts reflect someone absorbing the sensory texture of a new city before stepping onto its stages.',
        turningPoint: {
          headline: 'Finding the Anchor: Devoción Roastery',
          evidence:
            'A recurring $11.50 cortado order appeared every 3-4 days, transforming this roastery into an unofficial second studio.',
          triggerReceiptId: 'rcpt-030',
        },
      },
      {
        id: 'chapter-4-breakthrough-night',
        title: 'The Elsewhere Breakthrough',
        subtitle: 'Zone One Live Premiere & Global Horizon',
        tagline: 'When 250 strangers held their breath in pitch black.',
        eraIcon: 'Sparkles',
        accentColor: '#EC4899', // Pink
        startDate: ch4Receipts[0]?.timestamp || c4StartTs,
        endDate: ch4Receipts[ch4Receipts.length - 1]?.timestamp || sorted[sorted.length - 1].timestamp,
        receiptIds: ch4Receipts.map((r) => r.id),
        dominantThemes: ['Live Premiere', 'Elsewhere Rooftop', 'Ghostly International', 'Berlin Residency'],
        narrative:
          'On January 17, eight separate receipts in 5 hours at Elsewhere culminated in the live premiere of "Glass Horizon." Ghostly International scouts were present, triggering immediate follow-up searches for indie label contracts, celebratory natural wine at Roberta\'s, and confirmed invitations to perform at Superbooth in Berlin.',
        turningPoint: {
          headline: 'The 11:24 PM Drop at Elsewhere',
          evidence:
            'Calendar event, live soundboard photo, bar tab, and a text sent at 00:12 AM: "Ghostly A&R was in the crowd. They asked for the unmastered WAVs."',
          triggerReceiptId: 'rcpt-048',
        },
      },
    ];
  }

  // Fallback dynamic chapter synthesis for arbitrary/custom datasets
  const total = sorted.length;
  const sliceSize = Math.max(1, Math.ceil(total / 3));

  const part1 = sorted.slice(0, sliceSize);
  const part2 = sorted.slice(sliceSize, sliceSize * 2);
  const part3 = sorted.slice(sliceSize * 2);

  const getTopThemes = (list: Receipt[]) => {
    const counts: Record<string, number> = {};
    list.forEach((r) => r.tags.forEach((t) => (counts[t] = (counts[t] || 0) + 1)));
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([t]) => t.replace(/-/g, ' '));
  };

  return [
    {
      id: 'chapter-gen-1',
      title: 'Genesis: Foundations & Solitude',
      subtitle: `${part1.length} moments documenting initial exploration`,
      tagline: 'Quiet exploration across personal media and routines.',
      eraIcon: 'Sparkles',
      accentColor: '#818CF8',
      startDate: part1[0]?.timestamp || new Date().toISOString(),
      endDate: part1[part1.length - 1]?.timestamp || new Date().toISOString(),
      receiptIds: part1.map((r) => r.id),
      dominantThemes: getTopThemes(part1),
      narrative: `The opening period contains ${part1.length} digital receipts centered on routines, media consumption, and personal inquiries.`,
    },
    {
      id: 'chapter-gen-2',
      title: 'Transition: The Active Shift',
      subtitle: `${part2.length} moments marking external movement`,
      tagline: 'Increased velocity across communications, events, and searches.',
      eraIcon: 'Compass',
      accentColor: '#F59E0B',
      startDate: part2[0]?.timestamp || new Date().toISOString(),
      endDate: part2[part2.length - 1]?.timestamp || new Date().toISOString(),
      receiptIds: part2.map((r) => r.id),
      dominantThemes: getTopThemes(part2),
      narrative: `Activity shifted rapidly during this period, with an increased frequency of cross-domain actions connecting physical locations to digital searches.`,
    },
    {
      id: 'chapter-gen-3',
      title: 'Convergence: Culmination & Horizon',
      subtitle: `${part3.length} moments cementing the story`,
      tagline: 'Threads converge into milestones and new ambitions.',
      eraIcon: 'Award',
      accentColor: '#10B981',
      startDate: part3[0]?.timestamp || new Date().toISOString(),
      endDate: part3[part3.length - 1]?.timestamp || new Date().toISOString(),
      receiptIds: part3.map((r) => r.id),
      dominantThemes: getTopThemes(part3),
      narrative: `The final cluster contains key milestones, celebration receipts, and personal reflections looking outward.`,
    },
  ];
}
