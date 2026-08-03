import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import { v4 as uuidv4 } from 'uuid';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import { dbRun, dbGet, dbAll, dbTransact } from './db.js';
import env from './config/env.js';
import { securityHeaders, corsOptions, globalLimiter, authLimiter } from './config/security.js';
import { logger } from './utils/logger.js';
import { auditLogger } from './utils/auditLogger.js';
import errorHandler from './middleware/errorHandler.js';
import healthRouter from './routes/health.js';

// Modular Route Factories
import createAuthRouter from './routes/auth.js';
import createProfilesRouter from './routes/profiles.js';
import createSettingsRouter from './routes/settings.js';
import createGamificationRouter from './routes/gamification.js';
import createNotificationsRouter from './routes/notifications.js';
import createHistoryRouter from './routes/history.js';
import createSavedRouter from './routes/saved.js';
import createChatsRouter from './routes/chats.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = env.PORT;
const JWT_SECRET = env.JWT_SECRET;

// ══════════════════════════════════════════════════════════
// 1. Production security & optimizations
// ══════════════════════════════════════════════════════════
app.use(securityHeaders);
app.use(corsOptions);
app.use(compression());
app.use(express.json());

// ══════════════════════════════════════════════════════════
// 2. Request correlation and logging middleware
// ══════════════════════════════════════════════════════════
app.use((req, res, next) => {
  req.id = uuidv4();
  const startTime = Date.now();

  logger.info(`Incoming ${req.method} ${req.originalUrl}`, {
    requestId: req.id,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info(`Completed ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`, {
      requestId: req.id,
      statusCode: res.statusCode,
      duration
    });
  });

  next();
});

// ══════════════════════════════════════════════════════════
// 3. Global rate limiting
// ══════════════════════════════════════════════════════════
app.use(globalLimiter);

// ══════════════════════════════════════════════════════════
// 4. Mount Health Check Probes
// ══════════════════════════════════════════════════════════
app.use(healthRouter);

// 4.5 Mount Swagger OpenAPI Documentation
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CideDec Enterprise Decision API',
      version: '1.0.0',
      description: 'Production Swagger documentation for CideDec decision endpoints'
    },
    servers: [{ url: process.env.NODE_ENV === 'production'
      ? (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : `https://your-app.up.railway.app`)
      : `http://localhost:${PORT}` }]
  },
  apis: ['./server/routes/*.js', './server/server.js']
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ══════════════════════════════════════════════════════════
// 5. Serve static assets from the Vite frontend build folder
// ══════════════════════════════════════════════════════════
app.use(express.static(path.join(__dirname, '../dist')));

// ══════════════════════════════════════════════════════════
// 6. Authentication Middleware
// ══════════════════════════════════════════════════════════
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decodedUser;
    next();
  });
};

// ══════════════════════════════════════════════════════════
// 7. Shared dependencies for route factories
// ══════════════════════════════════════════════════════════
const deps = { dbRun, dbGet, dbAll, dbTransact, bcrypt, jwt, randomUUID, JWT_SECRET, authenticateToken, logger, auditLogger, authLimiter };

// ══════════════════════════════════════════════════════════
// 8. Mount Versioned API Routes (/api/v1/*)
// ══════════════════════════════════════════════════════════
const authRouter = createAuthRouter(deps);
const profilesRouter = createProfilesRouter(deps);
const settingsRouter = createSettingsRouter(deps);
const gamificationRouter = createGamificationRouter(deps);
const notificationsRouter = createNotificationsRouter(deps);
const historyRouter = createHistoryRouter(deps);
const savedRouter = createSavedRouter(deps);
const chatsRouter = createChatsRouter(deps);

// API v1 versioned routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/profiles', profilesRouter);
app.use('/api/v1/settings', settingsRouter);
app.use('/api/v1/gamification', gamificationRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/history', historyRouter);
app.use('/api/v1/saved', savedRouter);
app.use('/api/v1/chats', chatsRouter);

// ══════════════════════════════════════════════════════════
// 9. Legacy backward-compatible routes (same routers, old paths)
//    These ensure the existing frontend works without changes
//    until Phase 6 migrates frontend to /api/v1/*
// ══════════════════════════════════════════════════════════
app.use('/auth', authRouter);
app.use('/api/profiles', profilesRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/gamification', gamificationRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/history', historyRouter);
app.use('/api/saved', savedRouter);
app.use('/api/chats', chatsRouter);

// ══════════════════════════════════════════════════════════
// 10. Legacy discovery & ATS routes (kept inline for now)
// ══════════════════════════════════════════════════════════

// GET /api/discovery
app.get('/api/discovery', authenticateToken, async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM discovery_answers WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    const parsed = rows.map(r => ({ ...r, answers: JSON.parse(r.answers_json) }));
    res.json({ data: parsed });
  } catch (err) {
    logger.error('Get discovery error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/discovery
app.post('/api/discovery', authenticateToken, async (req, res) => {
  const { answers } = req.body;
  const id = randomUUID();
  try {
    await dbRun('INSERT INTO discovery_answers (id, user_id, answers_json) VALUES (?, ?, ?)', [id, req.user.id, JSON.stringify(answers)]);
    const created = await dbGet('SELECT * FROM discovery_answers WHERE id = ?', [id]);
    created.answers = JSON.parse(created.answers_json);
    // Auto-notification: journey completion
    await dbRun('INSERT INTO notifications (id, user_id, title, body, type) VALUES (?, ?, ?, ?, ?)',
      [randomUUID(), req.user.id, 'Career Journey Complete!', 'Your personality profile has been saved. Check your Career Intelligence now.', 'success']
    );
    res.status(201).json({ data: created });
  } catch (err) {
    logger.error('Create discovery error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ats
app.get('/api/ats', authenticateToken, async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM ats_reports WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    const parsed = rows.map(r => ({ ...r, analysis: JSON.parse(r.analysis_json) }));
    res.json({ data: parsed });
  } catch (err) {
    logger.error('Get ATS error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ats
app.post('/api/ats', authenticateToken, async (req, res) => {
  const { file_name, score, analysis } = req.body;
  const id = randomUUID();
  try {
    await dbRun('INSERT INTO ats_reports (id, user_id, file_name, score, analysis_json) VALUES (?, ?, ?, ?, ?)', [id, req.user.id, file_name, score, JSON.stringify(analysis)]);
    const created = await dbGet('SELECT * FROM ats_reports WHERE id = ?', [id]);
    created.analysis = JSON.parse(created.analysis_json);
    auditLogger.log('ATS_REPORT_CREATED', req.user.id, req.ip, { file_name, score });
    // Auto-notification: resume analyzed
    const scoreNum = Number(score) || 0;
    const notifBody = scoreNum >= 80
      ? `Resume scored ${scoreNum}% — Excellent match! Review full breakdown.`
      : scoreNum >= 60
      ? `Resume scored ${scoreNum}% — Good match. See improvement tips.`
      : `Resume scored ${scoreNum}%. Optimize skills and keywords.`;
    await dbRun('INSERT INTO notifications (id, user_id, title, body, type) VALUES (?, ?, ?, ?, ?)',
      [randomUUID(), req.user.id, `Resume Analyzed — ${file_name || 'your resume'}`, notifBody, 'insight']
    );
    res.status(201).json({ data: created });
  } catch (err) {
    logger.error('Create ATS error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════
// 11. Fallback: client-side routing support
// ══════════════════════════════════════════════════════════
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/auth') || req.path === '/health' || req.path === '/ready' || req.path === '/live') {
    return next();
  }
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// ══════════════════════════════════════════════════════════
// 12. Centralized error handler (must be last middleware)
// ══════════════════════════════════════════════════════════
app.use(errorHandler);

// ══════════════════════════════════════════════════════════
// 13. Start server with graceful shutdown
// ══════════════════════════════════════════════════════════
export default app;

if (!process.env.VERCEL) {
  const server = app.listen(PORT, () => {
    const url = process.env.NODE_ENV === 'production'
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN || 'your-app.up.railway.app'}`
      : `http://localhost:${PORT}`;
    logger.info(`CideDec backend listening on port ${PORT} → ${url}`);
  });

  const shutdown = () => {
    logger.info('Received shutdown signal. Closing HTTP server gracefully...');
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
    setTimeout(() => {
      logger.error('Force shutdown triggered after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

