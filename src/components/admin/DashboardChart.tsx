"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { formatPrice } from "@/lib/utils";

type ChartData = {
  date: string;
  revenue: number;
  bookings: number;
};

export function DashboardChart({ data }: { data: ChartData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-white/5 bg-truf-card text-white/50">
        No data available for the last 7 days.
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full rounded-2xl border border-white/5 bg-truf-card p-6">
      <h3 className="mb-6 text-lg font-bold text-white">Revenue (Last 7 Days)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            stroke="#ffffff40" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#ffffff40" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `₹${val / 100}`}
          />
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#171717', borderColor: '#ffffff10', borderRadius: '8px' }}
            itemStyle={{ color: '#84cc16' }}
            formatter={(value: unknown, name: unknown) => {
              const num = typeof value === 'number' ? value : 0;
              if (name === "revenue") return [formatPrice(num), "Revenue"];
              return [num, "Bookings"];
            }}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#84cc16" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
