"use client"

import * as React from "react"
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

export interface BarChartDataPoint {
  date?: string
  periode?: string
  label: string
  value: number
}

interface BarChartProps {
  data: BarChartDataPoint[]
  title?: string
  dataKey?: string
  color?: string
}

export function BarChart({
  data,
  title,
  dataKey = "value",
  color = "#3B82F6",
}: BarChartProps) {
  return (
    <div className="w-full h-full space-y-2">
      {title && (
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <RechartsBarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="label"
            className="text-xs"
            tick={{ fill: "currentColor" }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: "currentColor" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Legend />
          <Bar
            dataKey={dataKey}
            fill={color}
            radius={[4, 4, 0, 0]}
            className="hover:opacity-80 transition-opacity"
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

