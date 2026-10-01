import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import authRoutes from './server/routes/authRoutes';
import dashboardRoutes from './server/routes/dashboardRoutes';
import studentRoutes from './server/routes/studentRoutes';
import admissionRoutes from './server/routes/admissionRoutes';
import departmentRoutes from './server/routes/departmentRoutes';
import courseRoutes from './server/routes/courseRoutes';
import idCardRoutes from './server/routes/idCardRoutes';
import promotionRoutes from './server/routes/promotionRoutes';
import alumniRoutes from './server/routes/alumniRoutes';
import reportRoutes from './server/routes/reportRoutes';
import notificationRoutes from './server/routes/notificationRoutes';
import settingsRoutes from './server/routes/settingsRoutes';
import facultyRoutes from './server/routes/facultyRoutes';
import { errorHandler } from './server/middlewares/errorMiddleware';
import { UserModel } from './server/models/User';
import { connectMongo } from './server/config/mongo';

dotenv.config();

// Declare cookie object on Express Request
declare global {
  namespace Express {
    interface Request {
      cookies?: Record<string, string>;
    }
  }
}

async function startServer() {
  await connectMongo();
  const app = express();
  const PORT = 3000;

  // Body parsers (50mb limit for file attachments)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Custom Lightweight Cookie Parser
  app.use((req, res, next) => {
    req.cookies = {};
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
      cookieHeader.split(';').forEach((cookie) => {
        const parts = cookie.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const val = parts.slice(1).join('=').trim();
          req.cookies![key] = decodeURIComponent(val);
        }
      });
    }
    next();
  });

  // Seed default demo accounts on server boot
  await UserModel.seedDefaultUsers();

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'ScholarCore SIMS Auth Service',
      time: new Date().toISOString()
    });
  });

  // Mount Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/dashboard', dashboardRoutes);
  app.use('/api/v1/students', studentRoutes);
  app.use('/api/v1/admissions', admissionRoutes);
  app.use('/api/v1/departments', departmentRoutes);
  app.use('/api/v1/courses', courseRoutes);
  app.use('/api/v1/idcards', idCardRoutes);
  app.use('/api/v1/promotions', promotionRoutes);
  app.use('/api/v1/alumni', alumniRoutes);
  app.use('/api/v1/reports', reportRoutes);
  app.use('/api/v1/notifications', notificationRoutes);
  app.use('/api/v1/settings', settingsRoutes);
  app.use('/api/v1/faculty', facultyRoutes);

  // Global Error Handler Middleware
  app.use(errorHandler);

  // Vite middleware for development vs static production serve
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ScholarCore SIMS] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
