import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

import pool from "./config/db.js";
import { initDb } from "./models/initDb.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.get("/", (req, res) => {
    res.json({ message: "API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/admin", adminRoutes);

// Test DB connection on startup and ensure tables
(async () => {
    try {
        await pool.getConnection();
        console.log("Connected to MySQL (pool)");
        await initDb();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error("Error connecting to MySQL", err);
        process.exit(1);
    }
})();