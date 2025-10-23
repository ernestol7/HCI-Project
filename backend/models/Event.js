import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        start: { type: Date, required: true },
        description: {type: String, required: true, trim: true },
        time:   { type: String, required: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        capacity: { type: Number, default: 0 },
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
);

EventSchema.index({ start: 1, end: 1 });

export default mongoose.model("Event", EventSchema);
