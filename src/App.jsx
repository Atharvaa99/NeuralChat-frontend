import { useState, useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import ChatPage from "./pages/ChatPage";
import { api } from "./api";

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = checking session

  useEffect(() => {
    api
      .get("/api/chat/all")
      .then(() => setUser(true))
      .catch(() => setUser(null));
  }, []);

  if (user === undefined) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          width: 32,
          height: 32,
          border: "3px solid rgba(124,106,255,0.3)",
          borderTopColor: "#7c6aff",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      {!user ? (
        <LoginPage onLogin={() => setUser(true)} />
      ) : (
        <ChatPage onLogout={() => setUser(null)} />
      )}
    </>
  );
}