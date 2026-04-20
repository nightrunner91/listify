import {
  createUser,
  verifyCredentials,
  signAccessToken,
  signRefreshToken,
  rotateRefreshToken,
  getUserById,
  deleteUserRefreshTokens,
} from '../services/auth.service.js'
import { authenticate } from '../middleware/authenticate.js'
import { db } from '../db/index.js'
import { refreshTokens } from '../db/schema.js'
import { eq } from 'drizzle-orm'

const COOKIE_NAME = 'listify_refresh'
const COOKIE_OPTS = {
  httpOnly: true,
  secure: true, // Required for SameSite=None; Railway always serves over HTTPS
  sameSite: 'none', // Required for cross-origin requests (e.g. GitHub Pages → Railway)
  path: '/api/auth',
  maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
}

function setRefreshCookie(reply, token) {
  reply.setCookie(COOKIE_NAME, token, COOKIE_OPTS)
}

function clearRefreshCookie(reply) {
  reply.clearCookie(COOKIE_NAME, { path: '/api/auth' })
}

export default async function authRoutes(app) {

  // ─── POST /api/auth/register ──────────────────────────────────────────────

  app.post('/register', {
    config: {
      rateLimit: { max: 10, timeWindow: '1 hour' },
    },
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email:    { type: 'string', format: 'email', maxLength: 255 },
          password: { type: 'string', minLength: 8, maxLength: 128 },
        },
        additionalProperties: false,
      },
    },
  }, async (request, reply) => {
    const { email, password } = request.body
    const user = await createUser(email.toLowerCase().trim(), password)
    const accessToken = await signAccessToken(user.id)
    const refreshToken = await signRefreshToken(user.id)
    setRefreshCookie(reply, refreshToken)
    reply.setCookie('listify_uid', String(user.id), { path: '/', secure: true, sameSite: 'none' })
    return reply.status(201).send({ user, accessToken })
  })

  // ─── POST /api/auth/login ─────────────────────────────────────────────────

  app.post('/login', {
    config: {
      rateLimit: { max: 20, timeWindow: '15 minutes' },
    },
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email:    { type: 'string', format: 'email', maxLength: 255 },
          password: { type: 'string', minLength: 1, maxLength: 128 },
        },
        additionalProperties: false,
      },
    },
  }, async (request, reply) => {
    const { email, password } = request.body
    const user = await verifyCredentials(email.toLowerCase().trim(), password)
    const accessToken = await signAccessToken(user.id)
    const refreshToken = await signRefreshToken(user.id)
    setRefreshCookie(reply, refreshToken)
    reply.setCookie('listify_uid', String(user.id), { path: '/', secure: true, sameSite: 'none' })
    return reply.send({ user, accessToken })
  })

  // ─── POST /api/auth/refresh ───────────────────────────────────────────────

  app.post('/refresh', async (request, reply) => {
    const rawToken = request.cookies[COOKIE_NAME]
    if (!rawToken) {
      return reply.status(401).send({ error: 'UNAUTHORIZED', message: 'No refresh token cookie found' })
    }

    // We need the userId — decode without verify first to get sub, then verify signature in rotateRefreshToken
    // Safer: require userId in the body, or store userId in a separate non-httpOnly cookie
    // We store userId in a plain cookie for this purpose:
    const userId = request.cookies['listify_uid']
    if (!userId) {
      return reply.status(401).send({ error: 'UNAUTHORIZED', message: 'Session information missing' })
    }

    const { accessToken, refreshToken } = await rotateRefreshToken(rawToken, userId)
    setRefreshCookie(reply, refreshToken)
    return reply.send({ accessToken })
  })

  // ─── POST /api/auth/logout ────────────────────────────────────────────────

  app.post('/logout', {
    preHandler: authenticate,
  }, async (request, reply) => {
    await deleteUserRefreshTokens(request.user.id)
    clearRefreshCookie(reply)
    reply.clearCookie('listify_uid', { path: '/' })
    return reply.status(204).send()
  })

  // ─── GET /api/auth/me ─────────────────────────────────────────────────────

  app.get('/me', {
    preHandler: authenticate,
  }, async (request, reply) => {
    const user = await getUserById(request.user.id)
    if (!user) {
      return reply.status(404).send({ error: 'NOT_FOUND', message: 'User not found' })
    }
    return reply.send(user)
  })
}
