import { differenceInDays } from 'date-fns';
import type { Flavor } from './database.types';

export type RarityLevel = 'legendary' | 'rare' | 'uncommon' | 'regular';

export interface RarityInfo {
  level: RarityLevel;
  score: number;
  label: string;
  emoji: string;
  description: string;
  className: string;
}

export function calculateRarityScore(flavor: Flavor): number {
  const firstAppeared = new Date(flavor.first_appeared);
  const now = new Date();
  const ageInDays = differenceInDays(now, firstAppeared);

  if (ageInDays <= 0) return 5; // New flavor

  const appearancesPerYear = (flavor.total_appearances / ageInDays) * 365;

  // 0-10 scale: 10 = extremely rare
  if (appearancesPerYear < 0.5) return 9.5;  // < once every 2 years
  if (appearancesPerYear < 1) return 9.0;    // < once a year
  if (appearancesPerYear < 2) return 8.0;    // < 2x/year
  if (appearancesPerYear < 4) return 7.0;    // < 4x/year
  if (appearancesPerYear < 6) return 6.0;    // < 6x/year
  if (appearancesPerYear < 12) return 4.0;   // < monthly
  if (appearancesPerYear < 26) return 3.0;   // < bi-weekly
  if (appearancesPerYear < 52) return 2.0;   // < weekly
  return 1.0; // Very regular
}

export function getRarityLevel(score: number): RarityLevel {
  if (score >= 8) return 'legendary';
  if (score >= 5) return 'rare';
  if (score >= 3) return 'uncommon';
  return 'regular';
}

export function getRarityInfo(flavor: Flavor): RarityInfo {
  const score = flavor.rarity_score ?? calculateRarityScore(flavor);
  const level = getRarityLevel(score);

  const rarityMap: Record<RarityLevel, Omit<RarityInfo, 'level' | 'score'>> = {
    legendary: {
      label: 'Legendary',
      emoji: '🔥',
      description: 'Extremely rare - appears 1-2 times ever',
      className: 'badge-legendary',
    },
    rare: {
      label: 'Rare',
      emoji: '⭐',
      description: 'Rare - appears 3-10 times per year',
      className: 'badge-rare',
    },
    uncommon: {
      label: 'Uncommon',
      emoji: '🌟',
      description: 'Uncommon - appears 11-50 times per year',
      className: 'badge-uncommon',
    },
    regular: {
      label: 'Regular',
      emoji: '✨',
      description: 'Regular - appears frequently',
      className: 'badge-regular',
    },
  };

  return {
    level,
    score,
    ...rarityMap[level],
  };
}

export function getFlavorStats(flavor: Flavor): {
  daysSinceLastSeen: number | null;
  yearsTracking: number;
  avgAppearancesPerYear: number;
  longestGap: number | null;
} {
  const now = new Date();
  const firstAppeared = new Date(flavor.first_appeared);
  const lastAppeared = flavor.last_appeared ? new Date(flavor.last_appeared) : null;

  const yearsTracking = Math.max(1, differenceInDays(now, firstAppeared) / 365);
  const avgAppearancesPerYear = flavor.total_appearances / yearsTracking;

  let daysSinceLastSeen: number | null = null;
  if (lastAppeared) {
    daysSinceLastSeen = differenceInDays(now, lastAppeared);
  }

  return {
    daysSinceLastSeen,
    yearsTracking: Math.round(yearsTracking * 10) / 10,
    avgAppearancesPerYear: Math.round(avgAppearancesPerYear * 10) / 10,
    longestGap: null, // Would need historical data to calculate
  };
}

export function sortByRarity(flavors: Flavor[]): Flavor[] {
  return [...flavors].sort((a, b) => {
    const scoreA = a.rarity_score ?? calculateRarityScore(a);
    const scoreB = b.rarity_score ?? calculateRarityScore(b);
    return scoreB - scoreA;
  });
}

export function getWatchRecommendations(
  flavors: Flavor[],
  count: number = 5
): Flavor[] {
  // Recommend rare flavors that appeared recently (so they might come back)
  return [...flavors]
    .filter((f) => {
      const score = f.rarity_score ?? calculateRarityScore(f);
      return score >= 5; // At least rare
    })
    .sort((a, b) => {
      // Sort by last appeared (most recent first)
      const lastA = a.last_appeared ? new Date(a.last_appeared).getTime() : 0;
      const lastB = b.last_appeared ? new Date(b.last_appeared).getTime() : 0;
      return lastB - lastA;
    })
    .slice(0, count);
}
