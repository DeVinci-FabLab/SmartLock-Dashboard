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
