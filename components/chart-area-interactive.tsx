"use client"
import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { ArrowUp, ArrowDown } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export const description = "An interactive area chart"

interface ChartDataItem {
  date: string
  amount: number
  quantity: number
}

interface ChartAreaInteractiveProps {
  data: ChartDataItem[]
  title?: string
}

const chartConfig = {
  amount: {
    label: "Amount ($)",
    color: "var(--primary)",
  },
  quantity: {
    label: "Quantity",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive({
  data,
  title = "Monthly Performance",
}: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) setTimeRange("7d")
  }, [isMobile])



  // Filter data based on timeRange
  const filteredData = React.useMemo(() => {
    if (!data.length) return []

    // ใช้วันล่าสุดใน data เป็น reference
    const dates = data.map((d) => new Date(d.date).getTime())
    const referenceDate = new Date(Math.max(...dates))

    let daysToSubtract = 90
    if (timeRange === "30d") daysToSubtract = 30
    else if (timeRange === "7d") daysToSubtract = 7

    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)

    return data.filter((item) => new Date(item.date) >= startDate)
  }, [data, timeRange])

  // คำนวณใน useMemo
  const { totalRevenue, percentChange } = React.useMemo(() => {
    if (!data.length) return { totalRevenue: 0, percentChange: 0 }

    // หาวันล่าสุดใน data
    const dates = data.map((d) => new Date(d.date).getTime())
    const referenceDate = new Date(Math.max(...dates))

    let daysToSubtract = 90
    if (timeRange === "30d") daysToSubtract = 30
    else if (timeRange === "7d") daysToSubtract = 7

    // Current period
    const currentStart = new Date(referenceDate)
    currentStart.setDate(currentStart.getDate() - daysToSubtract)

    // Previous period (same duration before current)
    const previousStart = new Date(currentStart)
    previousStart.setDate(previousStart.getDate() - daysToSubtract)

    // Filter data for each period
    const currentPeriod = data.filter((item) => {
      const d = new Date(item.date)
      return d >= currentStart && d <= referenceDate
    })

    const previousPeriod = data.filter((item) => {
      const d = new Date(item.date)
      return d >= previousStart && d < currentStart
    })

    // Sum amounts
    const currentTotal = currentPeriod.reduce((sum, item) => sum + item.amount, 0)
    const previousTotal = previousPeriod.reduce((sum, item) => sum + item.amount, 0)

    // Calculate % change
    const change = previousTotal > 0
      ? Math.round(((currentTotal - previousTotal) / previousTotal) * 100)
      : 0

    return { totalRevenue: currentTotal, percentChange: change }
  }, [data, timeRange])

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="text-lg font-bold">{title}</CardTitle>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">Last 3 months</SelectItem>
              <SelectItem value="30d" className="rounded-lg">Last 30 days</SelectItem>
              <SelectItem value="7d" className="rounded-lg">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-amount)" stopOpacity={1.0} />
                <stop offset="95%" stopColor="var(--color-amount)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="amount"
              type="natural"
              fill="url(#fillAmount)"
              stroke="var(--color-amount)"
            />
          </AreaChart>
        </ChartContainer>
        <div className="flex justify-between items-center px-2 pt-4 sm:px-6">
          <p className="text-sm text-muted-foreground">
            Total Revenue: <span className="font-semibold text-foreground">
              $ {totalRevenue.toLocaleString()}
            </span>
          </p>
          <p className={`text-sm font-medium ${percentChange >= 0 ? "text-green-600" : "text-red-600"}`}>
            {percentChange >= 0 ? <ArrowUp size={12} className="mr-1 inline-block" /> : <ArrowDown size={12} className="mr-1 inline-block" />} {Math.abs(percentChange)}% vs last period
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
