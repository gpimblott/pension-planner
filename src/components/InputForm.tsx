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
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
  };

  return (
    <div className="w-full space-y-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
        <h2 className="text-3xl font-bold mb-8 text-gray-800 flex items-center">
          <span className="text-4xl mr-3">📊</span>
          Enter Your Details
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Current Age */}
            <div className="space-y-3">
              <label className="block text-lg font-semibold text-gray-700">
                Current Age
              </label>
              <input
                type="number"
                value={currentAge}
                onChange={(e) => setCurrentAge(Number(e.target.value))}
                className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                min="18"
                max="100"
              />
              <p className="text-sm text-gray-500">Age: {currentAge} years</p>
            </div>

            {/* Retirement Age */}
            <div className="space-y-3">
              <label className="block text-lg font-semibold text-gray-700">
                Retirement Age
              </label>
              <input
                type="number"
                value={retirementAge}
                onChange={(e) => setRetirementAge(Number(e.target.value))}
                className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                min="50"
                max="100"
              />
              <p className="text-sm text-gray-500">Retire at: {retirementAge} years</p>
            </div>

            {/* Current Pot */}
            <div className="space-y-3">
              <label className="block text-lg font-semibold text-gray-700">
                Current Pension Pot (£)
              </label>
              <input
                type="number"
                value={currentPot}
                onChange={(e) => setCurrentPot(Number(e.target.value))}
                className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                min="0"
                step="1000"
              />
              <p className="text-sm text-gray-500">£{currentPot.toLocaleString()}</p>
            </div>

            {/* Monthly Contribution */}
            <div className="space-y-3">
              <label className="block text-lg font-semibold text-gray-700">
                Your Monthly Contribution (£)
              </label>
              <input
                type="number"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                min="0"
                step="50"
              />
              <p className="text-sm text-gray-500">£{monthlyContribution.toLocaleString()} per month</p>
            </div>

            {/* Employer Contribution */}
            <div className="space-y-3">
              <label className="block text-lg font-semibold text-gray-700">
                Employer Contribution (£)
              </label>
              <input
                type="number"
                value={employerContribution}
                onChange={(e) => setEmployerContribution(Number(e.target.value))}
                className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                min="0"
                step="50"
              />
              <p className="text-sm text-gray-500">£{employerContribution.toLocaleString()} per month</p>
            </div>

            {/* Expected Return */}
            <div className="space-y-3">
              <label className="block text-lg font-semibold text-gray-700">
                Expected Annual Return (%)
              </label>
              <input
                type="number"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(Number(e.target.value))}
                className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                min="0"
                max="20"
                step="0.5"
              />
              <p className="text-sm text-gray-500">{expectedReturn}% annual growth</p>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              className="w-full md:w-auto px-12 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Calculate My Pension 🚀
            </button>
          </div>
        </form>
      </div>

      {showResults && (
        <Results
          currentAge={currentAge}
          retirementAge={retirementAge}
          currentPot={currentPot}
          monthlyContribution={monthlyContribution}
          employerContribution={employerContribution}
          expectedReturn={expectedReturn}
        />
      )}
    </div>
  );
}