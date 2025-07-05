import dotenv from "dotenv";
dotenv.config();

import express from "express";
import authRouter from "./routes/auth.router.js";
import roomRouter from "./routes/room.router.js";
import contentRouter from "./routes/content.router.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/room", roomRouter);
app.use("/api/v1/content", contentRouter);

app.listen(3001);
