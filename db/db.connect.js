const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const initializeDatabase = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
      })
      .then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  console.log("MongoDB connected");

  return cached.conn;
};

module.exports = { initializeDatabase };
