

"use client";

import { useState } from "react";
import Results from "./Results";

export default function InputForm() {
    const [currentAge, setCurrentAge] = useState(30);
    const [retirementAge, setRetirementAge] = useState(65);
    const [currentPot, setCurrentPot] = useState(50000);
    const [monthlyContribution, setMonthlyContribution] = useState(500);
    const [employerContribution, setEmployerContribution] = useState(250);
    const [expectedReturn, setExpectedReturn] = useState(5);
    const [pensions, setPensions] = useState([
        { name: "State Pension", amount: 11500, startAge: 67 },
    ]);

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

    const handlePensionChange = (index: number, field: string, value: string | number) => {
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

    const addPension = () => {
        setPensions([...pensions, { name: "Private Pension", amount: 0, startAge: 65 }]);
    };

    return (
        <div className="w-full grid grid-rows-auto gap-6">
            {/* Input Form Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    Your Details
                </h2>

                <form className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Current Age */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Current Age
                            </label>
                            <input
                                type="number"
                                value={currentAge || ""}
                                onChange={handleNumberInput(setCurrentAge)}
                                className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                                min="18"
                                max="100"
                            />
                            <p className="text-xs text-gray-500">{currentAge} years</p>
                        </div>

                        {/* Retirement Age */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Retirement Age
                            </label>
                            <input
                                type="number"
                                value={retirementAge || ""}
                                onChange={handleNumberInput(setRetirementAge)}
                                className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                                min="50"
                                max="100"
                            />
                            <p className="text-xs text-gray-500">{retirementAge} years</p>
                        </div>

                        {/* Current Pot */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Current Pension Pot
                            </label>
                            <input
                                type="number"
                                value={currentPot || ""}
                                onChange={handleNumberInput(setCurrentPot)}
                                className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                                min="0"
                                step="1000"
                            />
                            <p className="text-xs text-gray-500">£{currentPot.toLocaleString()}</p>
                        </div>

                        {/* Monthly Contribution */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Your Monthly Contribution
                            </label>
                            <input
                                type="number"
                                value={monthlyContribution || ""}
                                onChange={handleNumberInput(setMonthlyContribution)}
                                className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                                min="0"
                                step="50"
                            />
                            <p className="text-xs text-gray-500">£{monthlyContribution.toLocaleString()}/mo</p>
                        </div>

                        {/* Employer Contribution */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Employer Contribution
                            </label>
                            <input
                                type="number"
                                value={employerContribution || ""}
                                onChange={handleNumberInput(setEmployerContribution)}
                                className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                                min="0"
                                step="50"
                            />
                            <p className="text-xs text-gray-500">£{employerContribution.toLocaleString()}/mo</p>
                        </div>

                        {/* Expected Return */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Expected Annual Return
                            </label>
                            <input
                                type="number"
                                value={expectedReturn || ""}
                                onChange={handleNumberInput(setExpectedReturn)}
                                className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                                min="0"
                                max="20"
                                step="0.5"
                            />
                            <p className="text-xs text-gray-500">{expectedReturn}% p.a.</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold mb-2 text-gray-800">Pensions</h3>
                        {pensions.map((pension, index) => (
                            <div key={index} className="grid grid-cols-3 gap-4 mb-2">
                                <input
                                    type="text"
                                    value={pension.name}
                                    onChange={(e) => handlePensionChange(index, 'name', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                                    readOnly={index === 0}
                                />
                                <input
                                    type="number"
                                    value={pension.amount || ""}
                                    onChange={(e) => handlePensionChange(index, 'amount', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                                />
                                <input
                                    type="number"
                                    value={pension.startAge || ""}
                                    onChange={(e) => handlePensionChange(index, 'startAge', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                                />
                            </div>
                        ))}
                        <button type="button" onClick={addPension} className="text-sm text-blue-600 hover:underline">Add another pension</button>
                    </div>
                </form>
            </div>

            {/* Results Section */}
            <Results
                currentAge={currentAge}
                retirementAge={retirementAge}
                currentPot={currentPot}
                monthlyContribution={monthlyContribution}
                employerContribution={employerContribution}
                expectedReturn={expectedReturn}
                pensions={pensions}
            />
        </div>
    );
}