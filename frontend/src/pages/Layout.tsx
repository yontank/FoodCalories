import { Outlet } from "react-router";
import Navbar from "@/components/NavBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/SideBar";

function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="grow">
        <Navbar />
        <Outlet />
      </main>
    </SidebarProvider>
  );
}

export default Layout;
