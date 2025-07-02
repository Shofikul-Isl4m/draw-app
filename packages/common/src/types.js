import { z } from "zod";
export const createUserSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(6),
    email: z.string().email(),
});
export const signInSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(6),
});
export const createRoomSchema = z.object({
    name: z.string().min(3).max(20),
});
