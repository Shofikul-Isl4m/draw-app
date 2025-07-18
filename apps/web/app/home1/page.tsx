import MainPage1 from "@/components/home/MainPage1";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import axiosInstance from "@/lib/axios/axiosInstance";

const page = async () => {
  const jwtCookie = (await cookies()).get("jwt");

  if (!jwtCookie) {
    redirect("/signin");
  }

  const { data: user } = await axiosInstance.get("/auth/info");
  const { data: rooms } = await axiosInstance.get("/room/all");

  return (
    <MainPage1 jwtCookie={jwtCookie} rooms={rooms.rooms} userInfo={user.user} />
  );
};

export default page;
