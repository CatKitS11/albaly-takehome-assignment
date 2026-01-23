'use server'

import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createSession, deleteSession } from '@/lib/session'
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

  // 5. Redirect (or return success for API)
  redirect('/')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}