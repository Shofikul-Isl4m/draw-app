import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export function middleware(req: Request, res: Response, next: NextFunction) {
  let token: string | undefined;
  if ((req.cookies && req.cookies, jwt)) {
    token = req.cookies["jwt"];
  } else if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      message: " Authentication required",
    });
  }
  try {
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
