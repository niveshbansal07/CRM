
const mongoose = require('mongoose');

async function connectDB() {
  try {
    // For local: 'mongodb://127.0.0.1:27017/yourDB'
    // For Atlas: 'mongodb+srv://<username>:<password>@cluster.mongodb.net/yourDB'
    await mongoose.connect('mongodb://127.0.0.1:27017/crm');
    console.log("Connected to MongoDB successfully");
  } catch (err) {
    console.error("MongoDB Connection error:", err);
  }
}

module.exports = connectDB;



