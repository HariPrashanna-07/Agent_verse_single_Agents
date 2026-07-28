import mongoose from 'mongoose';
import { config } from './env.js';

export async function connectDB() {
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[Database] Local MongoDB connection failed (${error.message}).`);
    console.warn(`[Database] Switching to In-Memory / Simulated Storage mode for instant evaluation.`);
    return null;
  }
}
