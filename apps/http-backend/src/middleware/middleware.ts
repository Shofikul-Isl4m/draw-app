import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;

export function middleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["authorization"];
  if (!token) {
    throw new Error("no token found");
  }
  
  if (!JWT_SECRET) {
    throw new Error(" JWT_SECRET is not defined. Please check your environment configuration.");
  }
  const decoded = jwt.verify(token, JWT_SECRET);
  if (typeof decoded === "object" && "userid" in decoded) {
    req.userid = decoded.userid;
    next();
  } else {
    res.status(404).json({
      message: "unathorized",
    });
  }
}
