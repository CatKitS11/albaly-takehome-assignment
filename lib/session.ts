import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { SessionPayload } from '@/lib/types'
import prisma from '@/lib/prisma'

const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

// Encrypt session payload to JWT
export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload, expiresAt: payload.expiresAt.toISOString() })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('3d')
    .sign(encodedKey)
}

// Decrypt JWT to session payload
export async function decrypt(session: string | undefined = ''): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return {
      sessionId: payload.sessionId as number,
      userId: payload.userId as number,
      role: payload.role as string,
      expiresAt: new Date(payload.expiresAt as string),
    }
  } catch (error) {
    console.log('Failed to verify session:', error)
    return null
  }
}
// add type for session with user to session payload
export type SessionWithUser = SessionPayload & {
  user: {
    id: number
    email: string
    role: string
  }
}

// Create session in DB + set cookie
export async function createSession(userId: number, role: string) {
  const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days

  // 1. Create session in database
  const dbSession = await prisma.session.create({
    data: {
      userId,
      token: crypto.randomUUID(), // unique token
      expiresAt,
    },
  })

  // 2. Encrypt session data
  const sessionPayload: SessionPayload = { sessionId: dbSession.id, userId, role, expiresAt }
  const encryptedSession = await encrypt(sessionPayload)

  // 3. Set cookie
  const cookieStore = await cookies()
  cookieStore.set('session', encryptedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })

  return { sessionId: dbSession.id, token: encryptedSession }
}

// Verify session from cookie
export async function verifySession(): Promise<SessionWithUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) return null

  // 1. Decrypt JWT
  const payload = await decrypt(token)
  if (!payload || !payload.sessionId) return null

  // 2. Check if session exists in DB
  const dbSession = await prisma.session.findUnique({
    where: { id: payload.sessionId },
    include: { user: true },
  })

  // 3. If not in DB or expired = invalid
  if (!dbSession || dbSession.expiresAt < new Date()) {
    // Delete invalid cookie
    const cookieStore = await cookies()
    cookieStore.delete('session')
    return null
  }

  return {
    ...payload,
    user: {
      id: dbSession.user.id,
      email: dbSession.user.email,
      role: dbSession.user.role,
    },
  }
}

// Delete session
export async function deleteSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (token) {
    const payload = await decrypt(token)

    // Delete session from DB
    if (payload?.sessionId) {
      await prisma.session.delete({
        where: { id: payload.sessionId },
      }).catch(() => {
        // Ignore error if session already deleted
      })
    }
  }

  // Delete cookie
  cookieStore.delete('session')
}

// Delete all sessions for a user
export async function deleteAllUserSessions(userId: number) {
  await prisma.session.deleteMany({
    where: { userId },
  })
}