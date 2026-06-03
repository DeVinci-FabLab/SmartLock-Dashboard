import { z } from 'zod';

export const userSchema = z.object({
	id: z.string(),
	username: z.string(),
	email: z.string(),
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	enabled: z.boolean(),
	attributes: z
		.object({
			card_id: z.array(z.string()),
		})
		.partial()
		.optional(),
});

export const userListResponseSchema = z.array(userSchema);

export type UserDTO = z.infer<typeof userSchema>;

export const userListParamsSchema = z.object({
	search: z.string().optional(),
	first: z.number().int().nonnegative().optional(),
	max_results: z.number().int().positive().max(200).optional(),
	skip: z.number().int().nonnegative().optional(),
	limit: z.number().int().positive().max(200).optional(),
	enabled: z.boolean().optional(),
});

export type UserListParams = z.infer<typeof userListParamsSchema>;
