// src/config/db.js — Kết nối MongoDB qua Mongoose
const mongoose = require('mongoose');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  console.log(`✅ MongoDB: ${conn.connection.host}`);
  
  mongoose.connection.on('error', (err) => console.error('DB Error:', err));
  mongoose.connection.on('disconnected', () => console.warn('DB Disconnected'));
};

module.exports = connectDB;