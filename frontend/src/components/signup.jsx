import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await api.post("/auth/signup", formData);
      setMessage(res.data.message || "Account created successfully!");

      setTimeout(() => navigate("/login"), 1500); // ✅ redirect after 1.5s
    } catch (err) {
      setMessage(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div style={wrap}>
      <div style={card}>
        <h1 style={{ margin: 0 }}>Sign up</h1>
        <p style={{ opacity: 0.8 }}>Create your account</p>

        <form style={{ display: "grid", gap: 12, marginTop: 12 }} onSubmit={handleSubmit}>
          <label>
            <div>Full name</div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={input}
              placeholder="Albert Gator"
            />
          </label>
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
          <button type="submit" style={primaryBtn}>Create account</button>
        </form>

        {message && <p style={{ marginTop: 10, color: message.includes("success") ? "green" : "red" }}>{message}</p>}

        <p style={{ marginTop: 14 }}>
          Already have an account? <Link to="/login">Log in</Link>
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
