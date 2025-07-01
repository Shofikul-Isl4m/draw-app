import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
const JWT_SECRET =process.env.JWT_SECRET;
const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", function connection(ws, request) {
  const url = request.url;
  if (!url) {
    return;
  }
  if (!JWT_SECRET) {
    throw new Error(" JWT_SECRET is not defined. Please check your environment configuration.");
  }
  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token")!;
  const decoded = jwt.verify(token, JWT_SECRET);
  if (
    !(typeof decoded === "object" && "userid" in decoded) ||
    !decoded.userid
  ) {
    ws.close();
    return;
  }
  ws.on("message", function message(data) {
    ws.send("pong");
  });
});
