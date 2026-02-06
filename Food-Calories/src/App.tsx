import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router";
import Layout from "./pages/Layout";
import Dashboard from "./pages/Dashboard/Dashboard";
import { Settings } from "./pages/Settings/Settings";
import Calc from "./pages/Calculator/Calc";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="settings" element={<Settings />} />
            <Route path="calc" element={<Calc />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
