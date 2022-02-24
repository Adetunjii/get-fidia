const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

const mongodbUrl = process.env.MONGODB_URL;

const connectDB = async () => {
  const db = await mongoose.connect(mongodbUrl);

  if (db) console.log("Successfully connected to the database");

  db.connection.on("error", () => {
    console.log("An error occured");
    process.exit(1);
  });
};

module.exports = {connectDB};
