import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import {
  getTopProducts,
  getRegionalPerformance,
  getFunnelData,
  getCustomerDropOff,
} from '@/lib/queries'

export async function GET() {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const [topProducts, regionalData, funnelData, dropOffData] = await Promise.all([
      getTopProducts(),
      getRegionalPerformance(),
      getFunnelData(),
      getCustomerDropOff(),
    ])

    return NextResponse.json({
      topProducts,
      customerDropOff: dropOffData,
      regionalPerformance: regionalData,
      conversionFunnel: funnelData,
    })
  } catch (error) {
    console.error('Insights API error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}