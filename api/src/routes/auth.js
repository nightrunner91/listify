import {
  createUser,
  verifyCredentials,
  signAccessToken,
  signRefreshToken,
  rotateRefreshToken,
  getUserById,
  deleteUserRefreshTokens
} from '../services/auth.service.js'
import { authenticate } from '../middleware/authenticate.js'

const COOKIE_NAME = 'listify_refresh'
const UID_COOKIE_NAME = 'listify_uid'
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000

function getCookieOpts() {
  const isDev = process.env.NODE_ENV !== 'production'
  return {
    httpOnly: true,
    secure: !isDev,
    sameSite: isDev ? 'lax' : 'none',
    path: '/',
    maxAge: ONE_YEAR_MS / 1000,
    expires: new Date(Date.now() + ONE_YEAR_MS),
  }
}

function getUidCookieOpts() {
  const isDev = process.env.NODE_ENV !== 'production'
  return {
    path: '/',
    secure: !isDev,
    sameSite: isDev ? 'lax' : 'none',
    httpOnly: true,
    maxAge: ONE_YEAR_MS / 1000,
    expires: new Date(Date.now() + ONE_YEAR_MS),
  }
}

function setRefreshCookie(reply, token) {
  reply.setCookie(COOKIE_NAME, token, getCookieOpts())
}

function clearRefreshCookie(reply) {
  reply.clearCookie(COOKIE_NAME, getCookieOpts())
}

export default async function authRoutes(app) {

  // ─── POST /api/auth/register ──────────────────────────────────────────────

  app.post('/register', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 hour' 
      },
    },
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email:    {
            type: 'string',
            format: 'email',
            maxLength: 255 
          },
          password: {
            type: 'string',
            minLength: 8,
            maxLength: 128 
          },
        },
        additionalProperties: false,
      },
    },
  }, async (request, reply) => {
    const {
      email, password 
    } = request.body
    const user = await createUser(email.toLowerCase().trim(), password)
    const accessToken = await signAccessToken(user.id)
    const refreshToken = await signRefreshToken(user.id)
    setRefreshCookie(reply, refreshToken)
    reply.setCookie(UID_COOKIE_NAME, String(user.id), getUidCookieOpts())
    return reply.status(201).send({
      user,
      accessToken,
      refreshToken,
    })
  })

  // ─── POST /api/auth/login ─────────────────────────────────────────────────

  app.post('/login', {
    config: {
      rateLimit: {
        max: 20,
        timeWindow: '15 minutes' 
      },
    },
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email:    {
            type: 'string',
            format: 'email',
            maxLength: 255 
          },
          password: {
            type: 'string',
            minLength: 1,
            maxLength: 128 
          },
        },
        additionalProperties: false,
      },
    },
  }, async (request, reply) => {
    const {
      email, password 
    } = request.body
    const user = await verifyCredentials(email.toLowerCase().trim(), password)
    await deleteUserRefreshTokens(user.id)
    const accessToken = await signAccessToken(user.id)
    const refreshToken = await signRefreshToken(user.id)
    setRefreshCookie(reply, refreshToken)
    reply.setCookie(UID_COOKIE_NAME, String(user.id), getUidCookieOpts())
    return reply.send({
      user,
      accessToken,
      refreshToken,
    })
  })

  // ─── POST /api/auth/refresh ───────────────────────────────────────────────

  app.post('/refresh', {
    config: {
      rateLimit: {
        max: 30,
        timeWindow: '1 minute' 
      },
    },
    schema: {
      body: {
        type: 'object',
        properties: {
          refreshToken: { type: 'string' },
        },
        additionalProperties: false,
      },
    },
  }, async (request, reply) => {
    // Try cookie first (primary mechanism)
    let rawToken = request.cookies[COOKIE_NAME]
    const hasCookie = !!rawToken
    const hasBodyToken = !!request.body?.refreshToken

    app.log.debug({
      msg: 'Refresh attempt',
      hasCookie,
      hasBodyToken,
      cookieKeys: Object.keys(request.cookies),
      origin: request.headers.origin,
    })

    // Fall back to body token (for cross-origin scenarios where cookies fail)
    if (!rawToken && request.body?.refreshToken) {
      rawToken = request.body.refreshToken
    }

    if (!rawToken) {
      app.log.warn('Refresh failed: no token found')
      return reply.status(401).send({
        error: 'UNAUTHORIZED',
        message: 'No refresh token found' 
      })
    }

    const fallbackUserId = request.cookies[UID_COOKIE_NAME]
    const {
      accessToken, refreshToken
    } = await rotateRefreshToken(rawToken, fallbackUserId)

    // Always set cookie (works when request comes from same origin or proper proxy)
    setRefreshCookie(reply, refreshToken)

    app.log.debug('Refresh successful')

    // Always return refresh token in body (works for all scenarios)
    return reply.send({
      accessToken,
      refreshToken,
    })
  })

  // ─── POST /api/auth/logout ────────────────────────────────────────────────

  app.post('/logout', {preHandler: authenticate,}, async (request, reply) => {
    await deleteUserRefreshTokens(request.user.id)
    clearRefreshCookie(reply)
    reply.clearCookie(UID_COOKIE_NAME, getUidCookieOpts())
    return reply.status(204).send()
  })

  // ─── GET /api/auth/me ─────────────────────────────────────────────────────

  app.get('/me', {preHandler: authenticate,}, async (request, reply) => {
    const user = await getUserById(request.user.id)
    if (!user) {
      return reply.status(404).send({
        error: 'NOT_FOUND',
        message: 'User not found' 
      })
    }
    return reply.send(user)
  })
}
