// models/Event.js
import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    start: { type: Date, required: true },
    end: { type: Date },                  // optional
    allDay: { type: Boolean, default: true },

    description: { type: String, trim: true, default: "" },
    time: { type: String, trim: true, default: "" },

    // relationships
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // RSVP
    capacity: { type: Number, default: 0 },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

EventSchema.index({ classId: 1, start: 1 });
EventSchema.index({ start: 1, end: 1 });

export default mongoose.model("Event", EventSchema);