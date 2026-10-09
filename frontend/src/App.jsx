import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";

function AppContent() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"

  if (loading) return <p style={{ padding: "2rem" }}>Verificando sesión...</p>;

  if (user) return <Home />;

  return mode === "login" ? (
    <Login onSwitchToRegister={() => setMode("register")} />
  ) : (
    <Register onSwitchToLogin={() => setMode("login")} />
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;