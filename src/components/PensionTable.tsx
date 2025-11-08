"use client";

import React from 'react';

interface ChartData {
    year: number;
    value: number;
    contributions: number;
    growth: number;
    withdrawals: number;
    pensionIncome: number;
}

interface PensionTableProps {
    data: ChartData[];
}

export default function PensionTable({ data }: PensionTableProps) {
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
                    {data.map((row, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="py-2 px-4 border-b text-sm text-gray-700">{row.year}</td>
                            <td className="py-2 px-4 border-b text-sm text-gray-700">{row.value.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                            <td className="py-2 px-4 border-b text-sm text-gray-700">{row.contributions.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                            <td className="py-2 px-4 border-b text-sm text-gray-700">{row.withdrawals.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                            <td className="py-2 px-4 border-b text-sm text-gray-700">{row.pensionIncome.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
