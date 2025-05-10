import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Dashboard from "./pages/Dashboard/Dashboard.tsx";
import "./input.css";
import { BrowserRouter, Route, Routes } from "react-router";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import Calc from "./pages/Calculator/Calc.tsx";
import Layout from "./pages/Layout.tsx";
import SettingsPage from "./pages/Settings/Settings.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="/settings" element={<SettingsPage/>} />
            <Route path="/calc" element={<Calc />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
