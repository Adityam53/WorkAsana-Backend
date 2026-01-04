const mongoose = require("mongoose");
require("dotenv").config();

let isConnected = false;
const dbUri = process.env.MONGODB;
const initializeDatabase = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(dbUri);
    isConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error", err);
    throw err;
  }
};

module.exports = { initializeDatabase };
