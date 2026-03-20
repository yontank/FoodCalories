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
} from "@/components/ui/sidebar";

import { Link } from "react-router";
import { useTranslation } from 'react-i18next'

function AppSidebar() {
  const { t } = useTranslation()
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
    </Sidebar>
  );
}

export default AppSidebar;
