'use server'

import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createSession, deleteSession, verifySession } from '@/lib/session'
import { LoginFormSchema } from '@/lib/types'
import { redirect } from 'next/navigation'
export async function login(prevState: unknown, formData: FormData) {
  // 1. Validate input
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return { error: 'Invalid fields', details: validatedFields.error.flatten().fieldErrors }
  }

  const { email, password } = validatedFields.data

  // 2. Find user
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return { error: 'Invalid email or password' }
  }

  // 3. Verify password
  const passwordMatch = await bcrypt.compare(password, user.passwordHash)
  if (!passwordMatch) {
    return { error: 'Invalid email or password' }
  }

  // 4. Create session
  await createSession(user.id, user.role)

  // 5. Create activity log for login
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      status: 'SUCCESS',
      description: `${user.role === 'ADMIN' ? 'Admin' : user.role === 'VIEWER' ? 'Viewer' : user.email.split('@')[0]} logged in`,
    },
  })

  // 6. Redirect (or return success for API)
  redirect('/')
}

export async function logout() {
  // Try to get current session before deleting, so we know which user logged out.
  const session = await verifySession().catch(() => null)

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

  redirect('/login')
}