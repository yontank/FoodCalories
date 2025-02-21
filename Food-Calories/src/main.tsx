import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./input.css";
import { BrowserRouter, Route, Routes } from "react-router";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import Calc from "./pages/Calculator/Calc.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/calc" element={<Calc />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
