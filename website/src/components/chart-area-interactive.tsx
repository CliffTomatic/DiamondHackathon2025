"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
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

const chartData = [
  { date: "2024-04-01", purchases: 222, savings: 150 },
  { date: "2024-04-02", purchases: 97, savings: 180 },
  { date: "2024-04-03", purchases: 167, savings: 120 },
  { date: "2024-04-04", purchases: 242, savings: 260 },
  { date: "2024-04-05", purchases: 373, savings: 290 },
  { date: "2024-04-06", purchases: 301, savings: 340 },
  { date: "2024-04-07", purchases: 245, savings: 180 },
  { date: "2024-04-08", purchases: 409, savings: 320 },
  { date: "2024-04-09", purchases: 59, savings: 110 },
  { date: "2024-04-10", purchases: 261, savings: 190 },
  { date: "2024-04-11", purchases: 327, savings: 350 },
  { date: "2024-04-12", purchases: 292, savings: 210 },
  { date: "2024-04-13", purchases: 342, savings: 380 },
  { date: "2024-04-14", purchases: 137, savings: 220 },
  { date: "2024-04-15", purchases: 120, savings: 170 },
  { date: "2024-04-16", purchases: 138, savings: 190 },
  { date: "2024-04-17", purchases: 446, savings: 360 },
  { date: "2024-04-18", purchases: 364, savings: 410 },
  { date: "2024-04-19", purchases: 243, savings: 180 },
  { date: "2024-04-20", purchases: 89, savings: 150 },
  { date: "2024-04-21", purchases: 137, savings: 200 },
  { date: "2024-04-22", purchases: 224, savings: 170 },
  { date: "2024-04-23", purchases: 138, savings: 230 },
  { date: "2024-04-24", purchases: 387, savings: 290 },
  { date: "2024-04-25", purchases: 215, savings: 250 },
  { date: "2024-04-26", purchases: 75, savings: 130 },
  { date: "2024-04-27", purchases: 383, savings: 420 },
  { date: "2024-04-28", purchases: 122, savings: 180 },
  { date: "2024-04-29", purchases: 315, savings: 240 },
  { date: "2024-04-30", purchases: 454, savings: 380 },
  { date: "2024-05-01", purchases: 165, savings: 220 },
  { date: "2024-05-02", purchases: 293, savings: 310 },
  { date: "2024-05-03", purchases: 247, savings: 190 },
  { date: "2024-05-04", purchases: 385, savings: 420 },
  { date: "2024-05-05", purchases: 481, savings: 390 },
  { date: "2024-05-06", purchases: 498, savings: 520 },
  { date: "2024-05-07", purchases: 388, savings: 300 },
  { date: "2024-05-08", purchases: 149, savings: 210 },
  { date: "2024-05-09", purchases: 227, savings: 180 },
  { date: "2024-05-10", purchases: 293, savings: 330 },
  { date: "2024-05-11", purchases: 335, savings: 270 },
  { date: "2024-05-12", purchases: 197, savings: 240 },
  { date: "2024-05-13", purchases: 197, savings: 160 },
  { date: "2024-05-14", purchases: 448, savings: 490 },
  { date: "2024-05-15", purchases: 473, savings: 380 },
  { date: "2024-05-16", purchases: 338, savings: 400 },
  { date: "2024-05-17", purchases: 499, savings: 420 },
  { date: "2024-05-18", purchases: 315, savings: 350 },
  { date: "2024-05-19", purchases: 235, savings: 180 },
  { date: "2024-05-20", purchases: 177, savings: 230 },
  { date: "2024-05-21", purchases: 82, savings: 140 },
  { date: "2024-05-22", purchases: 81, savings: 120 },
  { date: "2024-05-23", purchases: 252, savings: 290 },
  { date: "2024-05-24", purchases: 294, savings: 220 },
  { date: "2024-05-25", purchases: 201, savings: 250 },
  { date: "2024-05-26", purchases: 213, savings: 170 },
  { date: "2024-05-27", purchases: 420, savings: 460 },
  { date: "2024-05-28", purchases: 233, savings: 190 },
  { date: "2024-05-29", purchases: 78, savings: 130 },
  { date: "2024-05-30", purchases: 340, savings: 280 },
  { date: "2024-05-31", purchases: 178, savings: 230 },
  { date: "2024-06-01", purchases: 178, savings: 200 },
  { date: "2024-06-02", purchases: 470, savings: 410 },
  { date: "2024-06-03", purchases: 103, savings: 160 },
  { date: "2024-06-04", purchases: 439, savings: 380 },
  { date: "2024-06-05", purchases: 88, savings: 140 },
  { date: "2024-06-06", purchases: 294, savings: 250 },
  { date: "2024-06-07", purchases: 323, savings: 370 },
  { date: "2024-06-08", purchases: 385, savings: 320 },
  { date: "2024-06-09", purchases: 438, savings: 480 },
  { date: "2024-06-10", purchases: 155, savings: 200 },
  { date: "2024-06-11", purchases: 92, savings: 150 },
  { date: "2024-06-12", purchases: 492, savings: 420 },
  { date: "2024-06-13", purchases: 81, savings: 130 },
  { date: "2024-06-14", purchases: 426, savings: 380 },
  { date: "2024-06-15", purchases: 307, savings: 350 },
  { date: "2024-06-16", purchases: 371, savings: 310 },
  { date: "2024-06-17", purchases: 475, savings: 520 },
  { date: "2024-06-18", purchases: 107, savings: 170 },
  { date: "2024-06-19", purchases: 341, savings: 290 },
  { date: "2024-06-20", purchases: 408, savings: 450 },
  { date: "2024-06-21", purchases: 169, savings: 210 },
  { date: "2024-06-22", purchases: 317, savings: 270 },
  { date: "2024-06-23", purchases: 480, savings: 530 },
  { date: "2024-06-24", purchases: 132, savings: 180 },
  { date: "2024-06-25", purchases: 141, savings: 190 },
  { date: "2024-06-26", purchases: 434, savings: 380 },
  { date: "2024-06-27", purchases: 448, savings: 490 },
  { date: "2024-06-28", purchases: 149, savings: 200 },
  { date: "2024-06-29", purchases: 103, savings: 160 },
  { date: "2024-06-30", purchases: 446, savings: 400 },
]

const chartConfig = {
  amount: {
    label: "Amount",
  },
  purchases: {
    label: "Purchases ($)",
    color: "green", // Changed from var(--primary) to green
  },
  savings: {
    label: "Savings ($)",
    color: "green", // Changed from var(--primary) to green
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Spending and Purchases</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total for the last 3 months
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
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
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="green" // Changed from var(--color-desktop) to green
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="green" // Changed from var(--color-desktop) to green
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="green" // Changed from var(--color-mobile) to green
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="green" // Changed from var(--color-mobile) to green
                  stopOpacity={0.1}
                />
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
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="savings"
              type="natural"
              fill="url(#fillMobile)"
              stroke="green" // Changed from var(--color-mobile) to green
              stackId="a"
            />
            <Area
              dataKey="purchases"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="green" // Changed from var(--color-desktop) to green
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}