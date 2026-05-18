import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './lib/env';
import { errorHandler, notFound } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import courseRoutes from './routes/courses';
import scholarshipRoutes from './routes/scholarships';
import contactRoutes from './routes/contact';
import meRoutes from './routes/me';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(express.json({ limit: '256kb' }));
  app.use(cookieParser());
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (env.CORS_ORIGINS.length === 0 || env.CORS_ORIGINS.includes(origin)) {
          return cb(null, true);
        }
        return cb(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
    }),
  );

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/courses', courseRoutes);
  app.use('/api/scholarships', scholarshipRoutes);
  app.use('/api/me', meRoutes);
  app.use('/api', contactRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export const app = createApp();

if (require.main === module) {
  app.listen(env.PORT, () => {
    console.log(`[skillence-api] listening on :${env.PORT} (${env.NODE_ENV})`);
  });
}
