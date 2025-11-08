import { describe, it, expect } from 'vitest';
import { calculatePension } from '../src/lib/pensionCalculator';

function baseInput(overrides: Partial<Parameters<typeof calculatePension>[0]> = {}) {
  return {
    currentAge: 64,
    pensionPotValue: 1_000_000,
    retirementAge: 65,
    lifeExpectancy: 70,
    annualRetirementSpending: 60_000,
    preRetirementGrowth: 0,
    postRetirementGrowth: 0,
    inflationRate: 0,
    pensions: [],
    annualPreRetirementIncome: 0,
    contributionRate: 100,
    ...overrides,
  };
}

// Helper to get a datapoint by age
function getAge(data: Array<{ age: number }>, age: number) {
  const dp = data.find(d => d.age === age);
  if (!dp) throw new Error(`No datapoint for age ${age}`);
  return dp as any;
}

describe('Guyton–Klinger guardrails', () => {
  it('cuts spending by adjustmentPct when WR breaches upper guardrail', () => {
    const input = baseInput({
      annualRetirementSpending: 90_000, // 9% of 1,000,000
      gkEnabled: true,
      gk: { bandWidthPct: 20, adjustmentPct: 10, skipInflationOnLoss: true },
    });
    const data = calculatePension(input);
    const y1 = getAge(data, input.retirementAge + 1);
    // 9% > 6% * 1.2 (=7.2%), so spending cut by 10% -> 81,000
    expect(Math.round(y1.spendingThisYear)).toBe(81_000);
    // Withdrawal rate recorded ~ 0.09 before cut (computed before adjustment)
    expect(y1.withdrawalRate).toBeCloseTo(0.09, 5);
  });

  it('raises spending by adjustmentPct when WR breaches lower guardrail', () => {
    const input = baseInput({
      annualRetirementSpending: 20_000, // 2% of 1,000,000
      gkEnabled: true,
      gk: { bandWidthPct: 20, adjustmentPct: 10, skipInflationOnLoss: true },
    });
    const data = calculatePension(input);
    const y1 = getAge(data, input.retirementAge + 1);
    // 2% < 6% * 0.8 (=4.8%), so spending raised by 10% -> 22,000
    expect(Math.round(y1.spendingThisYear)).toBe(22_000);
  });
});

describe('Inflation rule (skip after loss year)', () => {
  it('skips inflation when prior real return is negative and option enabled', () => {
    const input = baseInput({
      annualRetirementSpending: 50_000,
      postRetirementGrowth: 2, // nominal 2%
      inflationRate: 3,        // real -1%
      gkEnabled: true,
      gk: { skipInflationOnLoss: true },
    });
    const data = calculatePension(input);
    const y1 = getAge(data, input.retirementAge + 1);
    // First post-ret year should NOT inflate (skip)
    expect(Math.round(y1.spendingThisYear)).toBe(50_000);
  });

  it('applies inflation when skipInflationOnLoss is false', () => {
    const input = baseInput({
      annualRetirementSpending: 50_000,
      postRetirementGrowth: 2, // nominal 2%
      inflationRate: 3,        // real -1%
      gkEnabled: true,
      gk: { skipInflationOnLoss: false },
    });
    const data = calculatePension(input);
    const y1 = getAge(data, input.retirementAge + 1);
    // Inflation applied at start of first post-ret year
    expect(Math.round(y1.spendingThisYear)).toBe(51_500);
  });
});

describe('Pension income timing (inclusive startAge)', () => {
  it('adds pension income from the year startAge is reached (>=)', () => {
    const input = baseInput({
      retirementAge: 66,
      pensions: [{ name: 'State', amount: 10_000, startAge: 67 }],
      annualRetirementSpending: 0,
      postRetirementGrowth: 0,
      inflationRate: 0,
    });
    const data = calculatePension(input);
    const y67 = getAge(data, 67); // first post-ret year is 67 here
    expect(Math.round((y67 as any).pensionIncomeThisYear || 0)).toBe(0);
    const y68 = getAge(data, 68);
    expect(Math.round((y68 as any).pensionIncomeThisYear || 0)).toBe(10_000);
  });
});
