import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

export function middleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["authorization"];
  if (!token) {
    throw new Error("no token found");
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
