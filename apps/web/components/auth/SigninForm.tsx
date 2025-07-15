"use client";

import { Button } from "@repo/ui/components/ui/button";

import { Input } from "@repo/ui/components/ui/input";
import { BiInfoCircle } from "react-icons/bi";
import Link from "next/link";
import { signinAction } from "@/actions/authActions";
import { useFormStatus } from "react-dom";
import { useActionState, useEffect } from "react";
import { redirect } from "next/navigation";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { setUser } from "@/lib/features/meetdraw/appSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { AuthHeader } from "./AuthHeader";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className={` w-full hover:ring-2 hover:ring-gray-200 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-800 ${
        pending
          ? "cursor-not-allowed border border-gray-300 text-gray-400 outline-none"
          : ""
      }`}
    >
      {pending ? "Signing in..." : "Sign in"}
    </Button>
  );
}

export default function SignupForm({
  jwtCookie,
}: {
  jwtCookie: RequestCookie | null;
}) {
  const initialState = { message: "", errors: {} };
  const [state, formAction] = useActionState(signinAction, initialState);
  const dispatch = useAppDispatch();
  const userState = useAppSelector((state) => state.app.user);

  useEffect(() => {
    const sessionUser = sessionStorage.getItem("user");

    if (sessionUser && jwtCookie && jwtCookie.value) {
      dispatch(setUser(JSON.parse(sessionUser)));
      redirect("/home");
    } else if (state.user) {
      const user = {
        id: state.user.id,
        name: state.user.name,
        username: state.user.username,
      };
      sessionStorage.setItem("user", JSON.stringify(user));
      dispatch(setUser(user));
    }
  }, [state.user]);

  useEffect(() => {
    if (jwtCookie && jwtCookie.value && userState) {
      redirect("/home");
    }
  }, [userState]);

  return (
    <div className="flex   w-full  max-w-[400px] flex-col justify-between rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl shadow-cyan-500/20">
      <AuthHeader
        title="Welcome back"
        description="Please enter your details to sign in."
      />
      <div className="mt-5 flex grow flex-col justify-center space-y-4">
        <div className=" relative flex items-center ">
          <div className="grow border-t border-gray-200"></div>
          <span className="shrink rounded-full border p-1 text-[9px] text-gray-400">
            OR
          </span>
          <div className="grow border-t border-gray-200"></div>
        </div>
        <form action={formAction} className="space-y-4">
          <Input
            name="username"
            type="text"
            placeholder="Username"
            className="w-full rounded-md px-4 py-2"
          ></Input>
          <Input
            name="password"
            type="password"
            placeholder=" Password"
            className="w-full rounded-md px-4 py-2"
          ></Input>

          {state.message && (
            <p className="text-sm  my-1 mb-3 text-red-500 flex items-center font-light gap-2">
              <BiInfoCircle />
              {state.message}
            </p>
          )}
          <SubmitButton />
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don't have an account yet?{" "}
        <Link
          href="/signup"
          className="transition-ease font-medium underline underline-offset-2 hover:text-black"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
