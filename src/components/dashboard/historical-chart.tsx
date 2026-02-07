
"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PricePoint } from "@/lib/historical-data";

interface HistoricalChartProps {
  historicalData: PricePoint[];
  forecastData?: PricePoint[];
}

export function HistoricalChart({ historicalData, forecastData = [] }: HistoricalChartProps) {
  const combinedData = [
    ...historicalData.map(d => ({ ...d, type: "historical" })),
    ...forecastData.map(d => ({ ...d, type: "forecast" }))
  ];

  return (
    <div className="h-[400px] w-full bg-card rounded-xl p-4 border border-border shadow-2xl">
      <ChartContainer
        config={{
          price: {
            label: "Price (XAU/USD)",
            color: "hsl(var(--primary))",
          },
          forecast: {
            label: "Forecast",
            color: "hsl(var(--accent))",
          }
        }}
        className="h-full w-full"
      >
        <AreaChart data={combinedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            minTickGap={60}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            domain={['auto', 'auto']}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            isAnimationActive={true}
          />
          {forecastData.length > 0 && (
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="hsl(var(--accent))" 
              strokeWidth={2}
              strokeDasharray="5 5"
              fillOpacity={0.4} 
              fill="url(#colorForecast)" 
              connectNulls
            />
          )}
          {historicalData.length > 0 && (
            <ReferenceLine x={historicalData[historicalData.length - 1].date} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
          )}
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
