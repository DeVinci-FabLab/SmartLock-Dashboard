import { describe, expect, it } from 'vitest';
import { userListParamsSchema, userListResponseSchema, userSchema } from './user';

describe('userSchema', () => {
	const valid = {
		id: '8e7f3...',
		username: 'alice',
		email: 'a@x',
		firstName: 'Alice',
		lastName: 'D',
		enabled: true,
		attributes: { card_id: ['AA:BB'] },
	};

	it('parses a valid user', () => {
		expect(() => userSchema.parse(valid)).not.toThrow();
	});

	it('rejects missing id', () => {
		const { id: _id, ...rest } = valid;
		expect(() => userSchema.parse(rest)).toThrow();
	});

	it('allows missing attributes', () => {
		const { attributes: _attributes, ...rest } = valid;
		expect(() => userSchema.parse(rest)).not.toThrow();
	});

	it('attributes.card_id may be empty array', () => {
		expect(() => userSchema.parse({ ...valid, attributes: { card_id: [] } })).not.toThrow();
	});
});

describe('userListResponseSchema', () => {
	it('parses an array of users', () => {
		const valid = {
			id: '1',
			username: 'a',
			email: 'a@x',
			enabled: true,
		};
		expect(() => userListResponseSchema.parse([valid, valid])).not.toThrow();
	});
});

describe('userListParamsSchema', () => {
	it('accepts empty (all defaults)', () => {
		expect(() => userListParamsSchema.parse({})).not.toThrow();
	});
	it('accepts limit + skip', () => {
		expect(() =>
			userListParamsSchema.parse({ limit: 50, skip: 0, search: 'al', enabled: true }),
		).not.toThrow();
	});
	it('rejects negative limit', () => {
		expect(() => userListParamsSchema.parse({ limit: -1 })).toThrow();
	});
	it('rejects limit over 200', () => {
		expect(() => userListParamsSchema.parse({ limit: 9999 })).toThrow();
	});
});
