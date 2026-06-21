
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
            <div className="bg-brand-surface rounded-xl border border-brand-border p-4 shadow-2xl text-xs space-y-2">
                <div className="font-extrabold text-slate-100 border-b border-brand-border pb-1">Age {label}</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-semibold text-brand-muted">
                    <span className="text-brand-primary">Projected Pot:</span>
                    <span className="text-right text-slate-100 font-bold">{formatCurrency(point.value)}</span>

                    <span className="text-emerald-400">Total Contributions:</span>
                    <span className="text-right text-slate-100">{formatCurrency(point.contributions)}</span>

                    <span className="text-rose-400">Cumulative Withdrawals:</span>
                    <span className="text-right text-slate-100">{formatCurrency(point.withdrawals)}</span>

                    <span className="text-purple-400">Cumulative Income:</span>
                    <span className="text-right text-slate-100">{formatCurrency(point.pensionIncome)}</span>

                    {point.spendingThisYear !== undefined && (
                        <>
                            <span className="text-brand-muted font-medium">Spending (this year):</span>
                            <span className="text-right text-slate-200 font-medium">{formatCurrency(point.spendingThisYear)}</span>
                        </>
                    )}
                    {point.withdrawalRate !== undefined && point.withdrawalRate !== 0 && (
                        <>
                            <span className="text-brand-accent font-medium">Withdrawal Rate:</span>
                            <span className="text-right text-slate-200 font-medium">{formatPct(point.withdrawalRate)}</span>
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
                            <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2433" vertical={false} />
                    <XAxis
                        dataKey="year"
                        tick={{ fill: "#8B949E", fontSize: 11, fontWeight: 500 }}
                        stroke="#1F2433"
                        tickLine={false}
                        axisLine={false}
                        dy={8}
                    />
                    <YAxis
                        tick={{ fill: "#8B949E", fontSize: 11, fontWeight: 500 }}
                        stroke="#1F2433"
                        tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`}
                        tickLine={false}
                        axisLine={false}
                        dx={-8}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                    />
                    <Legend
                        wrapperStyle={{ paddingTop: "24px", fontSize: "12px", fontWeight: 500, color: "#8B949E" }}
                        iconType="circle"
                        iconSize={8}
                    />
                    {/* Spending Bar - rendered in background with low opacity */}
                    <Bar dataKey="spendingThisYear" fill="#00F0FF" opacity={0.06} barSize={8} name="Spending This Year" />
                    
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
                        stroke="#00F0FF"
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
