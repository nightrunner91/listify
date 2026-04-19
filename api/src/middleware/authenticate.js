import { verifyAccessToken } from '../services/auth.service.js'

/**
 * Fastify preHandler hook — verifies the Authorization: Bearer <token> header.
 * Attaches request.user = { id } on success.
 */
export async function authenticate(request, reply) {
  const authHeader = request.headers['authorization']
  if (!authHeader?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'UNAUTHORIZED', message: 'Missing or malformed Authorization header' })
  }

  const token = authHeader.slice(7)
  try {
    const payload = await verifyAccessToken(token)
    request.user = { id: payload.sub }
  } catch {
    return reply.status(401).send({ error: 'UNAUTHORIZED', message: 'Token is invalid or expired' })
  }
}
