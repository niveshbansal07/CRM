const mongoose = require("mongoose");
const env = require("./env");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.mongoUri, {
      autoIndex: true, // dev me helpful, prod me later false kar sakte ho
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;