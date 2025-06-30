require("dotenv").config;
const JWT_SECRET = process.env.JWT_SECRET!;

import express from "express";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware/middleware";

const app = express();

app.post("/signup", function (req, res) {
  res.json({
    userId: 123,
  });
});

app.post("/signin", function (req, res) {
  const userid = 1;

  jwt.sign({ userid }, JWT_SECRET);
});
app.post("/room", middleware, function (req, res) {
  res.json({
    roomId: 123,
  });
});

app.listen(3001);
