import { describe, expect, it } from 'vitest';
import { compareTiers, isHigherTier, isStrictlyHigherTier, tierRank } from './tiers';

describe('tierRank', () => {
	it('T0 is rank 0 (highest)', () => {
		expect(tierRank('T0')).toBe(0);
	});
	it('T5 is rank 5 (lowest)', () => {
		expect(tierRank('T5')).toBe(5);
	});
});

describe('compareTiers', () => {
	it('returns negative when a is higher than b (lower rank number)', () => {
		expect(compareTiers('T1', 'T3')).toBeLessThan(0);
	});
	it('returns positive when a is lower than b', () => {
		expect(compareTiers('T4', 'T1')).toBeGreaterThan(0);
	});
	it('returns 0 when equal', () => {
		expect(compareTiers('T2', 'T2')).toBe(0);
	});
});

describe('isHigherTier (>=)', () => {
	it('T1 is higher-or-equal than T3', () => {
		expect(isHigherTier('T1', 'T3')).toBe(true);
	});
	it('T2 is higher-or-equal than T2 (equal counts)', () => {
		expect(isHigherTier('T2', 'T2')).toBe(true);
	});
	it('T4 is not higher-or-equal than T1', () => {
		expect(isHigherTier('T4', 'T1')).toBe(false);
	});
});

describe('isStrictlyHigherTier (>)', () => {
	it('T1 is strictly higher than T3', () => {
		expect(isStrictlyHigherTier('T1', 'T3')).toBe(true);
	});
	it('T2 is NOT strictly higher than T2', () => {
		expect(isStrictlyHigherTier('T2', 'T2')).toBe(false);
	});
	it('T4 is not strictly higher than T1', () => {
		expect(isStrictlyHigherTier('T4', 'T1')).toBe(false);
	});
});
