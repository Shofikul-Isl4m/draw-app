import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET!;

export function middleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["authorization"];
  if (!token) {
    throw new Error("no token found");
  }

  const decoded = jwt.verify(token, JWT_SECRET);
  if (typeof decoded === "object" && "userid" in decoded) {
    req.userid = (decoded as JwtPayload & { userid: string }).userid;
    next();
  } else {
    res.status(404).json({
      message: "unathorized",
    });
  }
}
