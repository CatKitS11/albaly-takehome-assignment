import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createSession } from '@/lib/session'
import { LoginFormSchema } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 1. Validate input
    const validatedFields = LoginFormSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid fields', details: validatedFields.error.flatten().fieldErrors } },
        { status: 400 }
      )
    }

    const { email, password } = validatedFields.data

    // 2. Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } },
        { status: 401 }
      )
    }

    // 3. Verify password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash)
    if (!passwordMatch) {
      return NextResponse.json(
        { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } },
        { status: 401 }
      )
    }

    // 4. Create session
    const { token } = await createSession(user.id, user.role)

    // 5. Create activity log for login
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        status: 'SUCCESS',
        description: `${user.role === 'ADMIN' ? 'Admin' : user.role === 'VIEWER' ? 'Viewer' : user.email.split('@')[0]} logged in`,
      },
    })

    // 6. Return success with user info
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      token, // JWT token (also set in cookie)
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}