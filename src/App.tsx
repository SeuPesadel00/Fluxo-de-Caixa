import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { Vendas } from "./pages/Vendas";
import { Clientes } from "./pages/Clientes";
import { Produtos } from "./pages/Produtos";
import ContasPagar from "./pages/ContasPagar";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-[#0a0a0c]"><p className="text-white">Carregando...</p></div>;
  return session ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-[#0a0a0c]"><p className="text-white">Carregando...</p></div>;
  return !session ? <>{children}</> : <Navigate to="/" replace />;
};

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      <Route path="/" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />
      <Route path="/vendas" element={
        <PrivateRoute>
          <Vendas />
        </PrivateRoute>
      } />
      <Route path="/clientes" element={
        <PrivateRoute>
          <Clientes />
        </PrivateRoute>
      } />
      <Route path="/produtos" element={
        <PrivateRoute>
          <Produtos />
        </PrivateRoute>
      } />
      <Route path="/contas-pagar" element={
        <PrivateRoute>
          <ContasPagar />
        </PrivateRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </AppProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
