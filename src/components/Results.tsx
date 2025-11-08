


"use client";

import { useState, useMemo } from "react";
import PensionChart from "./PensionChart";
import PensionTable from "./PensionTable"; // Import the new component
import { calculatePension } from "@/lib/pensionCalculator";

interface Pension {
    name: string;
    amount: number;
    startAge: number;
}

interface ResultsProps {
    currentAge: number;
    retirementAge: number;
    currentPot: number;
    monthlyContribution: number;
    employerContribution: number;
    expectedReturn: number;
    pensions: Pension[];
}

interface ChartData {
    year: number;
    value: number;
    contributions: number;
    growth: number;
    withdrawals: number;
    pensionIncome: number;
}

function transformPensionDataForChart(
    pensionData: Array<{ age: number; potValue: number }>,
    currentAge: number,
    retirementAge: number,
    currentPot: number,
    monthlyContribution: number,
    employerContribution: number,
    annualRetirementSpending: number,
    pensions: Pension[],
    inflationRate: number,
): ChartData[] {
    const annualContribution = (monthlyContribution + employerContribution) * 12;
    const yearsUntilRetirement = retirementAge - currentAge;
    const totalContributionsAtRetirement = currentPot + (yearsUntilRetirement * annualContribution);

    let cumulativeWithdrawals = 0;
    let currentAnnualSpending = annualRetirementSpending;
    let cumulativePensionIncome = 0;

    return pensionData.map((point, index) => {
        const isRetired = point.age >= retirementAge;
        const yearsSinceRetirement = isRetired ? point.age - retirementAge : 0;

        // Contributions accumulate at the end of each year
        // For age X, we've completed (X - currentAge) years of contributions
        const yearsCompleted = point.age - currentAge;
        const totalContributions = isRetired
            ? totalContributionsAtRetirement
            : currentPot + (yearsCompleted * annualContribution);

        let yearlyPensionIncome = 0;
        if (isRetired) {
            pensions.forEach(pension => {
                if (point.age > pension.startAge) {
                    yearlyPensionIncome += pension.amount;
                }
            });
        }
        cumulativePensionIncome += yearlyPensionIncome;

        // Calculate cumulative withdrawals with inflation adjustment
        if (isRetired && point.age > retirementAge) {
            // Adjust spending for inflation each year
            currentAnnualSpending = annualRetirementSpending * Math.pow(1 + inflationRate / 100, yearsSinceRetirement - 1);
            let netWithdrawal = currentAnnualSpending;
            pensions.forEach(pension => {
                if (point.age > pension.startAge) {
                    netWithdrawal -= pension.amount;
                }
            });
            cumulativeWithdrawals += netWithdrawal;
        }

        // potValue already has withdrawals deducted by calculatePension
        // Growth = (current pot value + withdrawals taken) - contributions
        const growth = Math.max(0, point.potValue - totalContributions);

        return {
            year: point.age,
            value: point.potValue, // This is the actual remaining value after withdrawals
            contributions: totalContributions,
            growth: growth,
            withdrawals: cumulativeWithdrawals,
            pensionIncome: cumulativePensionIncome,
        };
    });
}

export default function Results({
                                    currentAge,
                                    retirementAge,
                                    currentPot,
                                    monthlyContribution,
                                    employerContribution,
                                    expectedReturn,
                                    pensions,
                                }: ResultsProps) {
    const [annualRetirementSpending, setAnnualRetirementSpending] = useState(40000);
    const [postRetirementGrowth, setPostRetirementGrowth] = useState(5);
    const [inflationRate, setInflationRate] = useState(2.5);
    const [showTable, setShowTable] = useState(false); // New state for toggling view

    const pensionData = useMemo(() => {
        const annualContribution = (monthlyContribution + employerContribution) * 12;

        return calculatePension({
            currentAge,
            pensionPotValue: currentPot,
            retirementAge,
            lifeExpectancy: 90,
            annualRetirementSpending,
            preRetirementGrowth: expectedReturn,
            postRetirementGrowth,
            inflationRate,
            pensions,
            annualPreRetirementIncome: annualContribution,
            contributionRate: 100,
        });
    }, [currentAge, retirementAge, currentPot, monthlyContribution, employerContribution, expectedReturn, annualRetirementSpending, postRetirementGrowth, inflationRate, pensions]);

    const chartData = useMemo(() =>
            transformPensionDataForChart(
                pensionData,
                currentAge,
                retirementAge,
                currentPot,
                monthlyContribution,
                employerContribution,
                annualRetirementSpending,
                pensions,
                inflationRate,
            ),
        [pensionData, currentAge, retirementAge, currentPot, monthlyContribution, employerContribution, annualRetirementSpending, inflationRate, pensions]
    );

    const { projectedRetirementPotValue, ageFundsRunOut, totalYearsFundLasts, shortfallSurplus } = useMemo(() => {
        const retirementPot = pensionData.find(d => d.age === retirementAge)?.potValue || 0;
        const fundsRunOutAge = pensionData.find(d => d.potValue === 0)?.age || 90;
        const yearsFundLasts = fundsRunOutAge - retirementAge;
        const surplus = fundsRunOutAge >= 90 ? 'Surplus' : 'Shortfall';

        return {
            projectedRetirementPotValue: retirementPot,
            ageFundsRunOut: fundsRunOutAge,
            totalYearsFundLasts: yearsFundLasts,
            shortfallSurplus: surplus,
        };
    }, [pensionData, retirementAge]);

    const handleSliderChange = (setter: React.Dispatch<React.SetStateAction<number>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(Number(e.target.value));
    };

    const handleDownloadCsv = () => {
        downloadCsv(chartData, "pension_projection.csv");
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Projection</h2>
            <div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs font-medium text-gray-600">Retirement Pot</p>
                        <p className="text-base font-bold text-blue-600">{projectedRetirementPotValue?.toLocaleString('en-GB', {
                            style: 'currency',
                            currency: 'GBP',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        })}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs font-medium text-gray-600">Funds Run Out</p>
                        <p className="text-base font-bold text-blue-600">{ageFundsRunOut >= 90 ? 'Never' : ageFundsRunOut}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs font-medium text-gray-600">Fund Duration</p>
                        <p className="text-base font-bold text-blue-600">{totalYearsFundLasts} yrs</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs font-medium text-gray-600">Outcome</p>
                        <p className={`text-base font-bold ${shortfallSurplus === 'Surplus' ? 'text-green-600' : 'text-red-600'}`}>{shortfallSurplus}</p>
                    </div>
                </div>
                <div className="mt-6 space-y-3">
                    <div>
                        <label htmlFor="annualRetirementSpendingSlider" className="block text-xs font-medium text-gray-700 mb-1">Retirement Spending: {annualRetirementSpending.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</label>
                        <input type="range" id="annualRetirementSpendingSlider" min="10000" max="100000" step="1000" value={annualRetirementSpending} onChange={handleSliderChange(setAnnualRetirementSpending)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"/>
                    </div>
                    <div>
                        <label htmlFor="postRetirementGrowthSlider" className="block text-xs font-medium text-gray-700 mb-1">Post-Retirement Growth: {postRetirementGrowth}%</label>
                        <input type="range" id="postRetirementGrowthSlider" min="0" max="10" step="0.1" value={postRetirementGrowth} onChange={handleSliderChange(setPostRetirementGrowth)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"/>
                    </div>
                    <div>
                        <label htmlFor="inflationRateSlider" className="block text-xs font-medium text-gray-700 mb-1">Inflation Rate: {inflationRate}%</label>
                        <input type="range" id="inflationRateSlider" min="0" max="10" step="0.1" value={inflationRate} onChange={handleSliderChange(setInflationRate)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"/>
                    </div>
                </div>
                <div className="mt-6">
                    <div className="flex justify-center space-x-4 mb-4">
                        <button
                            onClick={() => setShowTable(false)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${!showTable ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                        >
                            View Chart
                        </button>
                        <button
                            onClick={() => setShowTable(true)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${showTable ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                        >
                            View Table
                        </button>
                        <button
                            onClick={handleDownloadCsv}
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300"
                        >
                            Download CSV
                        </button>
                    </div>
                    {showTable ? (
                        <PensionTable data={chartData} />
                    ) : (
                        <PensionChart data={chartData}/>
                    )}
                </div>
            </div>
        </div>
    );
}

function downloadCsv(data: ChartData[], filename: string) {
    const headers = ["Year", "Projected Value (£)", "Total Contributions (£)", "Cumulative Withdrawals (£)", "Cumulative Pension Income (£)"];
    const rows = data.map(row => [
        row.year,
        row.value.toFixed(2),
        row.contributions.toFixed(2),
        row.withdrawals.toFixed(2),
        row.pensionIncome.toFixed(2),
    ]);

    const csvContent = [
        headers.join(","),
        ...rows.map(e => e.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) { // feature detection
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}