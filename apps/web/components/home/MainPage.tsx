"use client";

import AppointmentCard from "@/components/home/CommsCard";
import ChatsView from "@/components/home/ChatsView";
import MeetdrawsView from "@/components/home/MeetdrawsView";
import UserCard from "@/components/home/UserCard";
import { useEffect, useRef, useState } from "react";
import StateButton from "./StateButton";
import CreateRoomView from "./CreateRoomView";
import JoinRoomView from "./JoinRoomView";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { redirect } from "next/navigation";
import {
  setHomeView,
  setRooms,
  setUser,
  setBackgroundHaloPosition,
} from "@/lib/features/meetdraw/appSlice";
import { Room, User } from "@/types";
import ChatRoom from "./ChatRoom";
import BackgroundHalo from "./BackgroundHalo";

const MainPage = ({
  jwtCookie,
  rooms,
  userInfo,
}: {
  jwtCookie: RequestCookie;
  rooms: Room[];
  userInfo: User;
}) => {
  const userState = useAppSelector((state) => state.app.user);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!jwtCookie || !jwtCookie.value) {
      redirect("/signin");
    }
    if (!userState) {
      const user = JSON.parse(sessionStorage.getItem("user")!);
      if (user) {
        dispatch(setUser(user));
      } else if (userInfo) {
        let newUserInfo: User = {
          id: userInfo.id,
          name: userInfo.name,
          username: userInfo.username,
        };
        dispatch(setUser(newUserInfo));
      }
    }
  }, [jwtCookie, userState]);

  const homeRef = useRef<HTMLDivElement>(null);

  const homeView = useAppSelector((state) => state.app.homeView);

  const handleMouseMove = (event: MouseEvent) => {
    dispatch(
      setBackgroundHaloPosition({
        x: event.clientX.toString(),
        y: event.clientY.toString(),
      })
    );
  };

  useEffect(() => {
    const homeDivCurrent = homeRef.current;
    if (!homeDivCurrent) return;

    dispatch(setRooms(rooms));

    homeDivCurrent.addEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={homeRef}
      className="flex  relative  h-screen p-2 gap-2  box-border  "
    >
      <div className="flex-1 min-h-0 flex flex-col space-y-2 p-2  rounded-xl  bg-white">
        <div className=" rounded-lg flex items-center justify-between py-3 px-4  ">
          <h1 className="text-2xl md:text-3xl font-semibold text-black/70">
            Dashboard
          </h1>
          <div className="flex gap-2">
            <StateButton
              variant="secondary"
              value="join-room"
              onClick={() => dispatch(setHomeView("join-room"))}
            >
              Join Meetdraw
            </StateButton>
            <StateButton
              value="create-room"
              onClick={() => dispatch(setHomeView("create-room"))}
            >
              Add Meetdraw
            </StateButton>
          </div>
        </div>
        <div className=" flex flex-col gap-2 rounded-xl p-2 pt-4 flex-1 min-h-0  ">
          {homeView === "meetdraws" && <MeetdrawsView />}
          {homeView === "create-room" && <CreateRoomView />}
          {homeView === "join-room" && <JoinRoomView />}
          {homeView === "chat" && <ChatRoom jwtCookie={jwtCookie} />}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
