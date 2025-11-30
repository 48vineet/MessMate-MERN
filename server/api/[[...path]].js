// Vercel Serverless catch-all for /api routes (Project root: server)
const mongoose = require("mongoose");
const app = require("../server.js");

let isConnected = false;
let connectionPromise = null;

async function connectToDatabase() {
  // Return existing connection if available
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }
  
  // If connection is in progress, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }
  
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set");
  }
  
  // Create connection promise
  connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }).then((conn) => {
    isConnected = conn?.connections?.[0]?.readyState === 1;
    console.log("Database connected for serverless function");
    return conn;
  }).catch((error) => {
    console.error("Database connection error:", error);
    isConnected = false;
    connectionPromise = null;
    throw error;
  });
  
  return connectionPromise;
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }
  
  try {
    await connectToDatabase();
  } catch (err) {
    console.error("Database connection error:", err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      success: false, 
      message: "Database connection error",
      error: process.env.NODE_ENV === "development" ? err.message : "Internal server error"
    }));
    return;
  }
  
  // Delegate to express app (express is a request handler function)
  return app(req, res);
};
