import { Request, Response } from "express";
import { prismaClient } from "@repo/db/client";
import { customAlphabet } from "nanoid";
import { JoinRoomSchema } from "@repo/common/types";

const alphabet = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890";
const generateJoinCode = customAlphabet(alphabet, 6);

export async function createRoomController(req: Request, res: Response) {
  try {
    const userId = req.userid;
    const title = req.body.title;

    if (!userId) {
      res.status(401).json({
        message: "User not authinticated",
      });
      return;
    }

    if (!title || typeof title != "string" || title.trim().length === 0) {
      res.status(400).json({
        message: "Room title is required",
      });
    }
    const joinCode = generateJoinCode();

    const room = await prismaClient.room.create({
      data: {
        title: title.trim(),
        joinCode,
        adminId: userId,
        participants: {
          connect: [{ id: userId }],
        },
      },
      select: {
        title: true,
        id: true,
        joinCode: true,
        adminId: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      message: "Room created successfully",
      room,
    });
  } catch (e) {
    console.log("creating room", e);
    res.status(500).json({
      message: "Error creating room",
    });
    return;
  }
}

export async function joinRoomController(req: Request, res: Response) {
  const userId = req.userid;
  if (!userId) {
    res.status(401).json({
      message: "User Id not found",
    });
    return;
  }

  const validInputs = JoinRoomSchema.safeParse(req.body);
  if (!validInputs.success) {
    res.status(400).json({
      message: "Invalid Input",
      errors: validInputs.error.errors,
    });
    return;
  }

  const { joinCode } = validInputs.data;

  try {
    const room = await prismaClient.room.findUnique({
      where: {
        joinCode,
      },
      select: {
        id: true,
        title: true,
        joinCode: true,
        participants: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!room) {
      res.status(404).json({
        Message: " room not found",
      });
      return;
    }

    const alreadyParticipant = room.participants.some((p) => p.id === userId);
    if (alreadyParticipant) {
      res.status(409).json({ message: "User already joined this room" });
      return;
    }

    const updatedRoom = await prismaClient.room.update({
      where: {
        joinCode,
      },
      data: {
        participants: {
          connect: { id: userId },
        },
      },
      select: {
        id: true,
        title: true,
        joinCode: true,
        admin: true,
        createdAt: true,
      },
    });
    res.json({
      message: "Room Joined Successfully",
      room: updatedRoom,
    });
    return;
  } catch (e) {
    console.error("JoinRoom error:", e);
    res.status(500).json({
      message: "An error occurred while joining the room. Please try again.",
    });
    return;
  }
}

export async function fetchAllRoomsController(req: Request, res: Response) {
  const userId = req.userid;
  if (!userId) {
    res.status(401).json({
      message: "User Id not found",
    });
    return;
  }
  try {
    const rooms = await prismaClient.room.findMany({
      where: {
        participants: {
          some: { id: userId },
        },
      },
      select: {
        id: true,
        title: true,
        joinCode: true,
        createdAt: true,
        admin: {
          select: {
            username: true,
          },
        },
        adminId: true,
        Chat: {
          take: 1,
          orderBy: {
            serialNumber: "desc",
          },
          select: {
            user: {
              select: {
                username: true,
              },
            },
            content: true,
            createdAt: true,
          },
        },
        Draw: {
          take: 10,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const sortedRooms = rooms.sort((a, b) => {
      const aLatestChat = a.Chat[0]?.createdAt || a.createdAt;
      const bLatestChat = b.Chat[0]?.createdAt || b.createdAt;
      return new Date(bLatestChat).getTime() - new Date(aLatestChat).getTime();
    });

    res.json({
      message: "Rooms fetched successfully",
      rooms: sortedRooms,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: "Error fetching rooms",
    });
  }
}
