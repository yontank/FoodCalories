import { Home, Settings } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { useQuery } from "@tanstack/react-query";
import { getDefaultStore } from "jotai";
import { accessTokenAtom } from "@/atoms/user";

function AppSidebar() {
  const { t } = useTranslation();

  // Implement logout logic here
  const { refetch } = useQuery({
    enabled: false, // Disable automatic execution
    queryKey: ["logout"],
    queryFn: async () => {
      // Call your logout API endpoint here
      const store = getDefaultStore();
      const accessToken = store.get(accessTokenAtom);

      const response = await fetch("/api/v1/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      store.set(accessTokenAtom, undefined); // Clear access token from Jotai store
      return true;
    },
  });

  const items = [
    {
      title: t('home', 'Home'),
      url: "/",
      icon: Home,
    },
    {
      title: t('settings', 'Settings'),
      url: "/settings",
      icon: Settings,
    },
  ];
  return (
    <Sidebar side="right" variant="inset">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('application', 'Application')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Button variant={"default"} onClick={() => refetch()}>
          {t("logout", "Logout")}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
