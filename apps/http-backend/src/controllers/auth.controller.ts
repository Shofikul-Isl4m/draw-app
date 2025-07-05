import { Request, Response } from "express";
import { prismaClient } from "@repo/db/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserSigninSchema, UserSignupSchema } from "@repo/common/types";

export async function signupController(req: Request, res: Response) {
  const validatedInput = UserSignupSchema.safeParse(req.body);

  if (!validatedInput.success) {
    res.status(400).json({
      message: "Invalid Inputs",
      error: validatedInput.error.errors,
    });
    return;
  }
  const { username, password, name } = validatedInput.data;

  try {
    const saltrounds = parseInt(process.env.SALTROUNDS || "10");
    const hashedPwd = await bcrypt.hash(password, saltrounds);
    const userCreated = await prismaClient.user.create({
      data: {
        username,
        password: hashedPwd,
        name,
      },
    });
    const user = {
      id: userCreated.id,
      username: userCreated.username,
      name: userCreated.name,
      photo: userCreated.photo,
    };

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT SECRET IS NOT STRING IN SIGNUPCONTROLLER");
    }
    const token = jwt.sign(user, process.env.JWT_SECRET);

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "User Signed Up",
      user,
      token,
    });
    return;
  } catch (e: any) {
    console.error("Signup error:", e);

    if (e.code === "P2002") {
      res.status(409).json({ message: "Username already exists" });
      return;
    }

    res.status(500).json({
      message: "An error occurred while creating user. Please try again later.",
    });
    return;
  }
}

export async function signinController(req: Request, res: Response) {
  const validatedInput = UserSigninSchema.safeParse(req.body);

  if (!validatedInput.success) {
    res.status(400).json({
      message: "Invalid Inputs",
      errors: validatedInput.error.errors,
    });
    return;
  }
  const { username, password } = validatedInput.data;

  try {
    const userFound = await prismaClient.user.findUnique({
      where: {
        username,
      },
    });
    if (!userFound || !(await bcrypt.compare(password, userFound.password))) {
      res.status(401).json({
        message: "Invalid Username or Password",
      });
      return;
    }

    const user = {
      id: userFound.id,
      username: userFound.username,
      name: userFound.name,
      photo: userFound.photo,
    };
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT SECRET NOT STRING IN SIGNINCONTROLLER");
    }
    const token = jwt.sign(user, process.env.JWT_SECRET);
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.json({
      message: "User Signed In",
      user: user,
      token,
    });
    return;
  } catch (e) {
    console.error("Signin error:", e);
    res.status(500).json({
      message: "An error occurred while signing in. Please try again later.",
    });
    return;
  }
}
export async function signoutController(req: Request, res: Response) {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
    });
    res.status(200).json({
      message: "User logged out successfully",
    });
    return;
  } catch (e) {
    console.error("Signout error:", e);
    res.status(500).json({
      message: "An error occurred during logout. Please try again.",
    });
    return;
  }
}

export async function infoController(req: Request, res: Response) {
  const userId = req.userid;

  if (!userId) {
    res.status(400).json({ message: "User ID is required" });
    return;
  }

  try {
    const userFound = await prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!userFound) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const user = {
      id: userFound.id,
      username: userFound.username,
      name: userFound.name,
    };

    res.status(200).json({
      message: "User info",
      user,
    });
    return;
  } catch (e) {
    console.error("InfoController error:", e);
    res.status(500).json({
      message:
        "An error occurred while retrieving user info. Please try again later.",
    });
    return;
  }
}
