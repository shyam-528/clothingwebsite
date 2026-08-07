import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.mongoUri);
    console.log(`[mongo] connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error('[mongo] connection failed:', err);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('[mongo] disconnected');
  });
};
