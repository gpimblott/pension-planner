"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Results from "./Results";

/**
 * A form for inputting pension planning data.
 *
 * This component renders a form with various input fields for pension planning,
 * including current age, retirement age, current pension pot, contributions,
 * expected return, and a list of pensions. It also renders the `Results`
 * component, passing the input data to it.
 *
 * @returns {JSX.Element} The rendered form and results.
 */
export default function InputForm() {
    /**
     * The user's current age.
     */
    const [currentAge, setCurrentAge] = useState(30);
    /**
     * The user's desired retirement age.
     */
    const [retirementAge, setRetirementAge] = useState(65);
    /**
     * The user's current pension pot value.
     */
    const [currentPot, setCurrentPot] = useState(50000);
    /**
     * The user's monthly contribution to their pension.
     */
    const [monthlyContribution, setMonthlyContribution] = useState(500);
    /**
     * The employer's monthly contribution to the user's pension.
     */
    const [employerContribution, setEmployerContribution] = useState(250);
    /**
     * The expected annual return on the pension pot.
     */
    const [expectedReturn, setExpectedReturn] = useState(5);
    /**
     * An array of pension objects, each with a name, amount, start age, and inflation link status.
     */
    const [pensions, setPensions] = useState([
        { name: "State Pension", amount: 11500, startAge: 67, isInflationLinked: true },
    ]);

    const [lumpSumEnabled, setLumpSumEnabled] = useState(false);
    const [lumpSumType, setLumpSumType] = useState<'percentage' | 'fixed'>('percentage');
    const [lumpSumPct, setLumpSumPct] = useState(25);
    const [lumpSumAmount, setLumpSumAmount] = useState(25000);

    useEffect(() => {
        const savedData = Cookies.get("pensionPlannerData");
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                const { currentAge, retirementAge, currentPot, monthlyContribution, employerContribution, expectedReturn, pensions, lumpSumEnabled, lumpSumType, lumpSumPct, lumpSumAmount } = parsed;
                setCurrentAge(currentAge ?? 30);
                setRetirementAge(retirementAge ?? 65);
                setCurrentPot(currentPot ?? 50000);
                setMonthlyContribution(monthlyContribution ?? 500);
                setEmployerContribution(employerContribution ?? 250);
                setExpectedReturn(expectedReturn ?? 5);
                setLumpSumEnabled(lumpSumEnabled ?? false);
                setLumpSumType(lumpSumType ?? 'percentage');
                setLumpSumPct(lumpSumPct ?? 25);
                setLumpSumAmount(lumpSumAmount ?? 25000);
                
                // Ensure loaded pensions have isInflationLinked field, defaulting to true
                if (Array.isArray(pensions)) {
                    setPensions(pensions.map(p => ({
                        ...p,
                        isInflationLinked: p.isInflationLinked ?? true
                    })));
                }
            } catch (e) {
                console.error("Failed to parse saved pension planner data", e);
            }
        }
    }, []);

    useEffect(() => {
        const dataToSave = {
            currentAge,
            retirementAge,
            currentPot,
            monthlyContribution,
            employerContribution,
            expectedReturn,
            pensions,
            lumpSumEnabled,
            lumpSumType,
            lumpSumPct,
            lumpSumAmount,
        };
        Cookies.set("pensionPlannerData", JSON.stringify(dataToSave), { expires: 365 });
    }, [currentAge, retirementAge, currentPot, monthlyContribution, employerContribution, expectedReturn, pensions, lumpSumEnabled, lumpSumType, lumpSumPct, lumpSumAmount]);

    /**
     * A higher-order function that returns a change event handler for a number input.
     *
     * @param setter - The state setter function to call with the new number value.
     * @returns A function that handles the change event of a number input.
     */
    const handleNumberInput = (setter: (value: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === "" || value === "-") {
            setter(0);
        } else {
            const numValue = Number(value);
            if (!isNaN(numValue)) {
                setter(numValue);
            }
        }
    };

    /**
     * Handles changes to a pension in the pensions array.
     */
    const handlePensionChange = (index: number, field: string, value: string | number | boolean) => {
        const newPensions = [...pensions];
        if (typeof value === 'string' && field !== 'name') {
            if (value === "" || value === "-") {
                newPensions[index] = { ...newPensions[index], [field]: 0 };
            } else {
                const numValue = Number(value);
                if (!isNaN(numValue)) {
                    newPensions[index] = { ...newPensions[index], [field]: numValue };
                }
            }
        } else {
            newPensions[index] = { ...newPensions[index], [field]: value };
        }
        setPensions(newPensions);
    };

    /**
     * Adds a new pension to the pensions array.
     */
    const addPension = () => {
        setPensions([...pensions, { name: "Private Pension", amount: 5000, startAge: 65, isInflationLinked: true }]);
    };

    /**
     * Removes a pension from the pensions array.
     */
    const removePension = (index: number) => {
        const newPensions = [...pensions];
        newPensions.splice(index, 1);
        setPensions(newPensions);
    };

    /**
     * Resets all form values to their default states and deletes the saved cookie.
     */
    const resetForm = () => {
        Cookies.remove("pensionPlannerData");
        setCurrentAge(30);
        setRetirementAge(65);
        setCurrentPot(50000);
        setMonthlyContribution(500);
        setEmployerContribution(250);
        setExpectedReturn(5);
        setPensions([{ name: "State Pension", amount: 11500, startAge: 67, isInflationLinked: true }]);
        setLumpSumEnabled(false);
        setLumpSumType('percentage');
        setLumpSumPct(25);
        setLumpSumAmount(25000);
    };

    return (
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Input Form Section (Left Column) */}
            <div className="lg:col-span-5 bg-white rounded-2xl shadow-xl border border-slate-100 p-6 space-y-6">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        Your Details
                    </h2>
                    <button
                        type="button"
                        onClick={resetForm}
                        className="text-xs text-slate-400 hover:text-red-500 font-medium transition-colors flex items-center gap-1"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.253 8H18"></path>
                        </svg>
                        Reset Form
                    </button>
                </div>

                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Current Age */}
                        <div className="space-y-1.5">
                            <label htmlFor="currentAgeInput" className="block text-xs font-semibold text-slate-700">
                                Current Age
                            </label>
                            <input
                                id="currentAgeInput"
                                type="number"
                                value={currentAge ?? ""}
                                onChange={handleNumberInput(setCurrentAge)}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all font-medium text-slate-800"
                                min="18"
                                max="100"
                            />
                            <p className="text-[11px] text-slate-500">{currentAge} years old</p>
                        </div>

                        {/* Retirement Age */}
                        <div className="space-y-1.5">
                            <label htmlFor="retirementAgeInput" className="block text-xs font-semibold text-slate-700">
                                Retirement Age
                            </label>
                            <input
                                id="retirementAgeInput"
                                type="number"
                                value={retirementAge ?? ""}
                                onChange={handleNumberInput(setRetirementAge)}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all font-medium text-slate-800"
                                min="50"
                                max="100"
                            />
                            <p className="text-[11px] text-slate-500">{retirementAge} years old</p>
                        </div>

                        {/* Current Pot */}
                        <div className="space-y-1.5">
                            <label htmlFor="currentPotInput" className="block text-xs font-semibold text-slate-700">
                                Current Pension Pot
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-medium">£</span>
                                <input
                                    id="currentPotInput"
                                    type="number"
                                    value={currentPot ?? ""}
                                    onChange={handleNumberInput(setCurrentPot)}
                                    className="w-full pl-7 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all font-medium text-slate-800"
                                    min="0"
                                    step="1000"
                                />
                            </div>
                            <p className="text-[11px] text-slate-500">£{currentPot.toLocaleString()}</p>
                        </div>

                        {/* Expected Return */}
                        <div className="space-y-1.5">
                            <label htmlFor="expectedReturnInput" className="block text-xs font-semibold text-slate-700">
                                Expected Return (Pre-Retirement)
                            </label>
                            <div className="relative">
                                <input
                                    id="expectedReturnInput"
                                    type="number"
                                    value={expectedReturn ?? ""}
                                    onChange={handleNumberInput(setExpectedReturn)}
                                    className="w-full pr-7 pl-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all font-medium text-slate-800"
                                    min="0"
                                    max="20"
                                    step="0.5"
                                />
                                <span className="absolute right-3 top-2.5 text-slate-400 text-xs font-medium">%</span>
                            </div>
                            <div className="flex gap-1.5 mt-1.5">
                                {[
                                    { label: "Cons (3%)", val: 3 },
                                    { label: "Bal (5%)", val: 5 },
                                    { label: "Aggr (7%)", val: 7 }
                                ].map((preset) => (
                                    <button
                                        key={preset.val}
                                        type="button"
                                        onClick={() => setExpectedReturn(preset.val)}
                                        className={`px-2 py-0.5 text-[10px] font-semibold rounded border transition-all ${
                                            expectedReturn === preset.val
                                                ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300"
                                        }`}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Monthly Contribution */}
                        <div className="space-y-1.5">
                            <label htmlFor="monthlyContributionInput" className="block text-xs font-semibold text-slate-700">
                                Your Monthly Contribution
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-medium">£</span>
                                <input
                                    id="monthlyContributionInput"
                                    type="number"
                                    value={monthlyContribution ?? ""}
                                    onChange={handleNumberInput(setMonthlyContribution)}
                                    className="w-full pl-7 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all font-medium text-slate-800"
                                    min="0"
                                    step="50"
                                />
                            </div>
                            <p className="text-[11px] text-slate-500">£{monthlyContribution.toLocaleString()}/mo</p>
                        </div>

                        {/* Employer Contribution */}
                        <div className="space-y-1.5">
                            <label htmlFor="employerContributionInput" className="block text-xs font-semibold text-slate-700">
                                Employer Contribution
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-medium">£</span>
                                <input
                                    id="employerContributionInput"
                                    type="number"
                                    value={employerContribution ?? ""}
                                    onChange={handleNumberInput(setEmployerContribution)}
                                    className="w-full pl-7 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all font-medium text-slate-800"
                                    min="0"
                                    step="50"
                                />
                            </div>
                            <p className="text-[11px] text-slate-500">£{employerContribution.toLocaleString()}/mo</p>
                        </div>
                    </div>

                    {/* Additional Pensions Section */}
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                Additional Pensions
                            </h3>
                            <button
                                type="button"
                                onClick={addPension}
                                className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors flex items-center gap-1"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                                Add Pension
                            </button>
                        </div>

                        {pensions.length > 0 ? (
                            <div className="space-y-3">
                                {/* Header Row */}
                                <div className="grid grid-cols-[1.8fr_1fr_0.9fr_1fr_auto] gap-2 px-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden sm:grid">
                                    <div>Name</div>
                                    <div>Amount (p.a.)</div>
                                    <div>Starts</div>
                                    <div className="text-center">Inflation?</div>
                                    <div></div>
                                </div>

                                {pensions.map((pension, index) => (
                                    <div
                                        key={index}
                                        className="grid grid-cols-1 sm:grid-cols-[1.8fr_1fr_0.9fr_1fr_auto] gap-2 items-center p-3 sm:p-0 bg-slate-50 sm:bg-transparent rounded-lg border border-slate-100 sm:border-0"
                                    >
                                        {/* Pension Name */}
                                        <div className="space-y-1 sm:space-y-0">
                                            <span className="text-[10px] font-bold text-slate-400 block sm:hidden">Pension Name</span>
                                            <input
                                                type="text"
                                                value={pension.name}
                                                onChange={(e) => handlePensionChange(index, 'name', e.target.value)}
                                                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                                placeholder="State Pension"
                                            />
                                        </div>

                                        {/* Pension Amount */}
                                        <div className="space-y-1 sm:space-y-0">
                                            <span className="text-[10px] font-bold text-slate-400 block sm:hidden">Annual Amount (£)</span>
                                            <div className="relative">
                                                <span className="absolute left-2 top-2 text-slate-400 text-2xs font-semibold">£</span>
                                                <input
                                                    type="number"
                                                    value={pension.amount ?? ""}
                                                    onChange={(e) => handlePensionChange(index, 'amount', e.target.value)}
                                                    className="w-full pl-4.5 pr-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                                    placeholder="11500"
                                                />
                                            </div>
                                        </div>

                                        {/* Start Age */}
                                        <div className="space-y-1 sm:space-y-0">
                                            <span className="text-[10px] font-bold text-slate-400 block sm:hidden">Start Age</span>
                                            <input
                                                type="number"
                                                value={pension.startAge ?? ""}
                                                onChange={(e) => handlePensionChange(index, 'startAge', e.target.value)}
                                                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                                placeholder="67"
                                                min="18"
                                                max="100"
                                            />
                                        </div>

                                        {/* Inflation Link Toggle */}
                                        <div className="flex items-center sm:justify-center gap-2 sm:gap-0 pt-1 sm:pt-0">
                                            <span className="text-[10px] font-bold text-slate-400 block sm:hidden">Inflation-linked?</span>
                                            <input
                                                type="checkbox"
                                                checked={pension.isInflationLinked ?? true}
                                                onChange={(e) => handlePensionChange(index, 'isInflationLinked', e.target.checked)}
                                                className="h-3.5 w-3.5 rounded text-blue-600 focus:ring-blue-500/20 border-slate-300"
                                            />
                                        </div>

                                        {/* Remove Button */}
                                        <div className="flex justify-end pt-2 sm:pt-0">
                                            <button
                                                type="button"
                                                onClick={() => removePension(index)}
                                                className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                                                title="Remove Pension"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-xs text-slate-400">
                                No additional pensions configured. Click "Add Pension" to add state or private pensions.
                            </div>
                        )}
                    </div>

                    {/* Lump Sum at Retirement Section */}
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                        <div className="flex items-center gap-2">
                            <input
                                id="lumpSumToggle"
                                type="checkbox"
                                className="h-4 w-4 accent-blue-600 rounded cursor-pointer"
                                checked={lumpSumEnabled}
                                onChange={(e) => setLumpSumEnabled(e.target.checked)}
                            />
                            <label htmlFor="lumpSumToggle" className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer select-none">
                                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm0 0h4m-4 0h-4m0 0v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2z"></path>
                                </svg>
                                Take Lump Sum at Retirement?
                            </label>
                        </div>

                        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                            lumpSumEnabled ? 'max-h-96 opacity-100 bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4' : 'max-h-0 opacity-0'
                        }`}>
                            <div className="space-y-2">
                                <span className="block text-2xs font-bold text-slate-500 uppercase tracking-wider">Lump Sum Calculation Type</span>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-650 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="lumpSumType"
                                            value="percentage"
                                            checked={lumpSumType === 'percentage'}
                                            onChange={() => setLumpSumType('percentage')}
                                            className="accent-blue-600 h-3.5 w-3.5"
                                        />
                                        Percentage of Pot
                                    </label>
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-650 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="lumpSumType"
                                            value="fixed"
                                            checked={lumpSumType === 'fixed'}
                                            onChange={() => setLumpSumType('fixed')}
                                            className="accent-blue-600 h-3.5 w-3.5"
                                        />
                                        Fixed Cash Amount
                                    </label>
                                </div>
                            </div>

                            {lumpSumType === 'percentage' ? (
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center text-xs">
                                        <label htmlFor="lumpSumPctSlider" className="font-semibold text-slate-700">
                                            Percentage: {lumpSumPct}%
                                        </label>
                                        <span className="text-[10px] text-slate-400 font-semibold">(25% is standard tax-free cash limit)</span>
                                    </div>
                                    <input
                                        id="lumpSumPctSlider"
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="1"
                                        value={lumpSumPct}
                                        onChange={(e) => setLumpSumPct(Number(e.target.value))}
                                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    <label htmlFor="lumpSumAmountInput" className="block text-xs font-semibold text-slate-700">
                                        Cash Amount (£)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-slate-400 text-xs font-medium">£</span>
                                        <input
                                            id="lumpSumAmountInput"
                                            type="number"
                                            value={lumpSumAmount ?? ""}
                                            onChange={handleNumberInput(setLumpSumAmount)}
                                            className="w-full pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium text-slate-800"
                                            min="0"
                                            step="5000"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400">Specify the nominal cash sum to take at retirement.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            {/* Results Section (Right Column) */}
            <div className="lg:col-span-7 space-y-6">
                <Results
                    currentAge={currentAge}
                    retirementAge={retirementAge}
                    currentPot={currentPot}
                    monthlyContribution={monthlyContribution}
                    employerContribution={employerContribution}
                    expectedReturn={expectedReturn}
                    pensions={pensions}
                    lumpSumType={lumpSumEnabled ? lumpSumType : undefined}
                    lumpSumPct={lumpSumPct}
                    lumpSumAmount={lumpSumAmount}
                />
            </div>
        </div>
    );
}