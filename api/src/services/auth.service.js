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
  const token = nanoid(64)
  const hash = await bcrypt.hash(token, 10) // lighter hash for tokens, not passwords
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30) // 30 days

  await db.insert(refreshTokens).values({
    userId,
    tokenHash: hash,
    expiresAt,
  })

  return token
}

export async function verifyAccessToken(token) {
  const { payload } = await jwtVerify(token, accessSecret())
  return payload // { sub: userId, ... }
}

export async function rotateRefreshToken(rawToken, userId) {
  // Find all non-expired tokens for user, verify one matches
  const stored = await db
    .select()
    .from(refreshTokens)
    .where(and(eq(refreshTokens.userId, userId), gt(refreshTokens.expiresAt, new Date())))

  for (const row of stored) {
    const match = await bcrypt.compare(rawToken, row.tokenHash)
    if (match) {
      // Delete the used token (rotation)
      await db.delete(refreshTokens).where(eq(refreshTokens.id, row.id))
      // Issue new pair
      const accessToken = await signAccessToken(userId)
      const refreshToken = await signRefreshToken(userId)
      return {
        accessToken,
        refreshToken 
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
    })
    .returning({ 
      id: users.id, 
      email: users.email, 
      username: users.username,
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
      avatarStyle: users.avatarStyle,
      avatarSeed: users.avatarSeed,
      avatarOptions: users.avatarOptions,
      backgroundColor: users.backgroundColor,
      isPublic: users.isPublic,
      createdAt: users.createdAt,
    })

  return updated
}
