import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react"

import {
    getTopProducts,
    getRegionalPerformance,
    getFunnelData,
  } from "@/lib/queries"

const churnData = [
    { week: 1, rate: 3, highlight: false },
    { week: 2, rate: 5, highlight: false },
    { week: 3, rate: 17, highlight: true },
    { week: 4, rate: 8, highlight: false },
]

export default async function InsightPage() {
    const [topProducts, regionalData, funnelData] = await Promise.all([
        getTopProducts(),
        getRegionalPerformance(),
        getFunnelData(),
    ])

    const maxProductSales = Math.max(...topProducts.map((p) => p.sales))
    const maxRegionalSales = Math.max(...regionalData.map((r) => r.sales))
    const maxFunnelCount = Math.max(...funnelData.map((f) => f.count))

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
                                Product A outperformed by 23% this month.
                            </p>
                        </div>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                            <IconTrendingUp size={12} className="mr-1" />
                            23%
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
                                Week 3 saw a 17% increase in user churn.
                            </p>
                        </div>
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                            <IconTrendingUp size={12} className="mr-1" />
                            17%
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {churnData.map((item) => (
                                <div key={item.week} className="flex items-center gap-3">
                                    <div
                                        className={`w-2 h-2 rounded-full ${item.highlight ? "bg-orange-500" : "bg-gray-300"
                                            }`}
                                    />
                                    <span
                                        className={`text-sm ${item.highlight
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
                                APAC region showing strongest growth this quarter.
                            </p>
                        </div>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                            <IconTrendingUp size={12} className="mr-1" />
                            8%
                        </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {regionalData.map((item) => (
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
                                Checkout to purchase conversion decreased by 5%.
                            </p>
                        </div>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                            <IconTrendingUp size={12} className="mr-1" />
                            5%
                        </Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {funnelData.map((item) => (
                            <div key={item.stage} className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <span
                                        className={`text-xs font-medium px-2 py-0.5 rounded ${item.color === "bg-blue-500"
                                            ? "bg-blue-100 text-blue-700"
                                            : item.color === "bg-yellow-500"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-green-100 text-green-700"
                                            }`}
                                    >
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