import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await api.post("/auth/login", formData);
      localStorage.setItem("token", res.data.token); // store JWT token
      localStorage.setItem("userId", res.data.user.id);
      setMessage(`Welcome ${res.data.user.name}!`);
      navigate("/home"); // redirect to home page
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={wrap}>
      <div style={card}>
        <h1 style={{ margin: 0 }}>Log in</h1>
        <p style={{ opacity: 0.8 }}>Use your email and password</p>
        <form style={{ display: "grid", gap: 12, marginTop: 12 }} onSubmit={handleSubmit}>
          <label>
            <div>Email</div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={input}
              placeholder="you@ufl.edu"
            />
          </label>
          <label>
            <div>Password</div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={input}
              placeholder="••••••••"
            />
          </label>
          <button type="submit" style={primaryBtn}>Log in</button>
        </form>

        {message && <p style={{ marginTop: 10, color: message.includes("Welcome") ? "green" : "red" }}>{message}</p>}

        <p style={{ marginTop: 14 }}>
          No account? <Link to="/signup">Sign up</Link>
        </p>
        <p>
          <Link to="/">Back to Welcome</Link>
        </p>
      </div>
    </div>
  );
}

const wrap = { minHeight: "100dvh", display: "grid", placeItems: "center", background: "#F5DCD2" };
const card = { width: "min(520px, 100%)", background: "white", borderRadius: 14, padding: 24, boxShadow: "0 12px 30px rgba(0,0,0,0.08)" };
const input = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" };
const primaryBtn = { padding: "12px 16px", borderRadius: 10, background: "#0021A5", color: "white", border: "none", fontWeight: 700 };
