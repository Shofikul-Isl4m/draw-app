import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export function middleware(req: Request, res: Response, next: NextFunction) {
  let token = req.cookies["jwt"];

  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    res.status(401).json({
      message: " Authentication required",
    });
    return;
  }
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error(
        " JWT_SECRET is not defined. Please check your environment configuration."
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("pori", decoded);
    if (typeof decoded === "object") {
      req.userid = decoded.id;
      next();
    } else {
      res.status(401).json({
        message: "invalid token playload",
      });
    }
  } catch (error) {
    res.status(401).json({
      message: "invalid or expired token",
    });
  }
}
