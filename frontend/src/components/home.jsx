// src/components/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  // Check if a token exists (basic auth check)
  const token = localStorage.getItem("token");

  if (!token) {
    // If no token, send user back to login
    navigate("/login");
  }

  return (
    <div style={wrap}>
      <div style={card}>
        <h1>Welcome to Your Dashboard!</h1>
        <p>This is your home page after logging in.</p>
        <button style={logoutBtn} onClick={() => {
          localStorage.removeItem("token");
          navigate("/login");
        }}>
          Log out
        </button>
      </div>
    </div>
  );
}

const wrap = { minHeight: "100dvh", display: "grid", placeItems: "center", background: "#F5DCD2" };
const card = { width: "min(520px, 100%)", background: "white", borderRadius: 14, padding: 24, boxShadow: "0 12px 30px rgba(0,0,0,0.08)" };
const logoutBtn = { padding: "12px 16px", borderRadius: 10, background: "#E74C3C", color: "white", border: "none", fontWeight: 700 };
