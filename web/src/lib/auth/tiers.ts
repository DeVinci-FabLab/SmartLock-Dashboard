import type { Tier } from './types';

/**
 * Tiers are stored as integers where 0 is the highest authority. Compare
 * directly: `a <= b` means "a is higher or equal authority". The helpers
 * below exist for caller intent — they don't do anything you couldn't do
 * with `<` and `<=`.
 */

export function compareTiers(a: Tier, b: Tier): number {
	return a - b;
}

export function isHigherTier(a: Tier, b: Tier): boolean {
	return a <= b;
}

export function isStrictlyHigherTier(a: Tier, b: Tier): boolean {
	return a < b;
}

export function tierLabel(tier: Tier): string {
	return `T${tier}`;
}
