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
      postRetirementGrowth: -20, // force pot down by 20%
      gkEnabled: true,
      gk: { bandWidthPct: 20, adjustmentPct: 10, skipInflationOnLoss: true },
    });
    const data = calculatePension(input);
    const y2 = getAge(data, input.retirementAge + 2); // check year 2 (age 67)
    // Age 66: WR is 9% (no breach). Pot drops from 910k to 728k.
    // Age 67: WR is 90k / 728k = 12.36%. Upper guardrail is 9% * 1.2 = 10.8%.
    // Breach! Cut spending by 10% -> 81,000
    expect(Math.round(y2.spendingThisYear)).toBe(81_000);
    expect(y2.withdrawalRate).toBeCloseTo(90000 / 728000, 5);
  });

  it('raises spending by adjustmentPct when WR breaches lower guardrail', () => {
    const input = baseInput({
      annualRetirementSpending: 20_000, // 2% of 1,000,000
      postRetirementGrowth: 30, // force pot up by 30%
      gkEnabled: true,
      gk: { bandWidthPct: 20, adjustmentPct: 10, skipInflationOnLoss: true },
    });
    const data = calculatePension(input);
    const y2 = getAge(data, input.retirementAge + 2); // check year 2 (age 67)
    // Age 66: WR is 2%. Pot grows from 980k to 1,274,000.
    // Age 67: WR is 20k / 1,274,000 = 1.57%. Lower guardrail is 2% * 0.8 = 1.6%.
    // Breach! Raise spending by 10% -> 22,000
    expect(Math.round(y2.spendingThisYear)).toBe(22_000);
  });
});

describe('Inflation rule (skip after loss year)', () => {
  it('skips inflation when prior real return is negative and option enabled', () => {
    const input = baseInput({
      currentAge: 65,
      retirementAge: 65,
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
      currentAge: 65,
      retirementAge: 65,
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
    expect(Math.round((y67 as any).pensionIncomeThisYear || 0)).toBe(10_000);
    const y68 = getAge(data, 68);
    expect(Math.round((y68 as any).pensionIncomeThisYear || 0)).toBe(10_000);
  });
});

describe('Pension inflation linking', () => {
  it('inflates inflation-linked pensions over time', () => {
    const input = baseInput({
      currentAge: 65,
      retirementAge: 66,
      pensions: [
        { name: 'Linked Pension', amount: 10_000, startAge: 68, isInflationLinked: true },
        { name: 'Flat Pension', amount: 10_000, startAge: 68, isInflationLinked: false }
      ],
      annualRetirementSpending: 0,
      postRetirementGrowth: 0,
      inflationRate: 3, // 3% inflation
    });
    const data = calculatePension(input);
    const y68 = getAge(data, 68);
    // At age 68, 3 years have elapsed since currentAge (65).
    // Linked Pension: 10,000 * (1.03)^3 = 10,927.27
    // Flat Pension: 10,000
    // Total pension income: 20,927
    expect(Math.round((y68 as any).pensionIncomeThisYear || 0)).toBe(20_927);
  });
});

describe('Retirement lump sum withdrawal', () => {
  it('deducts a percentage-based lump sum at retirement age', () => {
    const input = baseInput({
      pensionPotValue: 1_000_000,
      retirementAge: 65,
      preRetirementGrowth: 0,
      lumpSumType: 'percentage',
      lumpSumPct: 25, // 25% of 1M = 250k
    });
    const data = calculatePension(input);
    const retDatapoint = getAge(data, 65);
    expect(retDatapoint.potValue).toBe(750_000);
    expect(retDatapoint.lumpSumTaken).toBe(250_000);
  });

  it('deducts a fixed lump sum at retirement age', () => {
    const input = baseInput({
      pensionPotValue: 1_000_000,
      retirementAge: 65,
      preRetirementGrowth: 0,
      lumpSumType: 'fixed',
      lumpSumAmount: 100_000, // 100k
    });
    const data = calculatePension(input);
    const retDatapoint = getAge(data, 65);
    expect(retDatapoint.potValue).toBe(900_000);
    expect(retDatapoint.lumpSumTaken).toBe(100_000);
  });

  it('updates the retirement pot value when the lump sum amount is changed', () => {
    const input1 = baseInput({
      pensionPotValue: 1_000_000,
      retirementAge: 65,
      preRetirementGrowth: 0,
      lumpSumType: 'fixed',
      lumpSumAmount: 100_000,
    });
    const input2 = baseInput({
      pensionPotValue: 1_000_000,
      retirementAge: 65,
      preRetirementGrowth: 0,
      lumpSumType: 'fixed',
      lumpSumAmount: 200_000,
    });
    const data1 = calculatePension(input1);
    const data2 = calculatePension(input2);
    
    expect(getAge(data1, 65).potValue).toBe(900_000);
    expect(getAge(data2, 65).potValue).toBe(800_000);
  });
});

describe('Phased retirement spending profile', () => {
  it('applies early, mid, and late retirement spending levels correctly', () => {
    const input = baseInput({
      currentAge: 65,
      retirementAge: 65,
      lifeExpectancy: 90,
      spendingProfileType: 'phased',
      earlyRetirementSpending: 50_000,
      earlyRetirementDuration: 10,
      midRetirementSpending: 30_000,
      midRetirementDuration: 10,
      lateRetirementSpending: 10_000,
      inflationRate: 0,
    });
    const data = calculatePension(input);

    const y1 = getAge(data, 66);
    expect(y1.spendingThisYear).toBe(50_000);
    const y10 = getAge(data, 75);
    expect(y10.spendingThisYear).toBe(50_000);

    const y11 = getAge(data, 76);
    expect(y11.spendingThisYear).toBe(30_000);
    const y20 = getAge(data, 85);
    expect(y20.spendingThisYear).toBe(30_000);

    const y21 = getAge(data, 86);
    expect(y21.spendingThisYear).toBe(10_000);
    const y25 = getAge(data, 90);
    expect(y25.spendingThisYear).toBe(10_000);
  });

  it('inflates early, mid, and late spending levels from currentAge', () => {
    const input = baseInput({
      currentAge: 55,
      retirementAge: 65,
      lifeExpectancy: 80,
      spendingProfileType: 'phased',
      earlyRetirementSpending: 50_000,
      earlyRetirementDuration: 5,
      midRetirementSpending: 30_000,
      midRetirementDuration: 5,
      lateRetirementSpending: 10_000,
      inflationRate: 2,
    });
    const data = calculatePension(input);

    const y1 = getAge(data, 66);
    expect(Math.round(y1.spendingThisYear)).toBe(62169);

    const y6 = getAge(data, 71);
    expect(Math.round(y6.spendingThisYear)).toBe(41184);

    const y11 = getAge(data, 76);
    expect(Math.round(y11.spendingThisYear)).toBe(15157);
  });
});

