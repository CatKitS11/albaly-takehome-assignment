import { z } from 'zod'

// ==================== Auth ====================
export const LoginFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
  password: z.string().min(1, { message: 'Password is required.' }),
})

export type LoginForm = z.infer<typeof LoginFormSchema>

export type SessionPayload = {
  sessionId: number
  userId: number
  role: string
  expiresAt: Date
}

// ==================== Dashboard Stats ====================
export const DashboardStatsSchema = z.object({
  totalSales: z.number(),
  salesGrowth: z.number(),
  activeCustomers: z.number(),
  customerGrowth: z.number(),
  inventoryCount: z.number(),
  inventoryChange: z.number(),
})

export type DashboardStats = z.infer<typeof DashboardStatsSchema>

// ==================== Activity ====================
export const ActivityItemSchema = z.object({
  id: z.number(),
  status: z.string(),
  description: z.string(),
  createdAt: z.string(),
  userName: z.string(),
})

export type ActivityItem = z.infer<typeof ActivityItemSchema>

// ==================== Chart Data ====================
export const SalesChartDataSchema = z.object({
  date: z.string(),
  amount: z.number(),
  quantity: z.number(),
})

export type SalesChartData = z.infer<typeof SalesChartDataSchema>

// ==================== Overview Response ====================
export const OverviewResponseSchema = z.object({
  kpiCards: DashboardStatsSchema,
  activityFeed: z.array(ActivityItemSchema),
  monthlyPerformance: z.array(SalesChartDataSchema),
})

export type OverviewResponse = z.infer<typeof OverviewResponseSchema>

// ==================== Insights Response ====================
export const TopProductSchema = z.object({
  name: z.string(),
  sales: z.number(),
})

export const CustomerDropOffSchema = z.object({
  week: z.number(),
  rate: z.number(),
  highlight: z.boolean(),
})

export const RegionalPerformanceSchema = z.object({
  region: z.string(),
  sales: z.number(),
  color: z.string(),
})

export const ConversionFunnelSchema = z.object({
  stage: z.string(),
  count: z.number(),
  color: z.string(),
})

export const InsightsResponseSchema = z.object({
  topProducts: z.array(TopProductSchema),
  customerDropOff: z.array(CustomerDropOffSchema),
  regionalPerformance: z.array(RegionalPerformanceSchema),
  conversionFunnel: z.array(ConversionFunnelSchema),
})

export type TopProduct = z.infer<typeof TopProductSchema>
export type CustomerDropOff = z.infer<typeof CustomerDropOffSchema>
export type RegionalPerformance = z.infer<typeof RegionalPerformanceSchema>
export type ConversionFunnel = z.infer<typeof ConversionFunnelSchema>
export type InsightsResponse = z.infer<typeof InsightsResponseSchema>

// ==================== API Error ====================
export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
})

export type ApiError = z.infer<typeof ApiErrorSchema>