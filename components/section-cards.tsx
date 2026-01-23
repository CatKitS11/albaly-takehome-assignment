import {
  IconTrendingUp,
  IconTrendingDown,
  IconPackage,
  IconUsers,
  IconChartBar,
} from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import type { DashboardStats } from "@/lib/types"

interface SectionCardsProps {
  stats: DashboardStats
}

export function SectionCards({ stats }: SectionCardsProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      {/* Total Sales */}
      <Card className="@container/card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Sales
          </CardTitle>
          <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center text-blue-600">
            <IconChartBar size={18} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">
              {stats.totalSales.toLocaleString()}
            </div>
            <Badge
              variant="secondary"
              className={
                stats.salesGrowth >= 0
                  ? "bg-green-100 text-green-700 hover:bg-green-100"
                  : "bg-red-100 text-red-700 hover:bg-red-100"
              }
            >
              {stats.salesGrowth >= 0 ? (
                <IconTrendingUp size={12} className="mr-1" />
              ) : (
                <IconTrendingDown size={12} className="mr-1" />
              )}
              {Math.abs(stats.salesGrowth)}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Active Customers */}
      <Card className="@container/card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Active Customers
          </CardTitle>
          <div className="h-8 w-8 rounded bg-purple-100 flex items-center justify-center text-purple-600">
            <IconUsers size={18} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">{stats.activeCustomers}</div>
            <Badge
              variant="secondary"
              className={
                stats.customerGrowth >= 0
                  ? "bg-green-100 text-green-700 hover:bg-green-100"
                  : "bg-red-100 text-red-700 hover:bg-red-100"
              }
            >
              {stats.customerGrowth >= 0 ? (
                <IconTrendingUp size={12} className="mr-1" />
              ) : (
                <IconTrendingDown size={12} className="mr-1" />
              )}
              {Math.abs(stats.customerGrowth)}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Status */}
      <Card className="@container/card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Inventory Status
          </CardTitle>
          <div className="h-8 w-8 rounded bg-green-100 flex items-center justify-center text-green-600">
            <IconPackage size={18} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">
              {stats.inventoryCount.toLocaleString()}
            </div>
            <Badge
              variant="secondary"
              className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
            >
              <IconTrendingDown size={12} className="mr-1" />
              {Math.abs(stats.inventoryChange)}%
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
