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
    <div ref={homeRef}>
      <BackgroundHalo />
      <div></div>
      <div>
        <div>
          <div className="flex gap-2"></div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
