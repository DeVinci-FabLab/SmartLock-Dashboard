import type { Tier } from './types';

const RANK: Record<Tier, number> = {
	T0: 0,
	T1: 1,
	T2: 2,
	T3: 3,
	T4: 4,
	T5: 5,
};

export function tierRank(tier: Tier): number {
	return RANK[tier];
}

export function compareTiers(a: Tier, b: Tier): number {
	return tierRank(a) - tierRank(b);
}

export function isHigherTier(a: Tier, b: Tier): boolean {
	return compareTiers(a, b) <= 0;
}

export function isStrictlyHigherTier(a: Tier, b: Tier): boolean {
	return compareTiers(a, b) < 0;
}
