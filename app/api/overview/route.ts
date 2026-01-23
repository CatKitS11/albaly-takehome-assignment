import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import {
  getSalesChartData,
  getDashboardStats,
  getRecentActivity,
} from '@/lib/queries'

export async function GET() {
  try {
    // 1. check session (protected route)
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    // 2. get all data at once
    const [chartData, stats, activities] = await Promise.all([
      getSalesChartData(),
      getDashboardStats(),
      getRecentActivity(session.user.role, session.user.id), // EDIT: role-based activity visibility
    ])

    // 3. return response
    return NextResponse.json({
      kpiCards: stats,
      activityFeed: activities,
      monthlyPerformance: chartData,
    })
  } catch (error) {
    console.error('Overview API error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}