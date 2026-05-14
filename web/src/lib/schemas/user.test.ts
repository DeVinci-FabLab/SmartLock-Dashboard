import { describe, expect, it } from 'vitest';
import { userListResponseSchema, userSchema } from './user';

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
