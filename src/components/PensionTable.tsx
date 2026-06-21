"use client";

import React from 'react';

interface ChartData {
    year: number;
    value: number;
    contributions: number;
    growth: number;
    withdrawals: number;
    pensionIncome: number;
    spendingThisYear?: number;
    withdrawalRate?: number;
}

interface PensionTableProps {
    data: ChartData[];
}

export default function PensionTable({ data }: PensionTableProps) {
    const fmt = (n?: number) => n === undefined ? '-' : n.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    return (
        <div className="overflow-x-auto w-full border border-slate-100 rounded-xl">
            <table className="min-w-full bg-white divide-y divide-slate-100 text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                        <th className="py-3 px-4 text-center font-bold">Age</th>
                        <th className="py-3 px-4 font-bold">Projected Pot (£)</th>
                        <th className="py-3 px-4 font-bold">Total Contributions (£)</th>
                        <th className="py-3 px-4 font-bold">Cumulative Withdrawals (£)</th>
                        <th className="py-3 px-4 font-bold">Cumulative Pension Income (£)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                    {data.map((row, index) => {
                        const title = row.spendingThisYear !== undefined || row.withdrawalRate !== undefined
                            ? `Spending this year: £${Math.round(row.spendingThisYear || 0).toLocaleString('en-GB')}  |  Withdrawal rate: ${row.withdrawalRate ? (row.withdrawalRate * 100).toFixed(2) + '%' : '-'}`
                            : undefined;
                        return (
                            <tr key={index} className="hover:bg-slate-50/80 transition-colors" title={title}>
                                <td className="py-2.5 px-4 font-semibold text-slate-800 text-center">{row.year}</td>
                                <td className="py-2.5 px-4 font-medium text-slate-700">{fmt(row.value)}</td>
                                <td className="py-2.5 px-4">{fmt(row.contributions)}</td>
                                <td className="py-2.5 px-4 text-rose-600 font-medium">{fmt(row.withdrawals)}</td>
                                <td className="py-2.5 px-4 text-purple-600">{fmt(row.pensionIncome)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
