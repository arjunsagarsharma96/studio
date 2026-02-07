"use client";

import React, { useMemo } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
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
  const combinedData = useMemo(() => {
    // We want a single data stream for the AreaChart
    // Historical points get 'price', Forecast points get 'forecastPrice'
    // To connect the lines, the first forecast point should overlap with the last historical point if possible
    
    const hData = historicalData.map(d => ({ 
      date: d.date, 
      price: d.price,
      type: 'historical' 
    }));

    const fData = forecastData.map(d => ({ 
      date: d.date, 
      forecastPrice: d.price,
      type: 'forecast' 
    }));

    // If we have forecast data, we need the last historical point to also have forecastPrice 
    // so the line is continuous
    if (fData.length > 0 && hData.length > 0) {
      const lastH = hData[hData.length - 1];
      fData.unshift({
        date: lastH.date,
        forecastPrice: lastH.price,
        type: 'forecast'
      });
    }

    return [...hData, ...fData];
  }, [historicalData, forecastData]);

  return (
    <div className="h-[400px] w-full bg-card/10 rounded-xl p-2 border border-border/50">
      <ChartContainer
        config={{
          price: {
            label: "Historical (XAU/USD)",
            color: "hsl(var(--primary))",
          },
          forecastPrice: {
            label: "AI Forecast",
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
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            minTickGap={60}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            domain={['auto', 'auto']}
            tickFormatter={(value) => `$${value}`}
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
          <Area 
            type="monotone" 
            dataKey="forecastPrice" 
            stroke="hsl(var(--accent))" 
            strokeWidth={2}
            strokeDasharray="5 5"
            fillOpacity={0.4} 
            fill="url(#colorForecast)" 
            isAnimationActive={true}
          />
          {historicalData.length > 0 && (
            <ReferenceLine 
              x={historicalData[historicalData.length - 1].date} 
              stroke="hsl(var(--muted-foreground))" 
              strokeDasharray="3 3" 
              label={{ position: 'top', value: 'Present', fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} 
            />
          )}
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
