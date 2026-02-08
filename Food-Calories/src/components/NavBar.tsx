import React from "react";

import {
  Pagination,
  PaginationEllipsis,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";

function NavBar() {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="w-full md:hidden">
      <Button size="icon" variant="ghost" onClick={toggleSidebar}>
        <Menu className="!size-6" />
      </Button>
    </div>
  );
}

export default NavBar;
