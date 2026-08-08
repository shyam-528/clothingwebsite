import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { connectDB } from './config/db';
import './config/cloudinary'; // init
import router from './routes';
import { errorHandler, notFound } from './middleware/error';

const app = express();

// Allow the configured client URL plus any Vercel preview/production domains.
// Empty/missing CLIENT_URL env var falls back to localhost dev origins.
const allowedOrigins = [
  env.clientUrl,
  'http://localhost:5173',
  'http://localhost:4173',
  'https://clothingwebsite-pink.vercel.app',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Same-origin or no Origin header (server-to-server, curl) → allow.
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      // Vercel preview deployments (*.vercel.app) → allow in non-production.
      if (env.nodeEnv !== 'production' && /\.vercel\.app$/.test(origin)) {
        return cb(null, true);
      }
      return cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Lightweight request log
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api', router);

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`[server] listening on http://localhost:${env.port}`);
    console.log(`[server] env=${env.nodeEnv}`);
  });
};

start().catch((err) => {
  console.error('[fatal]', err);
  process.exit(1);
});
