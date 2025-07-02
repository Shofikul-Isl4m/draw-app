import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export function middleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["authorization"];
  if (!token) {
    throw new Error("no token found");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error(
      " JWT_SECRET is not defined. Please check your environment configuration."
    );
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log(decoded);
  if (typeof decoded === "object" && "userId" in decoded) {
    req.userid = decoded.userId;
    next();
  } else {
    res.status(404).json({
      message: "unathorized",
    });
  }
}
