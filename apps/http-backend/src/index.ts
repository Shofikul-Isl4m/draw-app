require("dotenv").config;
const JWT_SECRET = process.env.JWT_SECRET!;

import express from "express";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware/middleware";
import {createUserSchema,signInSchema,createRoomSchema} from "@repo/common/types" 

const app = express();

app.post("/signup", function (req, res) {
  const parseData = createUserSchema.safeParse(req.body);
    if(!parseData.success){
      console.log(parseData.error)
      res.json({
        message : "incorrect Input"
      })
      return
    }

      
  res.json({
    userId: 123,
  });
});

app.post("/signin", function (req, res) {
  const parseData = createUserSchema.safeParse(req.body);
    if(!parseData.success){
      console.log(parseData.error)
      res.json({
        message : "incorrect Input"
      })
      return
    }
  const userid = 1;

  jwt.sign({ userid }, JWT_SECRET);
});
app.post("/room", middleware, function (req, res) {
  const parseData = createUserSchema.safeParse(req.body);
    if(!parseData.success){
      console.log(parseData.error)
      res.json({
        message : "incorrect Input"
      })
      return
    }
  res.json({
    roomId: 123,
  });
});

app.listen(3001);
