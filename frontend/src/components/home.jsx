import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Box,
  Button,
  Card,
  Stack,
  Typography,
  Container,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
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
  const [classes, setClasses] = useState([]);   //[{_id,name,code}]
  const [selectedIds, setSelectedIds] = useState([]); // which classIds are shown on calendar
  // better event addition UI
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    dateStr: "",
    title: "",
    description: "",
    time: "",
    capacity: "",
  });
  const [selectedEvent, setSelectedEvent] = useState(null);


  const navigate = useNavigate();
  const calendarRef = useRef(null);
  const userId = String(localStorage.getItem("userId")); // if you store it at login

  // redirects immediately if no tokens exists
  const token = localStorage.getItem("token");
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  // load my classes on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch("/classes/mine");
        if (!res.ok) throw new Error("Failed to load classes");
        const data = await res.json();
success(
  data.map((e) => ({
    ...e,
    extendedProps: {
      ...e.extendedProps,
      participants: e.extendedProps?.participants?.map(String) || [], // ADD THIS
      attendeesCount: e.extendedProps?.attendeesCount || 0,
      capacity: e.extendedProps?.capacity || 0,
    },
  }))
);

        setSelectedIds(data.map((c) => c._id)); // default: show all
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
      const cls = await res.json();
      setClasses((prev) => (prev.some((c) => c._id === cls._id) ? prev : [...prev, cls]));
      setSelectedIds((prev) => (prev.includes(cls._id) ? prev : [...prev, cls._id]));
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

  const code = window.prompt("Enter a class code");
  if (!code) return;

  try {
    const res = await authFetch("/classes", {
      method: "POST",
      body: JSON.stringify({ name: name.trim(), code: code.trim(), adminPassword }),
    });
    if (!res.ok) return alert("Failed to create class (admin)");
    const cls = await res.json(); // {_id,name,code}
    alert(`Class '${cls.name}' created! Share code: ${cls.code}`);
    setClasses((prev) => [...prev, cls]);
    setSelectedIds((prev) => [...prev, cls._id]);
  } catch (e) {
    alert("Could not create class");
  }
};


  // toggle which classes are shown
  const toggleSelected = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    // Refetch to reflec new selection
    const api = calendarRef.current?.getApi();
    api?.refetchEvents();
  };

  // FullCalendar event source
  // FullCalendar event source
const loadEvents = async (info, success, failure) => {
  try {
    const params = new URLSearchParams({ start: info.startStr, end: info.endStr });
    params.set("classIds", selectedIds.join(","));
    const res = await authFetch(`/events?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to load events");
    const data = await res.json();

    // map data to FullCalendar format
const events = data.map((e) => ({
  id: e.id,
  title: e.title,
  start: e.start,
  end: e.end || null,
  allDay: !!e.allDay,
  extendedProps: {
    ...e.extendedProps, // copy everything from backend
    capacity: e.extendedProps.capacity && e.extendedProps.capacity > 0
      ? e.extendedProps.capacity
      : "∞",
    participants: (e.extendedProps.participants || []).map(String),
    attendeesCount: e.extendedProps.attendeesCount || 0,
  },
}));


    success(events);
  } catch (err) {
    console.error(err);
    failure(err);
  }
};


  // create event for the first selected class using Dialog
  const handleDateClick = (arg) => {
    if (selectedIds.length === 0) {
      return alert("Select at least one class to add an event.");
    }
    setEventForm({
      dateStr: arg.dateStr, // "2025-10-31"
      title: "",
      description: "",
      time: "",
      capacity: "",
    });
    setEventDialogOpen(true);
  };

  // submit event
  const handleCreateEvent = async () => {
    const classId = selectedIds[0]; // maybe add a dropdown later
    if (!eventForm.title.trim()) {
      return alert("Title is required.");
    }

    try {
      const res = await authFetch("/events", {
        method: "POST",
        body: JSON.stringify({
          title: eventForm.title.trim(),
          // send date only to avoid timezone shift
          start: eventForm.dateStr,
          description: eventForm.description.trim(),
          time: eventForm.time.trim(),
          capacity: eventForm.capacity ? Number(eventForm.capacity) : undefined,
          classId,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error(text);
        return alert("Failed to create event");
      }

      setEventDialogOpen(false);
      const api = calendarRef.current?.getApi();
      api?.refetchEvents();
    } catch (e) {
      console.error(e);
      alert("Could not create event");
    }
  };

  const handleJoinEvent = async (event) => {
  if (!event) return;  // safe-guard
  try {
    const res = await authFetch(`/events/${event.id}/join`, { method: "POST" });
    const data = await res.json();
    setSelectedEvent((prev) => {
      if (!prev) return prev;  // safe-guard
      return {
        ...prev,
        extendedProps: {
          ...prev.extendedProps,
          participants: [...new Set([...(prev.extendedProps.participants || []), userId])],
          attendeesCount: (prev.extendedProps.attendeesCount || 0) + 1, // +1 locally

        },
      };
    });
    calendarRef.current?.getApi().refetchEvents();
  } catch (err) {
    alert(err.message || "RSVP failed");
  }
};


const handleLeaveEvent = async (eventId) => {
  try {
    const res = await authFetch(`/events/${eventId}/leave`, { method: "POST" });
    const data = await res.json();
    setSelectedEvent(prev => ({
      ...prev,
      extendedProps: {
        ...prev.extendedProps,
        participants: (prev.extendedProps.participants || []).filter(id => id !== userId),
        attendeesCount: Math.max((prev.extendedProps.attendeesCount || 1) - 1, 0) // -1 locally

      }
    }));
    calendarRef.current?.getApi().refetchEvents();
  } catch (err) {
    alert(err.message || "Leave failed");
  }
};

  const isRegistered = selectedEvent?.extendedProps?.participants?.includes(userId);
  const attendeesCount = selectedEvent?.extendedProps?.attendeesCount ?? 0; //CHANGE
  const capacity = selectedEvent?.extendedProps?.capacity ?? "∞"; //CHANGE

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
                    <Card key={c._id} sx={{ p: 1, display: "flex", alignItems: "center", gap: 1 }}>
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
                  setTimeout(() => navigate("/login"), 100);
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
                height="auto"
                events={loadEvents}
                dateClick={handleDateClick}
                eventClick={(info) => setSelectedEvent(info.event)}
              />
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Event Dialog */}
      <Dialog open={eventDialogOpen} onClose={() => setEventDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add event for {eventForm.dateStr}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Title"
            value={eventForm.title}
            onChange={(e) => setEventForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <TextField
            label="Description"
            value={eventForm.description}
            onChange={(e) => setEventForm((f) => ({ ...f, description: e.target.value }))}
            multiline
            rows={2}
          />
          <TextField
            label="Time (e.g. 7–9 PM)"
            value={eventForm.time}
            onChange={(e) => setEventForm((f) => ({ ...f, time: e.target.value }))}
          />
          <TextField
            label="Capacity"
            type="number"
            value={eventForm.capacity}
            onChange={(e) => setEventForm((f) => ({ ...f, capacity: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEventDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateEvent} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Event RSVP</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          {selectedEvent && (
            <>
              <Typography variant="h6">{selectedEvent.title}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Date: {selectedEvent.startStr}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Description: {selectedEvent.extendedProps?.description || "No description"}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedEvent(null)}>Close</Button>
          {selectedEvent && (
            <>
              <Box sx={{ flexDirection: "column", textAlign: "left", width: "100%", mb: 1 }}>
                <Typography variant="body2">Attendees: {attendeesCount} / {capacity || "∞"}</Typography>
                <Typography variant="body2">
                  {isRegistered ? "You are attending this event" : "You are not attending"}
                </Typography>
             </Box>
              <Button
                onClick={() => handleJoinEvent(selectedEvent)}
                variant="contained"
                color="primary"
                disabled={isRegistered || (capacity && attendeesCount >= capacity)}

              >
                RSVP
              </Button>
              <Button
                onClick={() => handleLeaveEvent(selectedEvent)}
                variant="outlined"
                color="error"
                disabled={!isRegistered} 

              >
                Leave
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}// fml idk how to do RSVP