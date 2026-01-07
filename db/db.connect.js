const mongoose = require("mongoose");
require("dotenv").config();

const dbUri = process.env.MONGODB;
const initializeDatabase = async () => {
  await mongoose
    .connect(dbUri)
    .then(() => console.log("Database Connected successfully"))
    .catch((error) =>
      console.log("An error occurred while connecting to Database", error)
    );
};

module.exports = { initializeDatabase };
