"use client"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"

import { RecentActivity } from "@/components/recent-activity"

import { useOverview } from "@/hooks/use-overview"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"

export default function Page() {
  const { data, loading, error } = useOverview()

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-500 underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <h1 className="text-2xl font-bold px-4 md:px-6">Overview</h1>

          <SectionCards stats={data.kpiCards} />

          <div className="grid grid-cols-1 px-4 gap-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-2">
            <RecentActivity activities={data.activityFeed} />
            <ChartAreaInteractive data={data.monthlyPerformance} />
          </div>
        </div>
      </div>
    </div>
  )
}
