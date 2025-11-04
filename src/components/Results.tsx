

"use client";

import { useState, useMemo } from "react";
import PensionChart from "./PensionChart";
import { calculatePension } from "@/lib/pensionCalculator";

interface ResultsProps {
    currentAge: number;
    retirementAge: number;
    currentPot: number;
    monthlyContribution: number;
    employerContribution: number;
    expectedReturn: number;
}

interface ChartData {
    year: number;
    value: number;
    contributions: number;
    growth: number;
    withdrawals: number;
}

function transformPensionDataForChart(
    pensionData: Array<{ age: number; potValue: number }>,
    currentAge: number,
    retirementAge: number,
    currentPot: number,
    monthlyContribution: number,
    employerContribution: number,
    annualRetirementSpending: number,
    statePensionIncome: number,
    inflationRate: number
): ChartData[] {
    const annualContribution = (monthlyContribution + employerContribution) * 12;
    const yearsUntilRetirement = retirementAge - currentAge;
    const totalContributionsAtRetirement = currentPot + (yearsUntilRetirement * annualContribution);
    const netAnnualWithdrawal = annualRetirementSpending - statePensionIncome;

    let cumulativeWithdrawals = 0;
    let currentAnnualSpending = annualRetirementSpending;

    return pensionData.map((point, index) => {
        const yearsSinceStart = point.age - currentAge;
        const isRetired = point.age >= retirementAge;
        const yearsSinceRetirement = isRetired ? point.age - retirementAge : 0;

        // Contributions stop at retirement
        const totalContributions = isRetired
            ? totalContributionsAtRetirement
            : currentPot + (yearsSinceStart * annualContribution);

        // Calculate cumulative withdrawals with inflation adjustment
        if (isRetired && point.age > retirementAge) {
            // Adjust spending for inflation each year
            currentAnnualSpending = annualRetirementSpending * Math.pow(1 + inflationRate / 100, yearsSinceRetirement - 1);
            const netWithdrawal = currentAnnualSpending - statePensionIncome;
            cumulativeWithdrawals += netWithdrawal;
        }

        // potValue already has withdrawals deducted by calculatePension
        // Growth = (current pot value + withdrawals taken) - contributions
        const growth = Math.max(0, point.potValue + cumulativeWithdrawals - totalContributions);

        return {
            year: point.age,
            value: point.potValue, // This is the actual remaining value after withdrawals
            contributions: totalContributions,
            growth: growth,
            withdrawals: cumulativeWithdrawals,
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
                                }: ResultsProps) {
    const [annualRetirementSpending, setAnnualRetirementSpending] = useState(30000);
    const [postRetirementGrowth, setPostRetirementGrowth] = useState(3);

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
            inflationRate: 2.5,
            statePensionIncome: 11500,
            annualPreRetirementIncome: annualContribution,
            contributionRate: 100,
        });
    }, [currentAge, retirementAge, currentPot, monthlyContribution, employerContribution, expectedReturn, annualRetirementSpending, postRetirementGrowth]);

    const chartData = useMemo(() =>
            transformPensionDataForChart(
                pensionData,
                currentAge,
                retirementAge,
                currentPot,
                monthlyContribution,
                employerContribution,
                annualRetirementSpending,
                11500,
                2.5
            ),
        [pensionData, currentAge, retirementAge, currentPot, monthlyContribution, employerContribution, annualRetirementSpending]
    );

    const { projectedRetirementPotValue, ageFundsRunOut, totalYearsFundLasts, shortfallSurplus } = useMemo(() => {
        const retirementPot = pensionData.find(d => d.age === retirementAge)?.potValue || 0;
        const lastNonZeroEntry = pensionData.findLast(d => d.potValue > 0);
        const fundsRunOutAge = lastNonZeroEntry ? (lastNonZeroEntry.age < 90 ? lastNonZeroEntry.age : null) : retirementAge;
        const yearsFundLasts = fundsRunOutAge ? fundsRunOutAge - retirementAge : 90 - retirementAge;
        const surplus = fundsRunOutAge === null || fundsRunOutAge >= 90 ? 'Surplus' : 'Shortfall';

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

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-8 text-gray-800">Results</h2>
            {pensionData.length > 0 ? (
                <div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-center">
                        <div className="p-3 border rounded-lg">
                            <p className="text-sm font-medium text-gray-600">Retirement Pot</p>
                            <p className="text-lg font-bold text-blue-600">{projectedRetirementPotValue?.toLocaleString('en-GB', {
                                style: 'currency',
                                currency: 'GBP',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            })}</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                            <p className="text-sm font-medium text-gray-600">Funds Run Out</p>
                            <p className="text-lg font-bold text-blue-600">{ageFundsRunOut || 'Never'}</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                            <p className="text-sm font-medium text-gray-600">Fund Duration</p>
                            <p className="text-lg font-bold text-blue-600">{totalYearsFundLasts} yrs</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                            <p className="text-sm font-medium text-gray-600">Outcome</p>
                            <p className={`text-lg font-bold ${shortfallSurplus === 'Surplus' ? 'text-green-600' : 'text-red-600'}`}>{shortfallSurplus}</p>
                        </div>
                    </div>
                    <PensionChart data={chartData}/>
                    <div className="mt-8 space-y-4">
                        <div>
                            <label htmlFor="annualRetirementSpendingSlider" className="block text-sm font-medium text-gray-700">Retirement Spending: {annualRetirementSpending.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</label>
                            <input type="range" id="annualRetirementSpendingSlider" min="10000" max="100000" step="1000" value={annualRetirementSpending} onChange={handleSliderChange(setAnnualRetirementSpending)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"/>
                        </div>
                        <div>
                            <label htmlFor="postRetirementGrowthSlider" className="block text-sm font-medium text-gray-700">Post-Retirement Growth: {postRetirementGrowth}%</label>
                            <input type="range" id="postRetirementGrowthSlider" min="0" max="10" step="0.1" value={postRetirementGrowth} onChange={handleSliderChange(setPostRetirementGrowth)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"/>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center text-gray-500 mt-16">Enter your details to see your pension projection.</div>
            )}
        </div>
    );
}