import dotenv from "dotenv";
dotenv.config();

import express from "express";
import authRouter from "./routes/authRouter.js";
import roomRouter from "./routes/roomRouter.js";
import contentRouter from "./routes/contentRouter.js";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/room", roomRouter);
app.use("/api/v1/content", contentRouter);

app.listen(3001);
