// src/components/Home.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Box, Button, Card, Stack, Typography, Container, Grid } from "@mui/material";
import "@fullcalendar/daygrid";
import "@fullcalendar/timegrid";
import "../styles/calendar.css";

export default function Home() {
  const [events, setEvents] = useState([{ id: "1", title: "Test Event", start: "2025-10-22" }]);
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();

  const handleDateClick = (arg) => {
    const title = window.prompt("Event title");
    if (!title) return;
    const description = window.prompt("Description and time");
    setEvents((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        title: title.trim(),
        start: arg.dateStr,
        allDay: true,
        extendedProps: { description: (description || "").trim() },
      },
    ]);
  };

  const handleAddClass = () => {
    const code = window.prompt("Enter class code");
    if (!code) return;
    setClasses((prev) => [...prev, { name: `Class ${prev.length + 1}`, code }]);
  };

  const handleAddClassToDB = () => {
    const password = window.prompt("Admin password");
    if (!password) return;
    const name = window.prompt("Class name");
    if (!name) return;
    const code = `CLS-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    alert(`Class '${name}' created! Share code: ${code}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 3 }}>
      <Grid container spacing={3} alignItems="flex-start">
        {/* Sidebar */}
        <Grid item xs={12} md={4} lg={3}>
          <Card sx={{ p: 2, bgcolor: "#f8f9fb" }}>
            <Stack spacing={2}>
              <Button variant="contained" color="primary" onClick={handleAddClass}>
                Add Class
              </Button>
              {classes.length === 0 ? (
                <Typography variant="body2">No classes yet.</Typography>
              ) : (
                classes.map((c, i) => (
                  <Card key={i} sx={{ p: 1 }}>
                    <Typography variant="subtitle1">{c.name}</Typography>
                    <Typography variant="caption">Code: {c.code}</Typography>
                  </Card>
                ))
              )}
              <Button variant="contained" color="warning" onClick={handleAddClassToDB}>
                Add class to database
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/login");
                }}
              >
                Log out
              </Button>
            </Stack>
          </Card>
        </Grid>

        {/* Calendar */}
        <Grid item xs={12} md={8} lg={9}>
          <Card sx={{ p: 2 }}>
            {/* minWidth:0 prevents the calendar from forcing the grid wider */}
            <Box sx={{ minWidth: 0 }}>
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                height="auto" // change to "80vh" if it u want both to be side by side
                events={events}
                dateClick={handleDateClick}
              />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}