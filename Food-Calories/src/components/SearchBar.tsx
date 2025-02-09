import React from "react";
import { Input } from "@/components/ui/input";

function SearchBar() {
  return (
    <div className="flex flex-col items-center justify-center h-1/4 w-3/5 m-auto mt-5 max-w-screen-lg">
      <h2 className="text-red-300 text-center text-2xl">חפש שם מוצר</h2>
      <Input type="text" placeholder="מזון" className="w-10/12" />
    </div>
  );
}

export default SearchBar;
