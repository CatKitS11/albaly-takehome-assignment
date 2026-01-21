import { z } from 'zod'

export const LoginFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
  password: z.string().min(1, { message: 'Password is required.' }),
})

export type SessionPayload = {
  sessionId: number
  userId: number
  role: string
  expiresAt: Date
}