import dotenv from "dotenv";
dotenv.config();

import express from "express";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware/middleware.js";
import {
  createUserSchema,
  signInSchema,
  createRoomSchema,
} from "@repo/common/types";
import { prismaClient } from "@repo/db/client";

const app = express();
app.use(express.json());

app.get("/pong", function (req, res) {
  res.json({
    message: "ada pada",
  });
});

app.post("/signup", async function (req, res) {
  const parseData = createUserSchema.safeParse(req.body);
  if (!parseData.success) {
    console.log(parseData.error);
    res.json({
      message: "incorrect Input",
    });
    return;
  }

  try {
    const user = await prismaClient.user.create({
      data: {
        email: parseData.data?.email,
        password: parseData.data.password,
        username: parseData.data.username,
      },
    });
    res.json({
      userId: user.id,
    });
  } catch (error) {
    res.status(411).json({
      message: "user already exist with this email",
    });
  }
});

app.post("/signin", async (req, res) => {
  console.log("➡️ /signin route hit");

  try {
    const parsedData = signInSchema.safeParse(req.body);
    console.log("Parsed data:", parsedData);

    if (!parsedData.success) {
      console.log("❌ Zod validation failed:", parsedData.error);
      res.status(400).json({ message: "Incorrect inputs" });
      return;
    }

    const user = await prismaClient.user.findFirst({
      where: {
        username: parsedData.data.username,
      },
    });

    console.log("🔍 Found user:", user);

    if (!user || user.password !== parsedData.data.password) {
      console.log("❌ User not found or password mismatch");
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    if (!process.env.JWT_SECRET) {
      throw new Error(
        " JWT_SECRET is not defined. Please check your environment configuration."
      );
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    console.log("✅ Token generated");

    res.json({ token });
    return;
  } catch (err) {
    console.error("🔥 Signin error:", err);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
});

app.post("/room", middleware, async function (req, res) {
  const parseData = createRoomSchema.safeParse(req.body);
  if (!parseData.success) {
    console.log(parseData.error);
    res.json({
      message: "incorrect Input",
    });
    return;
  }
  const userId = req.userid;

  const room = await prismaClient.room.create({
    data: {
      slug: parseData.data.name,
      adminId: userId!,
    },
  });
  res.json({
    roomId: room.id,
  });
});

app.get("/chats/:roomId", async (req, res) => {
  const roomId = Number(req.params.roomId);
  const messages = await prismaClient.chat.findMany({
    where: {
      roomId: roomId,
    },
    orderBy: {
      id: "desc",
    },
    take: 50,
  });

  res.json({
    messages,
  });
});

app.listen(3001);
