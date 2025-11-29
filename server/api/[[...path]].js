// Vercel Serverless catch-all for /api routes (Project root: server)
const mongoose = require("mongoose");
const app = require("../server");

let isConnected = false;

async function connectToDatabase() {
  if (isConnected) return;
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set");
  }
  const conn = await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  isConnected = !!conn?.connections?.[0]?.readyState;
}

module.exports = async (req, res) => {
  try {
    await connectToDatabase();
  } catch (err) {
    console.error("Database connection error:", err);
    res.statusCode = 500;
    res.end("Database connection error");
    return;
  }
  // Delegate to express app (express is a request handler function)
  return app(req, res);
};
