import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const required = (key: string, fallback?: string): string => {
  const value = process.env[key] || fallback;
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
};

export const env = {
  port: parseInt(required('PORT', '5000'), 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: required('CLIENT_URL', 'http://localhost:5173'),
  mongoUri: required('MONGO_URI', 'mongodb://localhost:27017/urban-threads'),
  jwtSecret: required('JWT_SECRET', 'dev-secret-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
  },
};
