import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { prismaClient } from "@repo/db/client";
import { WebSocketMessageSchema } from "@repo/common/types";

const wss = new WebSocketServer({ port: 8080 });

interface WSConnection {
  userId: string;
  ws: WebSocket;
  verified: Boolean;
}

const activeRooms = new Map<string, WSConnection[]>();
const userVerificationStatus = new Map<
  WebSocket,
  { verified: boolean; userId?: string }
>();

wss.on("connection", async function connection(ws, request) {
  const url = request.url;
  if (!url) {
    return;
  }
  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token")!;

  userVerificationStatus.set(ws, { verified: false });

  ws.on("message", async function message(data) {
    const userStatus = userVerificationStatus.get(ws);

    if (!userStatus?.verified) {
      ws.send(
        JSON.stringify({
          type: "error_message",
          content: "User not verified",
        })
      );
      return;
    }
    const stringData = typeof data === "string" ? data : data.toString();
    const parseData = JSON.parse(stringData);
    const validMessage = WebSocketMessageSchema.safeParse(parseData);

    if (!validMessage.success) {
      console.log("Invalid message type : ", parseData);
      ws.send(
        JSON.stringify({
          type: "error_message",
          content: "Invalid Message Schema/Format",
        })
      );
      return;
    }

    switch (validMessage.data.type) {
      case "connect_room":
        activeRooms.set(validMessage.data.roomId, [
          ...(activeRooms.get(validMessage.data.roomId) || []),
          { userId: validMessage.data.userId!, ws, verified: true },
        ]);
        break;
      case "disconnect_room":
        for (const [roomId, connections] of activeRooms.entries()) {
          const updatedConnections = connections.filter(
            (conn) => conn.ws !== ws
          );
          if (updatedConnections.length === 0) {
            activeRooms.delete(roomId);
          } else {
            activeRooms.set(roomId, updatedConnections);
          }
        }
        break;

      case "chat_message": {
        const socketList = activeRooms.get(validMessage.data.roomId);
        if (
          !socketList?.some(
            (conn) => conn.userId === validMessage.data.userId && conn.ws === ws
          )
        ) {
          ws.send(
            JSON.stringify({
              type: "error_message",
              content: "not connected to the room",
            })
          );
          return;
        }

        try {
          const addChat = await prismaClient.chat.create({
            data: {
              userId: validMessage.data.userId,
              content: validMessage.data.content!,
              roomId: validMessage.data.roomId,
            },
            select: {
              id: true,
              userId: true,
              content: true,
              roomId: true,
              serialNumber: true,
              createdAt: true,
              user: {
                select: {
                  username: true,
                },
              },
            },
          });

          socketList.forEach((member) => {
            member.ws.send(
              JSON.stringify({
                type: "chat_message",
                userId: validMessage.data.userId,
                roomId: validMessage.data.roomId,
                content: JSON.stringify(addChat),
              })
            );
          });
        } catch (e) {
          console.log(e);
          ws.send(
            JSON.stringify({
              type: "error_message",
              content: "error handling chat message",
            })
          );
        }
        break;
      }

      case "draw": {
        const socketList = activeRooms.get(validMessage.data.roomId!);

        if (
          !socketList?.some(
            (conn) => conn.userId === validMessage.data.userId && conn.ws === ws
          )
        ) {
          ws.send(
            JSON.stringify({
              type: "error_message",
              content: "Not connected to the room",
            })
          );
          return;
        }

        const drawData = JSON.parse(validMessage.data.content!);

        try {
          let addedDraw;
          let draw;
          switch (drawData.type) {
            case "create":
              draw = drawData.modifiedDraw;
              addedDraw = await prismaClient.draw.create({
                data: {
                  id: draw.id,
                  shape: draw.shape,
                  strokeStyle: draw.strokeStyle,
                  fillStyle: draw.fillStyle,
                  lineWidth: draw.lineWidth,
                  font: draw.font,
                  fontSize: draw.fontSize,
                  startX: draw.startX,
                  startY: draw.startY,
                  endX: draw.endX,
                  endY: draw.endY,
                  text: draw.text,
                  points: draw.points,
                  roomId: validMessage.data.roomId!,
                },
              });
              break;

            case "move":
            case "edit":
            case "resize":
              draw = drawData.modifiedDraw;
              addedDraw = prismaClient.draw.update({
                where: {
                  id: draw.id,
                },
                data: {
                  shape: draw.shape,
                  strokeStyle: draw.strokeStyle,
                  fillStyle: draw.fillStyle,
                  lineWidth: draw.lineWidth,
                  font: draw.font,
                  fontSize: draw.fontSize,
                  startX: draw.startX,
                  startY: draw.startY,
                  endX: draw.endX,
                  endY: draw.endY,
                  text: draw.text,
                  points: draw.points,
                },
              });
              break;
            case "erase":
              draw = drawData.originalDraw;
              addedDraw = await prismaClient.draw.delete({
                where: { id: draw.id },
              });
              break;
          }

          socketList?.forEach((member) => {
            member.ws.send(
              JSON.stringify({
                type: "draw",
                userId: validMessage.data.userId,
                roomId: validMessage.data.roomId,
                content: validMessage.data.content,
              })
            );
          });
        } catch (e) {
          console.log(e);
          ws.send(
            JSON.stringify({
              type: "error_message",
              content: "error adding draw",
            })
          );
        }
        break;
      }
    }
  });

  ws.on("close", () => {
    userVerificationStatus.delete(ws);
    for (const [roomId, connections] of activeRooms.entries()) {
      const updatedConnections = connections.filter((conn) => {
        conn.ws !== ws;
      });
      if (updatedConnections.length === 0) {
        activeRooms.delete(roomId);
      } else {
        activeRooms.set(roomId, updatedConnections);
      }
    }
  });

  if (!token) {
    console.log("Token not found");
    ws.send(
      JSON.stringify({
        type: "error_message",
        content: "Token not found",
      })
    );
    ws.close();
    return;
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (!verified?.id) {
      console.log("User not authorised");
      ws.send(
        JSON.stringify({
          type: "error_message",
          content: "User not authorised",
        })
      );
      ws.close();
      return;
    }

    const userFound = await prismaClient.user.findFirst({
      where: { id: verified.id },
    });

    if (!userFound) {
      console.log("user does not exist");
      (ws.send(
        JSON.stringify({
          type: "error_message",
          content: "user does not exist",
        })
      ),
        ws.close());
      return;
    }

    userVerificationStatus.set(ws, { verified: true, userId: verified.id });
    ws.send(
      JSON.stringify({
        type: " connection_ready",
        userId: verified.id,
      })
    );
  } catch (e) {
    console.log(e);
    console.log("Error verifing user");
    ws.send(
      JSON.stringify({
        type: "error_message",
        content: "Error verifing User",
      })
    );
    ws.close();
    return;
  }
});
