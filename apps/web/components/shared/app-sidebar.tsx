import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/ui/sidebar";

import SideBarItem from "./SideBarItem";
import { History } from "../icons/animated/History";
import { HomeIcon } from "../icons/animated/Home";
import { NavUser } from "../Root-user";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/home",
    icon: <HomeIcon />,
  },
  {
    title: "History",
    url: "/history",
    icon: <History />,
  },
];

export function AppSidebar() {
  return (
    <Sidebar variant="inset" className="bg-neutral-100">
      <SidebarContent className="ju flex flex-col">
        <SidebarHeader className="flex font-pencerio text-black text-2xl font-extrabold flex-row items-center justify-between max-md:p-4">
          Cdraw
          <div className="max-md:hidden">
            <NavUser />
          </div>
        </SidebarHeader>
        <SidebarGroup className="mt-10 flex-1">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <SideBarItem
                      icon={item.icon}
                      title={item.title}
                      url={item.url}
                    />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarFooter></SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
