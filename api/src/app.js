import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'

import { checkDbConnection } from './db/index.js'
import authRoutes from './routes/auth.js'
import recordsRoutes from './routes/records.js'
import customListsRoutes from './routes/custom-lists.js'
import settingsRoutes from './routes/settings.js'
import importRoutes from './routes/import.js'
import activitiesRoutes from './routes/activities.js'
import userRoutes from './routes/users.js'
import i18nPlugin from './plugins/i18n.js'

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport: process.env.NODE_ENV !== 'production'
        ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'pid,hostname' 
          } 
        }
        : undefined,
    },
  })

  // ─── Plugins ───────────────────────────────────────────────────────────────

  await app.register(i18nPlugin)

  await app.register(helmet, {contentSecurityPolicy: false, // frontend handles its own CSP
  })

  await app.register(cookie, {
    secret: process.env.COOKIE_SECRET,
    hook: 'onRequest',
  })

  const allowedOrigins = process.env.FRONTEND_ORIGINS
    ? process.env.FRONTEND_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:5173']

  await app.register(cors, {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })

  await app.register(rateLimit, {
    global: true,
    max: 200,
    timeWindow: '1 minute',
    errorResponseBuilder: (request, context) => ({
      error: 'RATE_LIMITED',
      message: request.t ? request.t('errors.RATE_LIMITED') : 'Too many requests, please try again later.',
    }),
  })

  // ─── Routes ────────────────────────────────────────────────────────────────

  await app.register(authRoutes,        { prefix: '/api/auth' })
  await app.register(recordsRoutes,     { prefix: '/api/records' })
  await app.register(customListsRoutes, { prefix: '/api/custom-lists' })
  await app.register(settingsRoutes,    { prefix: '/api/settings' })
  await app.register(activitiesRoutes,  { prefix: '/api/activities' })
  await app.register(userRoutes,        { prefix: '/api/users' })
  await app.register(importRoutes,      { prefix: '/api' })

  // ─── Health check ──────────────────────────────────────────────────────────

  app.get('/health', async () => {
    await checkDbConnection()
    return {
      status: 'ok',
      timestamp: new Date().toISOString() 
    }
  })

  // ─── Global error handler ──────────────────────────────────────────────────

  app.setErrorHandler((error, request, reply) => {
    const statusCode = error.statusCode ?? 500

    // Fastify validation errors
    if (error.validation) {
      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        message: error.message,
      })
    }

    // Known application errors (thrown with statusCode)
    if (statusCode < 500) {
      return reply.status(statusCode).send({
        error: error.code ?? 'REQUEST_ERROR',
        message: error.message,
      })
    }

    // Unexpected server errors — log full trace, return generic message
    request.log.error(error)
    return reply.status(500).send({
      error: 'INTERNAL_ERROR',
      message: request.t ? request.t('errors.INTERNAL_ERROR') : 'Something went wrong.',
    })
  })

  // ─── 404 handler ──────────────────────────────────────────────────────────

  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: 'NOT_FOUND',
      message: `Route ${request.method} ${request.url} not found`,
    })
  })

  return app
}
