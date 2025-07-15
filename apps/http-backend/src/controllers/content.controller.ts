import { Request, Response } from "express";
import { prismaClient } from "@repo/db/client";
import { Prisma } from "../../../../packages/db/dist/generated/prisma/index.js";

export async function getHomeInfo(req: Request, res: Response) {
  const { title } = req.query;
  const userId = req.userid;

  if (!userId) {
    res.status(400).json({ message: "User ID is required" });
    return;
  }

  const roomSelect = {
    id: true,
    title: true,
    joinCode: true,
    Chat: {
      take: 1,
      orderBy: {
        serialNumber: Prisma.SortOrder.desc,
      },
      select: {
        user: {
          select: {
            name: true,
          },
        },
        content: true,
      },
    },
  };

  try {
    let rooms;
    if (title) {
      rooms = await prismaClient.room.findMany({
        where: {
          title: { contains: String(title) },
          participants: { some: { id: userId } },
        },
        select: roomSelect,
      });
    } else {
      rooms = await prismaClient.room.findMany({
        where: { participants: { some: { id: userId } } },
        select: roomSelect,
      });
    }
    res.status(200).json({ rooms });
    return;
  } catch (e) {
    console.log(e);
    res.status(401).json({
      message: "Could not fetch rooms",
    });
  }
}

export async function getAllChatMessages(req: Request, res: Response) {
  const userId = req.userid;
  if (!userId) {
    res.status(401).json({
      message: "User Id not found",
    });
    return;
  }

  const { roomId } = req.params;
  const { lastSrNo } = req.query;

  if (!roomId) {
    res.status(400).json({
      message: "Room Id is required",
    });
  }

  try {
    const room = await prismaClient.room.findFirst({
      where: {
        id: roomId,
        participants: {
          some: { id: userId },
        },
      },
      select: {
        id: true,
        title: true,
        joinCode: true,
      },
    });

    if (!room) {
      res.status(404).json({
        message: "User not part of the room",
      });
      return;
    }

    let messages;

    if (lastSrNo !== undefined) {
      messages = await prismaClient.chat.findMany({
        where: {
          roomId: roomId,
          serialNumber: {
            lt: parseInt(lastSrNo as string),
          },
        },
        select: {
          id: true,
          content: true,
          serialNumber: true,
          createdAt: true,
          userId: true,
          user: {
            select: {
              username: true,
            },
          },
          roomId: true,
        },
        take: 25,
        orderBy: {
          serialNumber: "desc",
        },
      });
    } else {
      messages = await prismaClient.chat.findMany({
        where: {
          roomId: roomId,
        },
        select: {
          id: true,
          content: true,
          serialNumber: true,
          createdAt: true,
          userId: true,
          user: {
            select: {
              username: true,
            },
          },
          roomId: true,
        },
        take: 25,
        orderBy: {
          serialNumber: "desc",
        },
      });
    }

    res.json({
      messages: messages.reverse(),
    });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({ message: "Could not fetch messages" });
    return;
  }
}

export async function getAllDraws(req: Request, res: Response) {
  const userId = req.userid;
  if (!userId) {
    res.status(401).json({
      message: "User Id not found",
    });
    return;
  }

  const { roomId } = req.params;

  try {
    const draws = await prismaClient.draw.findMany({
      where: {
        roomId: roomId,
      },
    });

    res.json({
      draws,
    });
  } catch (e) {
    console.log(e);
    res.status(401).json({
      message: "Could not fetch draws",
    });
  }
}
