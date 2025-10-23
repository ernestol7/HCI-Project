// src/components/Home.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { useRef, useCallback, useEffect, useState, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import '@fullcalendar/daygrid';
import '@fullcalendar/timegrid';
import '../styles/calendar.css'


export default function Home() {
    /* we need to add events to event array when handledateclick*/
    const [events, setEvents] =useState([
        { id: '1', title: 'Test Event', start: '2025-10-22' }
    ]);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const handleDateClick = (arg) => {
        const title = window.prompt("Event title");
        if (!title) return;

        const description = window.prompt("Description and time");
        const capStr = window.prompt("Capacity (number)");
        const capacity = Number.parseInt(capStr, 10);
        const capValid = Number.isFinite(capacity) ? capacity : undefined;

        setEvents((prev) => [
            ...prev,
            {
                id:
                    (typeof crypto !== "undefined" && crypto.randomUUID)
                        ? crypto.randomUUID()
                        : String(Date.now()),
                title: title.trim(),
                start: arg.dateStr,       // all-day on that date
                allDay: true,
                extendedProps: {
                    description: description.trim(),
                    ...(capValid !== undefined ? { capacity: capValid } : {}),
                },
            },
        ]);
    };

    const renderEventContent = (info) => {
        const desc = info.event.extendedProps?.description;
        const cap = info.event.extendedProps?.capacity;
        return (
            <div style={{ display: "grid", gap: 2 }}>
                <b>{info.event.title}</b>
                {desc && <span style={{ fontSize: 11 }}>{desc}</span>}
                {cap != null && (
                    <span style={{ fontSize: 10, border: "1px solid #ccc", borderRadius: 4, padding: "0 4px" }}>
            cap: {cap}
          </span>
                )}
            </div>
        );
    };


    return (
        <div style={{ padding: 20 }}>
            <h2>Calendar</h2>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                height="auto"
                events={events}
                dateClick={handleDateClick}
                eventContent={renderEventContent}
            />
        </div>
    );
}



const wrap = { minHeight: "100dvh", display: "grid", placeItems: "center", background: "#F5DCD2" };
const card = { width: "min(520px, 100%)", background: "white", borderRadius: 14, padding: 24, boxShadow: "0 12px 30px rgba(0,0,0,0.08)" };
const logoutBtn = { padding: "12px 16px", borderRadius: 10, background: "#E74C3C", color: "white", border: "none", fontWeight: 700 };
