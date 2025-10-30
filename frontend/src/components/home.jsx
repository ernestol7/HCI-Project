import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Box, Button, Card, Stack, Typography, Container, Grid } from "@mui/material";
import "@fullcalendar/daygrid";
import "@fullcalendar/timegrid";
import "../styles/calendar.css";

// API helper 
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";
function authFetch(path, options = {}) {
  const token = localStorage.getItem("token");
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });
}

export default function Home() {
  const [classes, setClasses] = useState([]);           // [{_id,name,code}]
  const [selectedIds, setSelectedIds] = useState([]);   // which classIds are shown on calendar
  const navigate = useNavigate();
  const calendarRef = useRef(null);

  // redirects immediately if no token exists
  const token = localStorage.getItem("token");
  useEffect(()=>{
    if(!token) navigate("/login");
  }, [token, navigate]);

  // load my classes on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch("/classes/mine");
        if (!res.ok) throw new Error("Failed to load classes");
        const data = await res.json();
        setClasses(data);
        setSelectedIds(data.map(c => c._id)); // default: show all
      } catch (e) {
        console.warn(e);
      }
    })();
  }, []);

  // backend hookup for joining class by code 
  const handleAddClass = async () => {
    const code = window.prompt("Enter class code");
    if (!code) return;
    try {
      const res = await authFetch("/classes/join", {
        method: "POST",
        body: JSON.stringify({ code: code.trim() }),
      });
      if (!res.ok) return alert("Invalid class code");
      const cls = await res.json(); // {_id,name,code}
      setClasses(prev => (prev.some(c => c._id === cls._id) ? prev : [...prev, cls]));
      setSelectedIds(prev => (prev.includes(cls._id) ? prev : [...prev, cls._id]));
    } catch (e) {
      alert("Could not join class");
    }
  };

  // backend hookup for admin creating a class 
  const handleAddClassToDB = async () => {
    const adminPassword = window.prompt("Admin password");
    if (!adminPassword) return;
    const name = window.prompt("Class name");
    if (!name) return;
    try {
      const res = await authFetch("/classes", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), adminPassword }),
      });
      if (!res.ok) return alert("Failed to create class (admin)");
      const cls = await res.json(); // {_id,name,code}
      alert(`Class '${cls.name}' created! Share code: ${cls.code}`);
      setClasses(prev => [...prev, cls]);
      setSelectedIds(prev => [...prev, cls._id]);
    } catch (e) {
      alert("Could not create class");
    }
  };

  // toggle which classes are shown
  const toggleSelected = (id) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
    // Refetch to reflect new selection
    const api = calendarRef.current?.getApi();
    api?.refetchEvents();
  };

  // FullCalendar async event 
  const loadEvents = async (info, success, failure) => {
    try {
      const params = new URLSearchParams({ start: info.startStr, end: info.endStr });
      // always send classIds, even if empty
      params.set("classIds", selectedIds.join(",")); //when no classes are toggled on
      const res = await authFetch(`/events?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load events");
      const data = await res.json(); // [{id,title,start,...}]
      success(data);
    } catch (err) {
      console.error(err);
      failure(err);
    }
  };

  // create event for the first selected class 
  const handleDateClick = async (arg) => {
    if (selectedIds.length === 0) {
      return alert("Select at least one class to add an event.");
    }
    const classId = selectedIds[0]; // pick first selected; we could add a selector later
    const title = window.prompt("Event title");
    if (!title) return;
    const description = window.prompt("Description");
    const time = window.prompt("Time (optional, e.g., 7–9 PM)");
    const capacityStr = window.prompt("Capacity (number, optional)");
    const capacity = capacityStr ? Number(capacityStr) : undefined;

    try {
      const res = await authFetch("/events", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          start: arg.dateStr,
          description: (description || "").trim(),
          time: (time || "").trim(),
          capacity,
          classId,
        }),
      });
      if (!res.ok) return alert("Failed to create event");
      // Refresh events
      const api = calendarRef.current?.getApi();
      api?.refetchEvents();
    } catch (e) {
      alert("Could not create event");
    }
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
                classes.map((c) => {
                  const checked = selectedIds.includes(c._id);
                  return (
                    <Card
                      key={c._id}
                      sx={{ p: 1, display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSelected(c._id)}
                        style={{ marginRight: 8 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" noWrap>
                          {c.name}
                        </Typography>
                        <Typography variant="caption">Code: {c.code}</Typography>
                      </div>
                    </Card>
                  );
                })
              )}

              <Button variant="contained" color="warning" onClick={handleAddClassToDB}>
                Add class to database
              </Button>

              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  localStorage.removeItem("token");
                  // clear the selection so next user starts empty (just in case)
                  setClasses([]);
                  setSelectedIds([]);
                  calendarRef.current?.getApi()?.removeAllEvents();
                  setTimeout(() => navigate("/login"), 100); //short delay to ensure redirect
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
            <Box sx={{ minWidth: 0 }}>
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                height="auto" //adjust calendar size
                events={loadEvents}      // from backend
                dateClick={handleDateClick}
              />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}//fml idk why some events stay in the calendar between users