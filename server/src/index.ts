import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { connectDB } from './config/db';
import './config/cloudinary'; // init
import router from './routes';
import { errorHandler, notFound } from './middleware/error';

const app = express();

app.use(
  cors({
    origin: [env.clientUrl, 'http://localhost:5173', 'http://localhost:4173'],
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
