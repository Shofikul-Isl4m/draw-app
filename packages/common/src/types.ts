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

export const CreateRoomSchema = z.object({
  title: z.string(),
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
