import { z } from "zod";

export const UserSignupSchema = z.object({
  username: z.string(),
  password: z.string().min(8),
  name: z.string(),
});

export const UserSigninSchema = z.object({
  username: z.string(),
  password: z.string().min(8),
});

export const createRoomSchema = z.object({
  title: z.string().min(1, "Room name is required"),

  maxTimeLimit: z.number().min(1, "Time limit must be at least 1 minute"),
  maxUsers: z
    .number()
    .min(2, "Room must allow at least 2 users")
    .max(200, "Maximum 200 users allowed"),
});

export const JoinRoomSchema = z.object({
  joinCode: z.string().length(6),
});

export const WebSocketMessageSchema = z.object({
  type: z.enum([
    "connect_room",
    "disconnect_room",
    "chat_message",
    "draw",
    "error_message",
  ]),
  roomId: z.string(),
  userId: z.string(),
  content: z.string().optional(),
});

export type WebSocketMessage = z.infer<typeof WebSocketMessageSchema>;
