require("dotenv").config;

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

  res.json({
    userId: 123,
  });
});

app.post("/signin", async function (req, res) {
  const parseData = signInSchema.safeParse(req.body);
  if (!parseData.success) {
    console.log(parseData.error);

    return;
  }

  const user = await prismaClient.user.findFirst({
    where: {
      username: parseData.data.username,
      password: parseData.data.password,
    },
  });
  if (!user) {
    res.status(403).json({
      message: "user doesn't exist",
    });
    return;
  }
  if (!process.env.JWT_SECRET) {
    throw new Error(
      " JWT_SECRET is not defined. Please check your environment configuration."
    );
  }

  jwt.sign({ user }, process.env.JWT_SECRET);
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

app.listen(3001);
