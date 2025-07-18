export interface Draw {
  id: string;
  shape:
    | "rectangle"
    | "diamond"
    | "circle"
    | "line"
    | "arrow"
    | "text"
    | "freeHand";
  strokeStyle: string;
  fillStyle: string;
  lineWidth: number;
  font: string;
  fontSize: string;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  text: string;
  points: { x: number; y: number }[];
}

export interface Message {
  id: string;
  content: string;
  serialNumber: number;
  userId: string;
  roomId: string;
  createdAt: Date;
  user: { username: string };
}

export interface Action {
  type: "create" | "move" | "resize" | "erase" | "edit";
  originalDraw: Draw | null;
  modifiedDraw: Draw | null;
}

export interface User {
  id: string;
  name: string;
  username: string;
}

export interface Room {
  id: string;
  title: string;
  joinCode: string;
  adminId: string;
  Chat: {
    user: {
      username: string;
    };
    content: string;
  }[];
  Draw: Draw[];
  admin: {
    username: string;
  };
  createdAt: string;
}

export type UserStats = {
  totalRooms: number;
  savedRooms: number;
  temporaryRooms: number;
  limits: {
    maxRooms: number;
    maxSavedRooms: number;
    maxTimeLimit: number;
    maxUsers: number;
  };
};

import { LucideIcon } from "lucide-react";

export type Rooms = {
  [k: string]: RoomWithParticipants;
};

export type RoomParticipant = {
  id: string;
  tempUsername: string | null;
  tempUserId: string | null;
  joinedAt: Date;
  leftAt: Date | null;
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
  } | null;
};

export type RoomWithParticipants = {
  id: string;
  name: string;
  isTemporary: boolean;
  maxTimeLimit: number;
  maxUsers: number;
  createdById: string;
  _count: {
    messages: number;
  };
  participants: RoomParticipant[];
  updatedAt: Date;
  closedAt: Date;
  createdAt: Date;
};

export type UserWithRooms = {
  id: string;
  rooms: RoomWithParticipants[];
  RoomParticipant: {
    room: RoomWithParticipants;
  }[];
};

export interface Message {
  userId: string;
  id: string;
  username: string;
  avatar: string;
  content: string;
  sentAt: Date;
  reactions: Record<string, { id: string; name: string; avatar: string }[]>;
  image?: string;
  userEmoji?: string;
}

export interface UserIdentity {
  userId: string;
  username: string;
  avatar: string;
}

export interface PageClientProps {
  roomId: string;
  token?: string;
}
export type Reaction = {
  emoji: string;
  total: number;
  users: {
    id: string;
    name: string;
    avatar: string;
  }[];
};

export interface PricingFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface PricingPlan {
  name: string;
  icon: LucideIcon;
  description: string;
  price: string;
  badge: string | null;
  features: PricingFeature[];
}
