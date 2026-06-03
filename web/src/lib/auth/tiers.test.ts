import { describe, expect, it } from 'vitest';
import { compareTiers, isHigherTier, isStrictlyHigherTier, tierLabel } from './tiers';

describe('compareTiers', () => {
	it('returns negative when a is higher than b (lower numeric)', () => {
		expect(compareTiers(1, 3)).toBeLessThan(0);
	});
	it('returns positive when a is lower than b', () => {
		expect(compareTiers(4, 1)).toBeGreaterThan(0);
	});
	it('returns 0 when equal', () => {
		expect(compareTiers(2, 2)).toBe(0);
	});
});

describe('isHigherTier (>=)', () => {
	it('T1 is higher-or-equal than T3', () => {
		expect(isHigherTier(1, 3)).toBe(true);
	});
	it('T2 is higher-or-equal than T2 (equal counts)', () => {
		expect(isHigherTier(2, 2)).toBe(true);
	});
	it('T4 is not higher-or-equal than T1', () => {
		expect(isHigherTier(4, 1)).toBe(false);
	});
});

describe('isStrictlyHigherTier (>)', () => {
	it('T1 is strictly higher than T3', () => {
		expect(isStrictlyHigherTier(1, 3)).toBe(true);
	});
	it('T2 is NOT strictly higher than T2', () => {
		expect(isStrictlyHigherTier(2, 2)).toBe(false);
	});
});

describe('tierLabel', () => {
	it('formats as "T<n>"', () => {
		expect(tierLabel(0)).toBe('T0');
		expect(tierLabel(5)).toBe('T5');
	});
});
