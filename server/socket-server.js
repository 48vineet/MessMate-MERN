// Standalone Socket.IO server for deployment on platforms that support persistent connections
// Deploy this separately on Railway, Render, or similar platforms
require("dotenv").config();
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const socketHandler = require("./utils/socketHandler");

const app = require("express")();
const httpServer = createServer(app);

// CORS configuration for Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || process.env.ALLOWED_ORIGINS?.split(",") || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Socket.IO server is running! 🔌",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Database connection
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not set");
    }
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

// Initialize Socket.IO handler
socketHandler(io);

// Start server
const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  httpServer.close(() => {
    mongoose.connection.close(false, () => {
      process.exit(0);
    });
  });
});

process.on("SIGINT", () => {
  httpServer.close(() => {
    mongoose.connection.close(false, () => {
      process.exit(0);
    });
  });
});

module.exports = { io, httpServer };

