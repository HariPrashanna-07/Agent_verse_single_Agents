const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_file_organizer';
    const conn = await mongoose.connect(connStr);
    console.log(`[MongoDB Connected]: Host ${conn.connection.host}:${conn.connection.port} / DB: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    // Non-fatal warning if offline/testing mode, but log clearly
    process.exitCode = 1;
    throw error;
  }
};

module.exports = connectDB;
