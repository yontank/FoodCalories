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
import { SidebarTrigger } from "./ui/sidebar";

function NavBar() {
  return (
    <div className="w-full bg-primary-figma h-10">
      <SidebarTrigger />
    </div>
  );
}

export default NavBar;
