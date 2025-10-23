import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
//app.use("/api/events", eventRoutes);

dotenv.config();
await connectDB();

const app = express();
// middleware
app.use(cors());
app.use(express.json());
// routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
const PORT = process.env.PORT || 5000;
app.use(cors({ origin: "http://localhost:5173", credentials: true })); // adjust origin/port

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));