"use client"
import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { ArrowUp, ArrowDown } from "lucide-react"

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
  // Filter data: fixed 90 days window for chart only (metrics are MoM). // EDIT
  const filteredData = React.useMemo(() => {
    if (!data.length) return []

    const dates = data.map((d) => new Date(d.date).getTime())
    const referenceDate = new Date(Math.max(...dates))

    const daysToSubtract = 90
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)

    return data.filter((item) => new Date(item.date) >= startDate)
  }, [data])

  const { totalRevenue, percentChange, currentMonthLabel } = React.useMemo(() => {
    if (!data.length) {
      return { totalRevenue: 0, percentChange: 0, currentMonthLabel: "Current Month" }
    }

    const dates = data.map((d) => new Date(d.date))
    const referenceDate = new Date(Math.max(...dates.map((d) => d.getTime())))

    const currentMonthStart = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      1
    )
    const nextMonthStart = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth() + 1,
      1
    )
    const previousMonthStart = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth() - 1,
      1
    )

    const currentMonthTotal = data.reduce((sum, item) => {
      const date = new Date(item.date)
      if (date >= currentMonthStart && date < nextMonthStart) {
        return sum + item.amount
      }
      return sum
    }, 0)

    const previousMonthTotal = data.reduce((sum, item) => {
      const date = new Date(item.date)
      if (date >= previousMonthStart && date < currentMonthStart) {
        return sum + item.amount
      }
      return sum
    }, 0)

    const change =
      previousMonthTotal > 0
        ? Math.round(((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100)
        : 0

    const monthLabel = referenceDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })

    return {
      totalRevenue: currentMonthTotal,
      percentChange: change,
      currentMonthLabel: monthLabel,
    }
  }, [data])

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="text-lg font-bold">{title}</CardTitle>
        <CardAction>
          <p className="text-xs text-muted-foreground">
            Current month revenue vs previous month
          </p>
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
            {currentMonthLabel} Revenue:{" "}
            <span className="font-semibold text-foreground">
              $ {totalRevenue.toLocaleString()}
            </span>
          </p>
          <p className={`text-sm font-medium ${percentChange >= 0 ? "text-green-600" : "text-red-600"}`}>
            {percentChange >= 0 ? <ArrowUp size={12} className="mr-1 inline-block" /> : <ArrowDown size={12} className="mr-1 inline-block" />} {Math.abs(percentChange)}% vs previous month
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
