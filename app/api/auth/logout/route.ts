import { NextResponse } from 'next/server'
import { deleteSession, verifySession } from '@/lib/session' // EDIT
import prisma from '@/lib/prisma' // EDIT

export async function POST() {
  try {
    // Get current session before deleting so we can log which user logged out. // EDIT
    const session = await verifySession().catch(() => null) // EDIT

    await deleteSession()

    if (session) {
      await prisma.activityLog.create({
        data: {
          userId: session.userId,
          status: 'SUCCESS',
          description: `${session.user.role === 'ADMIN' ? 'Admin' : session.user.role === 'VIEWER' ? 'Viewer' : session.user.email.split('@')[0]} logged out`,
        },
      })
    }

    return NextResponse.json({
      message: 'Logged out successfully',
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}