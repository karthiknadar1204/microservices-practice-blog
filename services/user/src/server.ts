import express from "express";
import dotenv from "dotenv";
import connectDb from "./utils/db.js";
import cors from "cors";
import userRoutes from "./routes/user.js";

dotenv.config();

const app = express();

// Basic request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// CORS configuration
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDb();

app.get("/health", (req, res) => {
  console.log("Health check requested");
  res.status(200).json({ message: "Server is running" });
});

app.use("/api/v1", userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const port = process.env.PORT || 5004;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});