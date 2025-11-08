
"use client";

import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
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
}

/**
 * Represents the props for the PensionChart component.
 */
interface PensionChartProps {
    /** The data to display in the chart. */
    data: ChartData[];
}

/**
 * A chart that visualizes the pension projection.
 *
 * This component uses the Recharts library to render an area chart
 * showing the projected value of the pension pot over time, as well as
 * other series like contributions, withdrawals, and pension income.
 *
 * @param {PensionChartProps} props - The props for the component.
 * @returns {JSX.Element} The rendered chart.
 */
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
            <div style={{ background: 'white', borderRadius: 12, border: '2px solid #e5e7eb', padding: 12, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Age: {label}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: 6 }}>
                    <span style={{ color: '#3b82f6' }}>Projected Value:</span><span>{formatCurrency(point.value)}</span>
                    <span style={{ color: '#10b981' }}>Total Contributions:</span><span>{formatCurrency(point.contributions)}</span>
                    <span style={{ color: '#ef4444' }}>Cumulative Withdrawals:</span><span>{formatCurrency(point.withdrawals)}</span>
                    <span style={{ color: '#8b5cf6' }}>Cumulative Pension Income:</span><span>{formatCurrency(point.pensionIncome)}</span>
                    {point.spendingThisYear !== undefined && (
                        <>
                            <span>Spending (this year):</span><span>{formatCurrency(point.spendingThisYear)}</span>
                        </>
                    )}
                    {point.withdrawalRate !== undefined && point.withdrawalRate !== 0 && (
                        <>
                            <span>Withdrawal rate:</span><span>{formatPct(point.withdrawalRate)}</span>
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
                        <linearGradient id="colorWithdrawals" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorPensionIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
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
                        label={{ value: "Value (£)", angle: -90, position: "insideLeft", offset: -15 }}
                        tick={{ fill: "#6b7280", fontSize: 14 }}
                        stroke="#9ca3af"
                        tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
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
                        fill="none"
                        name="Total Contributions"
                    />
                    <Area
                        type="monotone"
                        dataKey="withdrawals"
                        stroke="#ef4444"
                        strokeWidth={2}
                        fill="none"
                        name="Cumulative Withdrawals"
                    />
                    <Area
                        type="monotone"
                        dataKey="pensionIncome"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fill="none"
                        name="Cumulative Pension Income"
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
