import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"

import { RecentActivity } from "@/components/recent-activity"
import {
  getSalesChartData,
  getDashboardStats,
  getRecentActivity,
} from "@/lib/queries"

export default async function Page() {
  // Fetch data on server (parallel)
  const [chartData, stats, activities] = await Promise.all([
    getSalesChartData(),
    getDashboardStats(),
    getRecentActivity(),
  ])

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <h1 className="text-2xl font-bold px-4 md:px-6">Overview</h1>
          
          <SectionCards stats={stats} />

          <div className="grid grid-cols-1 px-4 gap-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-2">
            
            <RecentActivity activities={activities} />

            
            <ChartAreaInteractive data={chartData} />
          </div>
        </div>
      </div>
    </div>
  )
}
