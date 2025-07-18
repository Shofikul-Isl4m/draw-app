"use server";
import { UserSigninSchema, UserSignupSchema } from "@repo/common/types";
import axiosInstance from "@/lib/axios/axiosInstance";
import { cookies } from "next/headers";
import { CgPassword } from "react-icons/cg";

export interface FormState {
  message: string;
  user?: {
    id: string;
    name: string;
    username: string;
  };
  errors?: any;
}
export type UserStats = {
  totalRooms: number;
  savedRooms: number;
  temporaryRooms: number;
  limits: {
    maxRooms: number;
    maxSavedRooms: number;
    maxTimeLimit: number;
    maxUsers: number;
  };
};

export async function getUserStats() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token) {
    throw new Error("Not authenticated");
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_API_BASE_URL}/api/v1/user/stats`,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
          "Content-Type": "application/json",
        },
        next: {
          tags: ["user-stats"],
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user stats");
    }

    const data: UserStats = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user stats:", error);
    throw error;
  }
}

export async function signupAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const firstname = formData.get("firstname")?.toString().trim() || "";
  const lastname = formData.get("lastname")?.toString().trim() || "";
  const username = formData.get("username")?.toString().trim() || "";
  const password = formData.get("password")?.toString().trim() || "";
  const verifyPassword =
    formData.get("verify-password")?.toString().trim() || "";

  if (password !== verifyPassword) {
    return { message: "Passwords do not match." };
  }

  const rawFormData = {
    name: `${firstname} ${lastname}`,
    username,
    password,
  };

  const validatedFields = UserSignupSchema.safeParse(rawFormData);
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Please check your inputs.",
    };
  }

  try {
    const res = await axiosInstance.post("/auth/signup", validatedFields.data);
    if (res.data.token) {
      (await cookies()).set("jwt", res.data.token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    }
    return {
      user: {
        id: res.data.user.id,
        name: res.data.user.name,
        username: res.data.user.username,
      },
      message: "User created successfully.",
    };
  } catch (error) {
    console.log(error);
    if ((error as any).response.data.message) {
      return { message: (error as any).response.data.message };
    }
    return { message: "Could not create user." };
  }
}

export async function signinAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const username = formData.get("username")?.toString().trim();
  const password = formData.get("password")?.toString().trim();

  const rawData = {
    username,
    password,
  };

  const parseData = UserSigninSchema.safeParse(rawData);

  if (!parseData.success) {
    return {
      errors: parseData.error.flatten().fieldErrors,
      message: "validation failed please check your inputs",
    };
  }

  try {
    const res = await axiosInstance.post("/auth/signin", parseData.data);
    if (res.data.token) {
      (await cookies()).set("jwt", res.data.token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    }

    return {
      user: {
        id: res.data.user.id,
        name: res.data.user.name,
        username: res.data.user.username,
      },
      message: "User logged in Successfully",
    };
  } catch (error) {
    console.log(error);
    if ((error as any).response.data.message) {
      return {
        message: (error as any).response.data.message,
      };
    }

    return { message: "could not login user" };
  }
}

export async function signoutAction() {
  try {
    const res = await axiosInstance.post("/auth/signout");
    if (res.data.message) {
      (await cookies()).delete("jwt");
      return { message: res.data.message };
    } else {
      return { message: "Could not logout user." };
    }
  } catch (error) {
    console.log(error);
  }
}
