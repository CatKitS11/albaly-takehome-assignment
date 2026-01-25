import 'server-only'

/**
 * check and export environment variables that are required
 * if not, throw error immediately when importing this module
 */

function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name] || defaultValue
  
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}\n` +
      `Please set ${name} in your .env file.`
    )
  }
  
  return value
}

// Required environment variables
export const env = {
  // Database
  DATABASE_URL: getEnvVar('DATABASE_URL'),
  
  // Session
  SESSION_SECRET: getEnvVar('SESSION_SECRET'),
  
  // Optional
  NEXT_PUBLIC_APP_URL: getEnvVar('NEXT_PUBLIC_APP_URL', ''),
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
} as const