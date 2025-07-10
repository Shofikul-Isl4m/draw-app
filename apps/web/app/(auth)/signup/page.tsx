import SignupForm from "@/components/auth/SignupForm";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function page() {
  const jwtCookie = (await cookies()).get("jwt");

  return (
    <div className="gridGradient container h-screen w-screen">
      <div className="py-10 ml-50 font-pencerio font-extrabold text-3xl">
        CollabDraw
      </div>
      <div className="flex-center w-full py-10 ml-10">
        <SignupForm jwtCookie={jwtCookie || null} />
      </div>
    </div>
  );
}
