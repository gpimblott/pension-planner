
"use client";

import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, Bar, ComposedChart } from "recharts";
import React from "react";

/**
 * Represents a single data point for the pension chart.
 */
interface ChartData {
    /** The age at this data point. */
    year: number;
    /** The projected value of the pension pot. */
    value: number;
    /** The total contributions made to the pension pot. */
    contributions: number;
    /** The growth of the pension pot. */
    growth: number;
    /** The cumulative withdrawals from the pension pot. */
    withdrawals: number;
    /** The cumulative pension income received. */
    pensionIncome: number;
    /** The amount that can be withdrawn this year. */
    spendingThisYear?: number;
    /** The withdrawal rate for this year. */
    withdrawalRate?: number;
}

/**
 * Represents the props for the PensionChart component.
 */
interface PensionChartProps {
    /** The data to display in the chart. */
    data: ChartData[];
}

function formatCurrency(n?: number) {
    if (n === undefined || n === null || isNaN(n)) return "-";
    return `£${Math.round(n).toLocaleString('en-GB')}`;
}

function formatPct(p?: number) {
    if (p === undefined || p === null || isNaN(p)) return "-";
    return `${(p * 100).toFixed(2)}%`;
}

function CustomTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
        const point = payload[0].payload as any;
        return (
            <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-xl text-xs space-y-2">
                <div className="font-extrabold text-slate-800 border-b border-slate-100 pb-1">Age {label}</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-semibold text-slate-600">
                    <span className="text-blue-500">Projected Pot:</span>
                    <span className="text-right text-slate-800 font-bold">{formatCurrency(point.value)}</span>

                    <span className="text-emerald-500">Total Contributions:</span>
                    <span className="text-right text-slate-800">{formatCurrency(point.contributions)}</span>

                    <span className="text-rose-500">Cumulative Withdrawals:</span>
                    <span className="text-right text-slate-800">{formatCurrency(point.withdrawals)}</span>

                    <span className="text-purple-500">Cumulative Income:</span>
                    <span className="text-right text-slate-800">{formatCurrency(point.pensionIncome)}</span>

                    {point.spendingThisYear !== undefined && (
                        <>
                            <span className="text-slate-400 font-medium">Spending (this year):</span>
                            <span className="text-right text-slate-700 font-medium">{formatCurrency(point.spendingThisYear)}</span>
                        </>
                    )}
                    {point.withdrawalRate !== undefined && point.withdrawalRate !== 0 && (
                        <>
                            <span className="text-amber-500 font-medium">Withdrawal Rate:</span>
                            <span className="text-right text-slate-700 font-medium">{formatPct(point.withdrawalRate)}</span>
                        </>
                    )}
                </div>
            </div>
        );
    }
    return null;
}

export default function PensionChart({ data }: PensionChartProps) {
    return (
        <div className="w-full h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                        dataKey="year"
                        tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                        stroke="#e2e8f0"
                        tickLine={false}
                        axisLine={false}
                        dy={8}
                    />
                    <YAxis
                        tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                        stroke="#e2e8f0"
                        tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`}
                        tickLine={false}
                        axisLine={false}
                        dx={-8}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                    />
                    <Legend
                        wrapperStyle={{ paddingTop: "24px", fontSize: "12px", fontWeight: 500, color: "#64748b" }}
                        iconType="circle"
                        iconSize={8}
                    />
                    {/* Spending Bar - rendered in background with low opacity */}
                    <Bar dataKey="spendingThisYear" fill="#3b82f6" opacity={0.06} barSize={8} name="Spending This Year" />
                    
                    <Area
                        type="monotone"
                        dataKey="contributions"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="none"
                        name="Total Contributions"
                        dot={false}
                    />
                    <Area
                        type="monotone"
                        dataKey="withdrawals"
                        stroke="#f43f5e"
                        strokeWidth={2}
                        fill="none"
                        name="Cumulative Withdrawals"
                        dot={false}
                    />
                    <Area
                        type="monotone"
                        dataKey="pensionIncome"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fill="none"
                        name="Cumulative Pension Income"
                        dot={false}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#3b82f6"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                        name="Projected Pot"
                        dot={false}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
