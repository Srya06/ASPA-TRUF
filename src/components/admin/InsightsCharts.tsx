"use client";

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge-2';
import { ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Line, LineChart, XAxis, YAxis, PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { cn, formatPrice } from '@/lib/utils';
import { TrendData, SportPopularity } from "@/lib/queries/insights";

const COLORS = ["#00FF00", "#1E3A8A", "#F59E0B", "#EF4444", "#8B5CF6"];

export function InsightsCharts({ 
  revenueData, 
  popularityData 
}: { 
  revenueData: TrendData[],
  popularityData: SportPopularity[]
}) {
  const [selectedMetric, setSelectedMetric] = useState<string>('revenue');

  // Calculate totals and changes for the badges
  const calculateMetrics = () => {
    if (revenueData.length === 0) return [];
    
    // Split the data into current period (second half) and previous period (first half) to calculate trend
    const mid = Math.floor(revenueData.length / 2);
    const prevData = revenueData.slice(0, mid);
    const currData = revenueData.slice(mid);
    
    const sum = (data: TrendData[], key: keyof TrendData) => 
      data.reduce((acc, curr) => acc + (curr[key] as number), 0);

    const formatRupees = (val: number) => `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(val)}`;
    
    return [
      {
        key: 'revenue',
        label: 'Revenue',
        value: sum(currData, 'revenue') || sum(revenueData, 'revenue'),
        previousValue: sum(prevData, 'revenue'),
        format: formatRupees,
      },
      {
        key: 'bookings',
        label: 'Total Bookings',
        value: sum(currData, 'bookings') || sum(revenueData, 'bookings'),
        previousValue: sum(prevData, 'bookings'),
        format: (val: number) => val.toLocaleString(),
      },
      {
        key: 'customers',
        label: 'Unique Customers',
        value: sum(currData, 'customers') || sum(revenueData, 'customers'),
        previousValue: sum(prevData, 'customers'),
        format: (val: number) => val.toLocaleString(),
      },
    ];
  };

  const metrics = calculateMetrics();

  const chartConfig = {
    revenue: {
      label: 'Revenue',
      color: '#00FF00', // truf-lime
    },
    bookings: {
      label: 'Bookings',
      color: '#3b82f6', // blue-500
    },
    customers: {
      label: 'Customers',
      color: '#a855f7', // purple-500
    },
  } satisfies ChartConfig;

  // Custom Tooltip
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      dataKey: string;
      value: number;
      color: string;
    }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const entry = payload[0];
      const metric = metrics.find((m) => m.key === entry.dataKey);

      if (metric) {
        return (
          <div className="rounded-lg border border-white/10 bg-truf-darker p-3 shadow-xl min-w-[120px]">
            <div className="flex items-center gap-2 text-sm text-white">
              <div className="size-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="text-white/50">{metric.label}:</span>
              <span className="font-semibold">{metric.format(entry.value)}</span>
            </div>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      
      {/* Interactive Trend Chart */}
      <div className="xl:col-span-2 rounded-xl border border-white/10 bg-white/5 flex flex-col overflow-hidden">
        {/* Metrics Grid */}
        <div className="grid grid-cols-3 border-b border-white/10 bg-black/20">
          {metrics.map((metric) => {
            let change = 0;
            if (metric.previousValue === 0) {
              if (metric.value > 0) change = 100;
            } else {
              change = ((metric.value - metric.previousValue) / Math.abs(metric.previousValue)) * 100;
            }
            
            // User requested max of 100%
            change = Math.min(100, Math.max(-100, change));
            
            const isPositive = change >= 0;

            return (
              <button
                key={metric.key}
                onClick={() => setSelectedMetric(metric.key)}
                className={cn(
                  'cursor-pointer text-start p-2 md:p-4 border-r border-white/10 last:border-r-0 transition-all hover:bg-white/5 overflow-hidden',
                  selectedMetric === metric.key && 'bg-white/10 shadow-inner'
                )}
              >
                <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-2 gap-1 md:gap-2">
                  <span className="text-xs md:text-sm text-white/50">{metric.label}</span>
                  {revenueData.length > 2 && (
                    <Badge variant={isPositive ? 'success' : 'destructive'} appearance="outline" className="w-fit text-[10px] md:text-xs px-1 md:px-2 py-0">
                      {isPositive ? <ArrowUp className="size-2 md:size-3 mr-0.5 md:mr-1" /> : <ArrowDown className="size-2 md:size-3 mr-0.5 md:mr-1" />}
                      {Math.abs(change).toFixed(1)}%
                    </Badge>
                  )}
                </div>
                <div className="text-lg md:text-xl lg:text-2xl font-bold text-white truncate" title={metric.format(metric.value)}>{metric.format(metric.value)}</div>
              </button>
            );
          })}
        </div>

        {/* Chart Content */}
        <div className="p-6 h-[400px]">
          <ChartContainer
            config={chartConfig}
            className="h-full w-full overflow-visible [&_.recharts-curve.recharts-tooltip-cursor]:stroke-white/20"
          >
            <LineChart
              data={revenueData}
              margin={{ top: 20, right: 20, left: 5, bottom: 20 }}
              style={{ overflow: 'visible' }}
            >
              <defs>
                <pattern id="dotGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="1" fill="#ffffff20" fillOpacity="1" />
                </pattern>
                <filter id="lineShadow" x="-100%" y="-100%" width="300%" height="300%">
                  <feDropShadow
                    dx="0"
                    dy="8"
                    stdDeviation="8"
                    floodColor={chartConfig[selectedMetric as keyof typeof chartConfig]?.color}
                    floodOpacity="0.4"
                  />
                </filter>
                <filter id="dotShadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.8" />
                </filter>
              </defs>

              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#ffffff50' }}
                tickMargin={15}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                  });
                }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#ffffff50' }}
                tickMargin={15}
                tickCount={6}
                tickFormatter={(value) => {
                  const metric = metrics.find((m) => m.key === selectedMetric);
                  return metric ? metric.format(value) : value.toString();
                }}
              />

              <ChartTooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#ffffff30' }} />

              <rect
                x="60px"
                y="-20px"
                width="calc(100% - 75px)"
                height="calc(100% - 10px)"
                fill="url(#dotGrid)"
                style={{ pointerEvents: 'none' }}
              />

              <Line
                type="monotone"
                dataKey={selectedMetric}
                stroke={chartConfig[selectedMetric as keyof typeof chartConfig]?.color}
                strokeWidth={3}
                filter="url(#lineShadow)"
                dot={false}
                activeDot={{
                  r: 6,
                  fill: chartConfig[selectedMetric as keyof typeof chartConfig]?.color,
                  stroke: '#111',
                  strokeWidth: 3,
                  filter: 'url(#dotShadow)',
                }}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </div>

      {/* Popularity Chart (Unchanged Layout but styling matches) */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 flex flex-col">
        <h3 className="text-lg font-bold text-white mb-6">Sport Popularity (All Time)</h3>
        <div className="flex-1 min-h-[300px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={popularityData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {popularityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ color: "#fff", paddingTop: "20px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
