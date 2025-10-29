import express from "express";
import auth from "../middleware/auth.js";
import Event from "../models/Event.js";

const router = express.Router();

// Helper: parse FullCalendar range
function parseRange(req) {
  const { start, end } = req.query; // ISO strings
  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;
  return { startDate, endDate };
}

// List events for given classes (supports one or many classIds)
router.get("/", auth, async (req, res) => {
  try {
    const { startDate, endDate } = parseRange(req);
    const { classIds, classId } = req.query; // either `classId=...` or `classIds=a,b,c`

    let filter = {};
    // class filter
    const ids = classIds ? classIds.split(",").filter(Boolean) : (classId ? [classId] : []);
    if (ids.length) filter.classId = { $in: ids };

    // range overlap
    if (startDate && endDate) {
      filter.$and = [
        { start: { $lt: endDate } },
        { $or: [{ end: { $gt: startDate } }, { end: { $exists: false } }, { end: null }, { start: { $gte: startDate } }] },
      ];
    }

    const events = await Event.find(filter).sort({ start: 1 }).lean();

    res.json(
      events.map((e) => ({
        id: String(e._id),
        title: e.title,
        start: e.start,
        end: e.end || null,
        allDay: !!e.allDay,
        extendedProps: {
          description: e.description || "",
          time: e.time || "",
          capacity: e.capacity || 0,
          classId: e.classId,
          attendeesCount: (e.participants || []).length,
        },
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load events" });
  }
});

// Create event (class scoped)
router.post("/", auth, async (req, res) => {
  try {
    const { title, start, end, description, time, capacity, classId } = req.body;
    if (!title || !start || !classId) return res.status(400).json({ message: "title, start, classId required" });

    const evt = await Event.create({
      title: title.trim(),
      description: (description || "").trim(),
      start: new Date(start),
      end: end ? new Date(end) : undefined,
      allDay: !time, // crude rule; adjust as you like
      time: time || "",
      capacity: Number.isFinite(Number(capacity)) ? Number(capacity) : 0,
      classId,
      createdBy: req.user.id,
      participants: [req.user.id], // auto-RSVP creator
    });

    res.status(201).json({ id: String(evt._id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// RSVP: join
router.post("/:id/join", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const evt = await Event.findByIdAndUpdate(
      id,
      { $addToSet: { participants: req.user.id } },
      { new: true }
    );
    if (!evt) return res.status(404).json({ message: "Event not found" });
    res.json({ attendeesCount: evt.participants.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// RSVP: leave
router.post("/:id/leave", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const evt = await Event.findByIdAndUpdate(
      id,
      { $pull: { participants: req.user.id } },
      { new: true }
    );
    if (!evt) return res.status(404).json({ message: "Event not found" });
    res.json({ attendeesCount: evt.participants.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;