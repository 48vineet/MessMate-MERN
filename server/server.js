// server/server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require("path");

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const menuRoutes = require("./routes/menu");
const bookingRoutes = require("./routes/bookings");
const inventoryRoutes = require("./routes/inventory");
const paymentRoutes = require("./routes/payments");
const feedbackRoutes = require("./routes/feedback");
const analyticsRoutes = require("./routes/analytics");
const attendanceRoutes = require("./routes/attendance");
const notificationRoutes = require("./routes/notifications");
const reportsRoutes = require("./routes/reports");
const settingsRoutes = require("./routes/settings");
const contactRoutes = require("./routes/contact");

// --- ADD these lines for your new routes: ---
const mealsRoutes = require("./routes/meals");
const walletRoutes = require("./routes/wallet");
// -----------------------------------------------

// Import middleware
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");
const socketHandler = require("./utils/socketHandler");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
});

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        scriptSrc: ["'self'"],
        // Allow API + WebSocket connections to any host (prod safe)
        connectSrc: ["'self'", "https:", "http:", "wss:", "ws:"],
      },
    },
  })
);

// CORS configuration (original simple allowlist)
app.use(
  cors({
    origin: true, // Reflects the request origin, supports credentials
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // Increased from 500 to 2000 for development
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: true, // Don't count successful requests
  skipFailedRequests: false, // Count failed requests
});
app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging
app.use(morgan("dev"));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/public", express.static(path.join(__dirname, "public")));

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`📊 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MessMate API is running! 🚀",
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || "v1",
    environment: process.env.NODE_ENV || "development",
  });
});

// (No custom root route)

// Test endpoint for bookings
app.get("/api/test-bookings", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Bookings endpoint is accessible!",
    timestamp: new Date().toISOString(),
  });
});

// API Routes (order does not matter for these)
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/user/attendance", attendanceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/contact", contactRoutes);

// --- Register NEW endpoints! ---
app.use("/api/meals", mealsRoutes);
app.use("/api/wallet", walletRoutes);
// --------------------------------

// Socket.IO handler
socketHandler(io);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// For Vercel: export the Express app
module.exports = app;
