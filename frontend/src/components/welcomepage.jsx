
import React from "react";
import { Link } from "react-router-dom";

export default function Welcome() {
  return (
    <div style={styles.shell}>
      <header style={styles.heroBar}>
        <h1 style={styles.heroTitle}>Welcome to <span style={styles.accent}>Swamped</span>!</h1>
        <p style={styles.tagline}>UF Study Session App</p>
      </header>

      <main style={styles.main}>
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Get started</h2>
          <p style={styles.lead}>
            Find classmates, join study sessions, and stay on top of exams & deadlines.
          </p>

          <div style={styles.ctaRow} role="group" aria-label="Primary actions">
            <Link to="/login" style={{ ...styles.btn, ...styles.btnPrimary }}>Log in</Link>
            <Link to="/signup" style={{ ...styles.btn, ...styles.btnGhost }}>Sign up</Link>
          </div>

          <ul style={styles.features}>
            <li>Search by course to find or host study sessions</li>
            <li>Shared calendars with events & reminders</li>
            <li>Event-specific chat to coordinate details</li>
          </ul>
        </section>
      </main>

      <footer style={styles.footer}>
        <small>Made for Gators • Go Gators 🐊</small>
      </footer>
    </div>
  );
}

const COLORS = {
  gatorBlue: "#0021A5",
  gatorOrange: "#FA4616",
  peach: "#F5DCD2",       // soft peach like your login screen
  ink: "#1F2833",
  border: "rgba(0,0,0,0.08)",
};

const styles = {
  shell: {
    minHeight: "100dvh",
    background: COLORS.peach,
    display: "flex",
    flexDirection: "column",
  },
  heroBar: {
    background: COLORS.gatorBlue,
    color: "white",
    padding: "28px 16px",
    textAlign: "center",
    borderBottom: `6px solid ${COLORS.gatorOrange}`,
  },
  heroTitle: {
    margin: 0,
    fontSize: "clamp(28px, 4vw, 44px)",
    letterSpacing: "0.5px",
    fontWeight: 800,
  },
  accent: { color: COLORS.gatorOrange },
  tagline: {
    marginTop: 6,
    opacity: 0.9,
    fontWeight: 600,
    letterSpacing: "0.3px",
  },
  main: {
    flex: 1,
    display: "grid",
    placeItems: "center",
    padding: "40px 16px",
  },
  card: {
    width: "min(860px, 100%)",
    background: "white",
    borderRadius: 18,
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
    padding: "32px clamp(16px, 4vw, 40px)",
    textAlign: "center",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "clamp(22px, 2.4vw, 28px)",
    color: COLORS.gatorBlue,
    fontWeight: 800,
    letterSpacing: "0.4px",
  },
  lead: {
    margin: "10px auto 22px",
    maxWidth: 720,
    color: COLORS.ink,
    opacity: 0.9,
    fontSize: "clamp(14px, 1.5vw, 18px)",
  },
  ctaRow: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap",
    margin: "6px 0 18px",
  },
  btn: {
    display: "inline-block",
    padding: "12px 20px",
    borderRadius: 12,
    fontWeight: 800,
    textDecoration: "none",
    border: "2px solid transparent",
    letterSpacing: "0.3px",
    transition: "transform 120ms ease, opacity 120ms ease, background 120ms ease",
  },
  btnPrimary: {
    background: COLORS.gatorBlue,
    color: "white",
    borderColor: COLORS.gatorBlue,
  },
  btnGhost: {
    background: "transparent",
    color: COLORS.gatorBlue,
    borderColor: COLORS.gatorBlue,
  },
  features: {
    margin: "22px auto 0",
    padding: 0,
    listStyle: "none",
    display: "grid",
    gap: 10,
    maxWidth: 640,
    textAlign: "left",
  },
  footer: {
    borderTop: `1px solid ${COLORS.border}`,
    textAlign: "center",
    padding: "18px 12px",
    color: COLORS.ink,
    opacity: 0.7,
  },
};
