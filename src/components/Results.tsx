


"use client";

import { useState, useMemo } from "react";
import PensionChart from "./PensionChart";
import PensionTable from "./PensionTable"; // Import the new component
import { calculatePension } from "@/lib/pensionCalculator";

interface Pension {
    name: string;
    amount: number;
    startAge: number;
    isInflationLinked?: boolean;
}

interface ResultsProps {
    currentAge: number;
    retirementAge: number;
    currentPot: number;
    monthlyContribution: number;
    employerContribution: number;
    expectedReturn: number;
    pensions: Pension[];
    lumpSumType?: 'percentage' | 'fixed';
    lumpSumPct?: number;
    lumpSumAmount?: number;
}

interface ChartData {
    year: number;
    value: number;
    contributions: number;
    growth: number;
    withdrawals: number;
    pensionIncome: number;
    spendingThisYear?: number;
    withdrawalRate?: number; // spending / start-of-year pot
}

function transformPensionDataForChart(
    pensionData: Array<any>,
    currentAge: number,
    retirementAge: number,
    currentPot: number,
    monthlyContribution: number,
    employerContribution: number,
): ChartData[] {
    const annualContribution = (monthlyContribution + employerContribution) * 12;
    let cumulativeWithdrawals = 0;
    let cumulativePensionIncome = 0;
    let cumulativeContributions = currentPot;

    return pensionData.map((point) => {
        const isPostRetirement = point.age > retirementAge;

        if (!isPostRetirement) {
            // Contributions accumulate at the end of each year during pre-retirement (up to and including retirement age)
            if (point.age > currentAge) {
                cumulativeContributions += annualContribution;
            }
        } else {
            // Accumulate actual net withdrawals (spending minus other pension incomes)
            // and other pension income received.
            const desiredNetWithdrawal = (point.spendingThisYear ?? 0) - (point.pensionIncomeThisYear ?? 0);
            
            // Limit actual net withdrawal to what was in the pot
            const maxAvailableForWithdrawal = (point.startOfYearPot ?? 0) + (point.pensionIncomeThisYear ?? 0);
            const actualNetWithdrawal = desiredNetWithdrawal > 0
                ? Math.min(desiredNetWithdrawal, maxAvailableForWithdrawal)
                : desiredNetWithdrawal;

            cumulativeWithdrawals += actualNetWithdrawal;
            cumulativePensionIncome += (point.pensionIncomeThisYear ?? 0);
        }

        if (point.lumpSumTaken) {
            cumulativeWithdrawals += point.lumpSumTaken;
        }

        // accounting equation: growth = potValue - contributions + withdrawals
        const growth = Math.max(0, point.potValue - cumulativeContributions + cumulativeWithdrawals);

        return {
            year: point.age,
            value: point.potValue,
            contributions: cumulativeContributions,
            growth: growth,
            withdrawals: cumulativeWithdrawals,
            pensionIncome: cumulativePensionIncome,
            spendingThisYear: point.spendingThisYear,
            withdrawalRate: point.withdrawalRate,
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
                                    lumpSumType,
                                    lumpSumPct,
                                    lumpSumAmount,
                                }: ResultsProps) {
    const [annualRetirementSpending, setAnnualRetirementSpending] = useState(40000);
    const [postRetirementGrowth, setPostRetirementGrowth] = useState(5);
    const [inflationRate, setInflationRate] = useState(2.5);
    const [showTable, setShowTable] = useState(false); // New state for toggling view
    const [gkEnabled, setGkEnabled] = useState(false); // Guyton–Klinger dynamic withdrawals toggle
    const [gkBandWidthPct, setGkBandWidthPct] = useState(20);
    const [gkAdjustmentPct, setGkAdjustmentPct] = useState(10);
    const [gkSkipInflationOnLoss, setGkSkipInflationOnLoss] = useState(true);

    const [spendingProfileType, setSpendingProfileType] = useState<'constant' | 'phased'>('constant');
    const [earlyRetirementSpending, setEarlyRetirementSpending] = useState(45000);
    const [earlyRetirementDuration, setEarlyRetirementDuration] = useState(10);
    const [midRetirementSpending, setMidRetirementSpending] = useState(35000);
    const [midRetirementDuration, setMidRetirementDuration] = useState(10);
    const [lateRetirementSpending, setLateRetirementSpending] = useState(25000);

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
            gkEnabled: spendingProfileType === 'phased' ? false : gkEnabled,
            gk: {
                bandWidthPct: gkBandWidthPct,
                adjustmentPct: gkAdjustmentPct,
                skipInflationOnLoss: gkSkipInflationOnLoss,
            },
            lumpSumType,
            lumpSumPct,
            lumpSumAmount,
            spendingProfileType,
            earlyRetirementSpending,
            earlyRetirementDuration,
            midRetirementSpending,
            midRetirementDuration,
            lateRetirementSpending,
        });
    }, [currentAge, retirementAge, currentPot, monthlyContribution, employerContribution, expectedReturn, annualRetirementSpending, postRetirementGrowth, inflationRate, pensions, gkEnabled, gkBandWidthPct, gkAdjustmentPct, gkSkipInflationOnLoss, lumpSumType, lumpSumPct, lumpSumAmount, spendingProfileType, earlyRetirementSpending, earlyRetirementDuration, midRetirementSpending, midRetirementDuration, lateRetirementSpending]);

    const chartData = useMemo(() =>
            transformPensionDataForChart(
                pensionData,
                currentAge,
                retirementAge,
                currentPot,
                monthlyContribution,
                employerContribution,
            ),
        [pensionData, currentAge, retirementAge, currentPot, monthlyContribution, employerContribution]
    );

    const { projectedRetirementPotValue, ageFundsRunOut, totalYearsFundLasts, shortfallSurplus, lumpSumTaken } = useMemo(() => {
        const retirementPotPoint = pensionData.find(d => d.age === retirementAge);
        const retirementPot = retirementPotPoint?.potValue || 0;
        const lumpSum = retirementPotPoint?.lumpSumTaken || 0;
        const fundsRunOutAge = pensionData.find(d => d.potValue === 0)?.age || 90;
        const yearsFundLasts = fundsRunOutAge - retirementAge;
        const surplus = fundsRunOutAge >= 90 ? 'Surplus' : 'Shortfall';

        return {
            projectedRetirementPotValue: retirementPot,
            ageFundsRunOut: fundsRunOutAge,
            totalYearsFundLasts: yearsFundLasts,
            shortfallSurplus: surplus,
            lumpSumTaken: lumpSum,
        };
    }, [pensionData, retirementAge]);

    const handleSliderChange = (setter: React.Dispatch<React.SetStateAction<number>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(Number(e.target.value));
    };

    const handleDownloadCsv = () => {
        downloadCsv(chartData, "pension_projection.csv");
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100 space-y-6">
            <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    Projection Analysis
                </h2>
                <div className="flex bg-slate-100 rounded-lg p-1 text-xs">
                    <button
                        onClick={() => setShowTable(false)}
                        className={`px-3 py-1.5 rounded-md font-medium transition-all ${!showTable ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        Chart
                    </button>
                    <button
                        onClick={() => setShowTable(true)}
                        className={`px-3 py-1.5 rounded-md font-medium transition-all ${showTable ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        Table
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div className="p-3.5 bg-gradient-to-br from-blue-50 to-indigo-50/30 rounded-xl border border-blue-100/50 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Retirement Pot</p>
                        <p className="text-base font-extrabold text-blue-700 mt-1">{projectedRetirementPotValue?.toLocaleString('en-GB', {
                            style: 'currency',
                            currency: 'GBP',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        })}</p>
                    </div>
                    <div className="p-3.5 bg-gradient-to-br from-amber-50 to-orange-50/30 rounded-xl border border-amber-100/50 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lump Sum Taken</p>
                        <p className="text-base font-extrabold text-amber-700 mt-1">{lumpSumTaken?.toLocaleString('en-GB', {
                            style: 'currency',
                            currency: 'GBP',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        })}</p>
                    </div>
                    <div className="p-3.5 bg-gradient-to-br from-emerald-50 to-teal-50/30 rounded-xl border border-emerald-100/50 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Funds Run Out</p>
                        <p className="text-base font-extrabold text-emerald-700 mt-1">{ageFundsRunOut >= 90 ? 'Never (90+)' : `Age ${ageFundsRunOut}`}</p>
                    </div>
                    <div className="p-3.5 bg-gradient-to-br from-purple-50 to-fuchsia-50/30 rounded-xl border border-purple-100/50 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Duration</p>
                        <p className="text-base font-extrabold text-purple-700 mt-1">{totalYearsFundLasts} Years</p>
                    </div>
                    <div className={`p-3.5 bg-gradient-to-br rounded-xl border shadow-sm ${
                        shortfallSurplus === 'Surplus'
                            ? 'from-green-50 to-emerald-50/30 border-green-100/50 text-green-700'
                            : 'from-rose-50 to-red-50/30 border-rose-100/50 text-rose-700'
                    }`}>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Outcome</p>
                        <p className="text-base font-extrabold mt-1">{shortfallSurplus}</p>
                    </div>
                </div>

                {/* Sliders Container */}
                <div className="space-y-4 pt-2">
                    {/* Spending Profile Selector */}
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Retirement Spending Profile</label>
                        <div className="flex bg-slate-100 rounded-lg p-1 text-xs max-w-xs">
                            <button
                                type="button"
                                onClick={() => setSpendingProfileType('constant')}
                                className={`flex-1 py-1.5 rounded-md font-semibold text-center transition-all ${
                                    spendingProfileType === 'constant'
                                        ? 'bg-white text-slate-800 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                Constant Spending
                            </button>
                            <button
                                type="button"
                                onClick={() => setSpendingProfileType('phased')}
                                className={`flex-1 py-1.5 rounded-md font-semibold text-center transition-all ${
                                    spendingProfileType === 'phased'
                                        ? 'bg-white text-slate-800 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                Phased Spending
                            </button>
                        </div>
                    </div>

                    {spendingProfileType === 'constant' ? (
                        /* Spending Slider */
                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                                <label htmlFor="annualRetirementSpendingSlider" className="font-semibold text-slate-700">
                                    Desired Annual Spending in Retirement: {annualRetirementSpending.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </label>
                            </div>
                            <input
                                type="range"
                                id="annualRetirementSpendingSlider"
                                min="10000"
                                max="100000"
                                step="1000"
                                value={annualRetirementSpending}
                                onChange={handleSliderChange(setAnnualRetirementSpending)}
                                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-colors"
                            />
                            <p className="text-[10px] text-slate-400 italic">
                                PLSA Living Standard (Single): ~£14.4k (Min), ~£31.3k (Mod), ~£43.1k (Comfortable)
                            </p>
                        </div>
                    ) : (
                        /* Phased Spending Inputs */
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                                </svg>
                                Custom Spending Phases (in today's real terms)
                            </h3>
                            
                            {/* Phase 1: Early/Active Retirement */}
                            <div className="space-y-2 p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-center text-2xs font-bold text-blue-600 uppercase tracking-wider">
                                    <span>Phase 1: Active Years</span>
                                    <span>Ages {retirementAge + 1} - {retirementAge + earlyRetirementDuration}</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label htmlFor="earlyDurationSlider" className="block text-[11px] font-semibold text-slate-600">Duration: {earlyRetirementDuration} years</label>
                                        <input
                                            id="earlyDurationSlider"
                                            type="range"
                                            min="1"
                                            max="30"
                                            step="1"
                                            value={earlyRetirementDuration}
                                            onChange={(e) => setEarlyRetirementDuration(Number(e.target.value))}
                                            className="w-full h-1.5 bg-slate-100 rounded appearance-none cursor-pointer accent-blue-600"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="earlySpendingSlider" className="block text-[11px] font-semibold text-slate-600">Spending: {earlyRetirementSpending.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0 })}/yr</label>
                                        <input
                                            id="earlySpendingSlider"
                                            type="range"
                                            min="10000"
                                            max="100000"
                                            step="1000"
                                            value={earlyRetirementSpending}
                                            onChange={(e) => setEarlyRetirementSpending(Number(e.target.value))}
                                            className="w-full h-1.5 bg-slate-100 rounded appearance-none cursor-pointer accent-blue-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Phase 2: Passive/Mid Retirement */}
                            <div className="space-y-2 p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-center text-2xs font-bold text-indigo-600 uppercase tracking-wider">
                                    <span>Phase 2: Mid Years</span>
                                    <span>Ages {retirementAge + earlyRetirementDuration + 1} - {retirementAge + earlyRetirementDuration + midRetirementDuration}</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label htmlFor="midDurationSlider" className="block text-[11px] font-semibold text-slate-600">Duration: {midRetirementDuration} years</label>
                                        <input
                                            id="midDurationSlider"
                                            type="range"
                                            min="1"
                                            max="30"
                                            step="1"
                                            value={midRetirementDuration}
                                            onChange={(e) => setMidRetirementDuration(Number(e.target.value))}
                                            className="w-full h-1.5 bg-slate-100 rounded appearance-none cursor-pointer accent-blue-600"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="midSpendingSlider" className="block text-[11px] font-semibold text-slate-600">Spending: {midRetirementSpending.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0 })}/yr</label>
                                        <input
                                            id="midSpendingSlider"
                                            type="range"
                                            min="10000"
                                            max="100000"
                                            step="1000"
                                            value={midRetirementSpending}
                                            onChange={(e) => setMidRetirementSpending(Number(e.target.value))}
                                            className="w-full h-1.5 bg-slate-100 rounded appearance-none cursor-pointer accent-blue-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Phase 3: Late Retirement */}
                            <div className="space-y-2 p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-center text-2xs font-bold text-purple-600 uppercase tracking-wider">
                                    <span>Phase 3: Late Years</span>
                                    <span>Ages {retirementAge + earlyRetirementDuration + midRetirementDuration + 1} - 90</span>
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="lateSpendingSlider" className="block text-[11px] font-semibold text-slate-600">Spending: {lateRetirementSpending.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0 })}/yr</label>
                                    <input
                                        id="lateSpendingSlider"
                                        type="range"
                                        min="10000"
                                        max="100000"
                                        step="1000"
                                        value={lateRetirementSpending}
                                        onChange={(e) => setLateRetirementSpending(Number(e.target.value))}
                                        className="w-full h-1.5 bg-slate-100 rounded appearance-none cursor-pointer accent-blue-600"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Post-Retirement Growth Slider */}
                    <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                            <label htmlFor="postRetirementGrowthSlider" className="font-semibold text-slate-700">
                                Expected Growth Rate (Post-Retirement): {postRetirementGrowth}%
                            </label>
                        </div>
                        <input
                            type="range"
                            id="postRetirementGrowthSlider"
                            min="0"
                            max="10"
                            step="0.1"
                            value={postRetirementGrowth}
                            onChange={handleSliderChange(setPostRetirementGrowth)}
                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-colors"
                        />
                    </div>

                    {/* Inflation Rate Slider */}
                    <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                            <label htmlFor="inflationRateSlider" className="font-semibold text-slate-700">
                                Expected Inflation Rate: {inflationRate}%
                            </label>
                        </div>
                        <input
                            type="range"
                            id="inflationRateSlider"
                            min="0"
                            max="10"
                            step="0.1"
                            value={inflationRate}
                            onChange={handleSliderChange(setInflationRate)}
                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-colors"
                        />
                    </div>

                    {/* Guyton–Klinger Settings Accordion */}
                    <div className="border border-slate-150 rounded-xl overflow-hidden bg-slate-50/50">
                        <button
                            type="button"
                            disabled={spendingProfileType === 'phased'}
                            onClick={() => setGkEnabled(!gkEnabled)}
                            className={`w-full flex items-center justify-between p-3.5 font-semibold text-xs text-slate-700 hover:bg-slate-100/50 transition-colors ${
                                spendingProfileType === 'phased' ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <input
                                    id="gkToggle"
                                    type="checkbox"
                                    className="h-4 w-4 accent-blue-600 rounded cursor-pointer disabled:cursor-not-allowed"
                                    disabled={spendingProfileType === 'phased'}
                                    checked={spendingProfileType === 'phased' ? false : gkEnabled}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        setGkEnabled(e.target.checked);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                Enable Dynamic Withdrawals (Guyton–Klinger Rules)
                            </span>
                            <svg
                                className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${gkEnabled && spendingProfileType !== 'phased' ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                        
                        {spendingProfileType === 'phased' && (
                            <div className="border-t border-slate-150 p-3 bg-amber-50/50 border-amber-100/50 text-[11px] text-amber-700 font-semibold flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                </svg>
                                Guyton–Klinger rules are disabled when using a phased spending profile.
                            </div>
                        )}
                        
                        <div
                            className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                gkEnabled ? 'max-h-96 opacity-100 border-t border-slate-150 p-4 space-y-4 bg-white' : 'max-h-0 opacity-0'
                            }`}
                        >
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                Guyton–Klinger guardrails automatically adjust retirement spending based on investment performance to maximize lifetime income safety.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label htmlFor="gkBand" className="block text-[11px] font-semibold text-slate-600">
                                        Guardrail Band: ±{gkBandWidthPct}%
                                    </label>
                                    <input
                                        id="gkBand"
                                        type="range"
                                        min={5}
                                        max={40}
                                        step={1}
                                        value={gkBandWidthPct}
                                        onChange={(e) => setGkBandWidthPct(Number(e.target.value))}
                                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="gkAdjust" className="block text-[11px] font-semibold text-slate-600">
                                        Adjustment Step: {gkAdjustmentPct}%
                                    </label>
                                    <input
                                        id="gkAdjust"
                                        type="range"
                                        min={5}
                                        max={20}
                                        step={1}
                                        value={gkAdjustmentPct}
                                        onChange={(e) => setGkAdjustmentPct(Number(e.target.value))}
                                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                </div>
                                <div className="flex items-center gap-2 pt-2 sm:pt-0">
                                    <input
                                        id="gkSkipLoss"
                                        type="checkbox"
                                        className="h-3.5 w-3.5 rounded text-blue-600 accent-blue-600 cursor-pointer"
                                        checked={gkSkipInflationOnLoss}
                                        onChange={(e) => setGkSkipInflationOnLoss(e.target.checked)}
                                    />
                                    <label htmlFor="gkSkipLoss" className="text-[11px] font-semibold text-slate-600 cursor-pointer select-none">
                                        Skip inflation after a loss year
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Render Area (Chart or Table) */}
                <div className="pt-4 border-t border-slate-100">
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={handleDownloadCsv}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors shadow-sm"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                            </svg>
                            Export to CSV
                        </button>
                    </div>

                    <div className="w-full min-h-[300px] flex items-center justify-center">
                        {showTable ? (
                            <PensionTable data={chartData} />
                        ) : (
                            <PensionChart data={chartData}/>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function downloadCsv(data: ChartData[], filename: string) {
    const headers = ["Age", "Remaining Pot Value (£)", "Cumulative Contributions (£)", "Growth Accumulation (£)", "Cumulative Withdrawals (£)", "Cumulative Pension Income (£)"];
    const rows = data.map(row => [
        row.year,
        row.value.toFixed(0),
        row.contributions.toFixed(0),
        row.growth.toFixed(0),
        row.withdrawals.toFixed(0),
        row.pensionIncome.toFixed(0),
    ]);

    const csvContent = [
        headers.join(","),
        ...rows.map(e => e.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}