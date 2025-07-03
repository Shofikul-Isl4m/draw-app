import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  rooms: string[];
  userId: string;
  ws: WebSocket;
}

const users: User[] = [];

function checkUser(token: string): string | null {
  try {
    if (!process.env.JWT_SECRET) {
      console.log(process.env.JWT_SECRET, "asdsa");
      throw new Error("problem with jwt secret in ws");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (typeof decoded === "string") {
      return null;
    }
    if (!decoded || !decoded.userId) {
      return null;
    }
    return decoded.userId;
  } catch (e) {
    return null;
  }
}

wss.on("connection", function connection(ws, request) {
  const url = request.url;
  if (!url) {
    return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token")!;
  const userId = checkUser(token);

  if (!userId) {
    ws.close();
    return;
  }

  users.push({
    userId,
    rooms: [],
    ws,
  });

  ws.on("message", async function message(data) {
    const stringData = typeof data === "string" ? data : data.toString();
    const parseData = JSON.parse(stringData);
    if (parseData.type === "join_room") {
      const user = users.find((x) => x.ws === ws);
      user?.rooms.push(parseData.roomId);
    }

    if (parseData.type === "leave_room") {
      const user = users.find((x) => x.ws === ws);
      if (!user) {
        return;
      }
      user.rooms = user.rooms.filter((x) => x !== parseData.room);
      console.log("Rooms after leaving:", user.rooms);
    }

    if (parseData.type === "chat") {
      const roomId = parseData.roomId;
      const message = parseData.message;

      users.forEach((user) => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(
            JSON.stringify({
              type: "chat",
              message,
              roomId,
            })
          );
        }
      });
      await prismaClient.chat.create({
        data: {
          roomId,
          message,
          userId,
        },
      });
    }
  });
});
