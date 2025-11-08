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
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Age</th>
                        <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Projected Value (£)</th>
                        <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Total Contributions (£)</th>
                        <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Cumulative Withdrawals (£)</th>
                        <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Cumulative Pension Income (£)</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => {
                        const title = row.spendingThisYear !== undefined || row.withdrawalRate !== undefined
                            ? `Spending this year: £${Math.round(row.spendingThisYear || 0).toLocaleString('en-GB')}  |  Withdrawal rate: ${row.withdrawalRate ? (row.withdrawalRate * 100).toFixed(2) + '%' : '-'}`
                            : undefined;
                        return (
                            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} title={title}>
                                <td className="py-2 px-4 border-b text-sm text-gray-700">{row.year}</td>
                                <td className="py-2 px-4 border-b text-sm text-gray-700">{fmt(row.value)}</td>
                                <td className="py-2 px-4 border-b text-sm text-gray-700">{fmt(row.contributions)}</td>
                                <td className="py-2 px-4 border-b text-sm text-gray-700">{fmt(row.withdrawals)}</td>
                                <td className="py-2 px-4 border-b text-sm text-gray-700">{fmt(row.pensionIncome)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
