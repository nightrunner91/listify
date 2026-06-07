import {
  SignJWT,
  jwtVerify
} from 'jose'
import { nanoid } from 'nanoid'
import bcrypt from 'bcrypt'
import { db } from '../db/index.js'
import {
  users,
  refreshTokens,
  userSettings
} from '../db/schema.js'
import {
  eq,
  and,
  gt
} from 'drizzle-orm'

const BCRYPT_ROUNDS = 12

// ─── Token helpers ────────────────────────────────────────────────────────────

function accessSecret() {
  return new TextEncoder().encode(process.env.JWT_ACCESS_SECRET)
}

function refreshSecret() {
  return new TextEncoder().encode(process.env.JWT_REFRESH_SECRET)
}

export async function signAccessToken(userId) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(process.env.JWT_ACCESS_EXPIRES_IN ?? '15m')
    .setIssuedAt()
    .sign(accessSecret())
}

export async function signRefreshToken(userId) {
  const jti = nanoid(64)
  const hash = await bcrypt.hash(jti, 10)
  const expiresInSeconds = parseExpiresInSeconds(process.env.JWT_REFRESH_EXPIRES_IN ?? '30d')
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000)

  await db.insert(refreshTokens).values({
    userId,
    tokenHash: hash,
    expiresAt,
  })

  return new SignJWT({
    sub: userId,
    jti 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresInSeconds.toString() + 's')
    .setIssuedAt()
    .sign(refreshSecret())
}

function parseExpiresInSeconds(str) {
  const unit = str.slice(-1)
  const value = parseInt(str.slice(0, -1), 10)
  switch (unit) {
    case 's': return value
    case 'm': return value * 60
    case 'h': return value * 3600
    case 'd': return value * 86400
    case 'w': return value * 604800
    case 'y': return value * 31536000
    default: return parseInt(str, 10)
  }
}

export async function verifyAccessToken(token) {
  const { payload } = await jwtVerify(token, accessSecret())
  return payload // { sub: userId, ... }
}

async function verifyRefreshTokenJWT(token) {
  const { payload } = await jwtVerify(token, refreshSecret())
  return {
    userId: payload.sub,
    jti: payload.jti 
  }
}

export async function rotateRefreshToken(rawToken) {
  const {
    userId, jti 
  } = await verifyRefreshTokenJWT(rawToken)

  const allValid = await db
    .select()
    .from(refreshTokens)
    .where(and(eq(refreshTokens.userId, userId), gt(refreshTokens.expiresAt, new Date())))

  for (const row of allValid) {
    const match = await bcrypt.compare(jti, row.tokenHash)
    if (match) {
      await db.delete(refreshTokens).where(eq(refreshTokens.id, row.id))
      const accessToken = await signAccessToken(userId)
      const refreshToken = await signRefreshToken(userId)
      return {
        accessToken,
        refreshToken,
        userId,
      }
    }
  }

  throw Object.assign(new Error('Invalid or expired refresh token'), {
    statusCode: 401,
    code: 'INVALID_REFRESH_TOKEN'
  })
}

// ─── User operations ──────────────────────────────────────────────────────────

export async function createUser(email, password) {
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (existing.length > 0) {
    throw Object.assign(new Error('Email already registered'), {
      statusCode: 409,
      code: 'EMAIL_TAKEN' 
    })
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)

  const [user] = await db
    .insert(users)
    .values({ 
      email, 
      password: passwordHash,
      username: `User-${nanoid(5)}`,
      avatarSeed: nanoid(10),
      handle: nanoid(8),
    })
    .returning({ 
      id: users.id, 
      email: users.email, 
      username: users.username,
      handle: users.handle,
      avatarStyle: users.avatarStyle,
      avatarSeed: users.avatarSeed,
      avatarOptions: users.avatarOptions,
      backgroundColor: users.backgroundColor,
      isPublic: users.isPublic,
      createdAt: users.createdAt 
    })

  // Create default settings row
  await db.insert(userSettings).values({ userId: user.id }).onConflictDoNothing()

  return user
}

export async function verifyCredentials(email, password) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)

  // Timing-safe: always run bcrypt even if user not found
  const hash = user?.password ?? '$2b$12$invalidhashtopreventtimingattack000000000000000000000'
  const match = await bcrypt.compare(password, hash)

  if (!user || !match) {
    throw Object.assign(new Error('Invalid email or password'), {
      statusCode: 401,
      code: 'INVALID_CREDENTIALS' 
    })
  }

  return { 
    id: user.id, 
    email: user.email, 
    username: user.username,
    handle: user.handle,
    avatarStyle: user.avatarStyle,
    avatarSeed: user.avatarSeed,
    avatarOptions: user.avatarOptions,
    backgroundColor: user.backgroundColor,
    isPublic: user.isPublic,
    createdAt: user.createdAt 
  }
}

export async function getUserById(id) {
  const [user] = await db
    .select({ 
      id: users.id, 
      email: users.email, 
      username: users.username,
      handle: users.handle,
      avatarStyle: users.avatarStyle,
      avatarSeed: users.avatarSeed,
      avatarOptions: users.avatarOptions,
      backgroundColor: users.backgroundColor,
      isPublic: users.isPublic,
      createdAt: users.createdAt 
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1)

  return user ?? null
}

export async function deleteUserRefreshTokens(userId) {
  await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId))
}

export async function updateUserProfile(userId, data) {
  const [updated] = await db
    .update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      email: users.email,
      username: users.username,
      handle: users.handle,
      avatarStyle: users.avatarStyle,
      avatarSeed: users.avatarSeed,
      avatarOptions: users.avatarOptions,
      backgroundColor: users.backgroundColor,
      isPublic: users.isPublic,
      createdAt: users.createdAt,
    })

  return updated
}
