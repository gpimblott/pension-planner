"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";

interface ChartData {
  year: number;
  value: number;
  contributions: number;
  growth: number;
}

interface PensionChartProps {
  data: ChartData[];
}

export default function PensionChart({ data }: PensionChartProps) {
  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorContributions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="year" 
            label={{ value: "Age", position: "insideBottom", offset: -5 }}
            tick={{ fill: "#6b7280", fontSize: 14 }}
            stroke="#9ca3af"
          />
          <YAxis 
            label={{ value: "Value (£)", angle: -90, position: "insideLeft" }}
            tick={{ fill: "#6b7280", fontSize: 14 }}
            stroke="#9ca3af"
            tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "white", 
              borderRadius: "12px", 
              border: "2px solid #e5e7eb",
              padding: "12px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            }}
            formatter={(value: number) => [`£${value.toLocaleString()}`, ""]}
            labelFormatter={(label) => `Age: ${label}`}
          />
          <Legend 
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="circle"
          />
          <Area 
            type="monotone" 
            dataKey="contributions" 
            stroke="#10b981" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorContributions)" 
            name="Total Contributions"
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#3b82f6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorValue)" 
            name="Projected Value"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
