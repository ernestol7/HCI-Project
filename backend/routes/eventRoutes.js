import express from "express";
//import auth from "../middleware/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Event from "../models/Event.js";
import User from "../models/User.js";
const router = express.Router();

//router.use(auth);
//router.get("/", listEvents);
function parseRange(req) {
    const { start, end } = req.query; // FullCalendar sends these in ISO
    const startDate = start ? new Date(start) : null;
    const endDate   = end   ? new Date(end)   : null;
    return { startDate, endDate };
}

router.get("/", async (req, res) => {
    try {
        const { startDate, endDate } = parseRange(req);
        const query = {};
        if (startDate && endDate) {
            // overlap test: event.start < end && (event.end || event.start) > start
            query.$and = [
                { start: { $lt: endDate } },
                { $or: [{ end: { $gt: startDate } }, { end: { $exists: false } }, { end: null }, { start: { $gt: startDate } }] }
            ];
        }
        const events = await Event.find(query).sort({ start: 1 }).lean();
        // Return in a shape FullCalendar understands directly
        res.json(events.map(e => ({
            id: String(e._id),
            title: e.title,
            start: e.start,
            end: e.end || null,
            allDay: !!e.allDay,
            extendedProps: {
                description: e.description || "",
            },
            color: e.color || undefined,
        })));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load events" });
    }
});

router.post("/", async (req, res) => {
    try {
        const { title, start, description, time, createdBy, capacity, participants } = req.body;

        const event = await Event.create({
            title,
            start: new Date(start),
            description,
            time: time || "",
            capacity: Number(capacity) || 0,
            createdBy: req.user.id,
            participants: [req.user.id]
        })

        res.status(201).json({ message: "Event Created Successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});


/*
router.patch("/:id", updateEvent);
router.delete("/:id", deleteEvent);
router.post("/:id/join", joinEvent);
router.post("/:id/leave", leaveEvent);
*/
export default router;
