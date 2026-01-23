"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { useInsights } from "@/hooks/use-insights"

export default function InsightPage() {
  const { data, loading, error } = useInsights()

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    )
  }

  if (!data) return null

  const { topProducts, customerDropOff, regionalPerformance, conversionFunnel } = data
  
  const maxProductSales = Math.max(...topProducts.map((p) => p.sales))
  const maxRegionalSales = Math.max(...regionalPerformance.map((r) => r.sales))
  const maxFunnelCount = Math.max(...conversionFunnel.map((f) => f.count))

  // Calculate dynamic values for badges and descriptions
  const topProduct = topProducts[0]
  const secondProduct = topProducts[1]
  const topProductGrowth = secondProduct 
    ? Math.round(((topProduct?.sales - secondProduct?.sales) / secondProduct?.sales) * 100)
    : 0

  const highestChurnWeek = customerDropOff.find((w) => w.highlight)
  const highestChurnRate = highestChurnWeek?.rate ?? 0

  const topRegion = regionalPerformance.reduce((max, r) => r.sales > max.sales ? r : max, regionalPerformance[0])
  const totalRegionalSales = regionalPerformance.reduce((sum, r) => sum + r.sales, 0)
  const topRegionPercent = totalRegionalSales > 0 
    ? Math.round((topRegion?.sales / totalRegionalSales) * 100)
    : 0

  const funnelStart = conversionFunnel[0]?.count ?? 0
  const funnelEnd = conversionFunnel[conversionFunnel.length - 1]?.count ?? 0
  const conversionRate = funnelStart > 0 
    ? Math.round((funnelEnd / funnelStart) * 100)
    : 0

  // Stage label colors for funnel
  const getStageLabelColor = (stage: string) => {
    switch (stage) {
      case "VISITORS":
      case "PRODUCT VIEWS":
      case "ADD TO CART":
        return "bg-blue-100 text-blue-700"
      case "PURCHASE":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-muted"
    }
  }

  // Badge color helper: + = green, -1 to -10 = yellow, < -10 = red
  const getBadgeColor = (value: number) => {
    if (value >= 0) {
      return "bg-green-100 text-green-700 hover:bg-green-100"
    } else if (value >= -10) {
      return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
    } else {
      return "bg-red-100 text-red-700 hover:bg-red-100"
    }
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <h1 className="text-2xl font-bold px-4 md:px-6">Insights</h1>

      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2">
        {/* Top-Selling Product */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">
                Top-Selling Product
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {topProduct?.name} outperformed by {topProductGrowth}% this month.
              </p>
            </div>
            <Badge className={getBadgeColor(topProductGrowth)}>
              {topProductGrowth >= 0 ? (
                <IconTrendingUp size={12} className="mr-1" />
              ) : (
                <IconTrendingDown size={12} className="mr-1" />
              )}
              {Math.abs(topProductGrowth)}%
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {topProducts.map((product) => (
              <div key={product.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{product.name}</span>
                  <span className="font-medium">
                    ${product.sales.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${(product.sales / maxProductSales) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Customer Drop-Off */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">
                Customer Drop-Off
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Week {highestChurnWeek?.week} saw a {highestChurnRate}% increase in user churn.
              </p>
            </div>
            <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
              <IconTrendingUp size={12} className="mr-1" />
              {highestChurnRate}%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {customerDropOff.map((item) => (
                <div key={item.week} className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.highlight ? "bg-orange-500" : "bg-blue-500"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      item.highlight
                        ? "text-orange-600 font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    Week {item.week}: {item.rate}% churn rate
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Regional Performance */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">
                Regional Performance
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {topRegion?.region} region showing strongest growth this quarter.
              </p>
            </div>
            <Badge className={getBadgeColor(topRegionPercent)}>
              {topRegionPercent >= 0 ? (
                <IconTrendingUp size={12} className="mr-1" />
              ) : (
                <IconTrendingDown size={12} className="mr-1" />
              )}
              {Math.abs(topRegionPercent)}%
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {regionalPerformance.map((item) => (
              <div key={item.region} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.region}</span>
                  <span className="font-medium">
                    ${item.sales.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full`}
                    style={{
                      width: `${(item.sales / maxRegionalSales) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">
                Conversion Funnel
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Checkout to purchase conversion rate is {conversionRate}%.
              </p>
            </div>
            <Badge className={getBadgeColor(conversionRate)}>
              {conversionRate >= 0 ? (
                <IconTrendingUp size={12} className="mr-1" />
              ) : (
                <IconTrendingDown size={12} className="mr-1" />
              )}
              {Math.abs(conversionRate)}%
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {conversionFunnel.map((item) => (
              <div key={item.stage} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStageLabelColor(item.stage)}`}>
                    {item.stage}
                  </span>
                  <span className="text-sm font-medium">
                    {item.count.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full`}
                    style={{
                      width: `${(item.count / maxFunnelCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}