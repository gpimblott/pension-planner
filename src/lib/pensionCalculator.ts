/**
 * Represents a single pension.
 */
interface Pension {
    /** The name of the pension. */
    name: string;
    /** The annual amount of the pension. */
    amount: number;
    /** The age at which the pension starts. */
    startAge: number;
    /** Whether the pension is inflation-linked. */
    isInflationLinked?: boolean;
}

/**
 * Represents the input for the pension calculation.
 */
interface PensionInput {
    /** The user's current age. */
    currentAge: number;
    /** The current value of the user's pension pot. */
    pensionPotValue: number;
    /** The desired retirement age. */
    retirementAge: number;
    /** The user's life expectancy. */
    lifeExpectancy: number;
    /** The desired annual spending in retirement. */
    annualRetirementSpending: number;
    /** The expected annual growth rate of the pension pot before retirement. */
    preRetirementGrowth: number; // percentage
    /** The expected annual growth rate of the pension pot after retirement. */
    postRetirementGrowth: number; // percentage
    /** The expected annual inflation rate. */
    inflationRate: number; // percentage
    /** An array of pension objects. */
    pensions: Pension[];
    /** The total annual income contributed to the pension before retirement. */
    annualPreRetirementIncome: number; // Now required
    /** The percentage of the annual income contributed to the pension. */
    contributionRate: number; // Now required
    /** Lump sum type to take at retirement ('percentage' or 'fixed'). */
    lumpSumType?: 'percentage' | 'fixed';
    /** Lump sum percentage (e.g. 25 for 25% tax-free). */
    lumpSumPct?: number;
    /** Fixed cash lump sum amount. */
    lumpSumAmount?: number;
    /** Spending profile type ('constant' | 'phased'). */
    spendingProfileType?: 'constant' | 'phased';
    /** Spending amount during early retirement phase. */
    earlyRetirementSpending?: number;
    /** Duration of the early retirement phase in years. */
    earlyRetirementDuration?: number;
    /** Spending amount during mid retirement phase. */
    midRetirementSpending?: number;
    /** Duration of the mid retirement phase in years. */
    midRetirementDuration?: number;
    /** Spending amount during late retirement phase. */
    lateRetirementSpending?: number;
    /** Enable dynamic withdrawals using Guyton–Klinger rules. */
    gkEnabled?: boolean;
    /** Optional Guyton–Klinger parameters. Percent values, e.g., 20 for 20%. */
    gk?: {
        /** Band width around the initial withdrawal rate. Default 20 (%). */
        bandWidthPct?: number;
        /** Spending adjustment step when a guardrail is breached. Default 10 (%). */
        adjustmentPct?: number;
        /** Skip inflation increases after a loss year. Default true. */
        skipInflationOnLoss?: boolean;
    };
}

/**
 * Represents a single data point in the pension projection.
 */
interface PensionDataPoint {
    /** The age at this data point. */
    age: number;
    /** The value of the pension pot at this data point (end of year). */
    potValue: number;
    /** Start-of-year pot value before cashflows for this age. */
    startOfYearPot?: number;
    /** Spending applied at start of the year (post-retirement). */
    spendingThisYear?: number;
    /** Total pension income received at start of the year. */
    pensionIncomeThisYear?: number;
    /** Withdrawal rate computed as spending / start-of-year pot. */
    withdrawalRate?: number;
    /** Lump sum cash taken at this age (at retirement). */
    lumpSumTaken?: number;
}

/**
 * Calculates the pension projection based on the user's input.
 *
 * @param input - The user's pension planning data.
 * @returns An array of data points representing the pension projection over time.
 */
export function calculatePension(input: PensionInput): PensionDataPoint[] {
    const data: PensionDataPoint[] = [{age: input.currentAge, potValue: input.pensionPotValue}];
    let currentPotValue = input.pensionPotValue;
    // Inflate constant annual retirement spending pre-retirement (from currentAge to retirementAge)
    let currentAnnualSpending = input.annualRetirementSpending * Math.pow(1 + input.inflationRate / 100, input.retirementAge - input.currentAge);

    // Check if user starts already retired (currentAge === retirementAge)
    let lumpSumTaken = 0;
    if (input.currentAge === input.retirementAge) {
        if (input.lumpSumType === 'percentage' && input.lumpSumPct !== undefined) {
            lumpSumTaken = currentPotValue * (input.lumpSumPct / 100);
        } else if (input.lumpSumType === 'fixed' && input.lumpSumAmount !== undefined) {
            lumpSumTaken = input.lumpSumAmount;
        }
        lumpSumTaken = Math.min(lumpSumTaken, currentPotValue);
        currentPotValue -= lumpSumTaken;
        data[0] = { age: input.currentAge, potValue: currentPotValue, lumpSumTaken };
    }

    // Pre-retirement phase (contributions then growth at end of year)
    for (let age = input.currentAge + 1; age <= input.retirementAge; age++) {
        // Add annual contributions
        currentPotValue += input.annualPreRetirementIncome * (input.contributionRate / 100);

        // Apply pre-retirement growth
        currentPotValue *= (1 + input.preRetirementGrowth / 100);

        if (age === input.retirementAge) {
            if (input.lumpSumType === 'percentage' && input.lumpSumPct !== undefined) {
                lumpSumTaken = currentPotValue * (input.lumpSumPct / 100);
            } else if (input.lumpSumType === 'fixed' && input.lumpSumAmount !== undefined) {
                lumpSumTaken = input.lumpSumAmount;
            }
            lumpSumTaken = Math.min(lumpSumTaken, currentPotValue);
            currentPotValue -= lumpSumTaken;
            data.push({age, potValue: currentPotValue, lumpSumTaken});
        } else {
            data.push({age, potValue: currentPotValue});
        }
    }

    // Capture pot at retirement to derive initial withdrawal rate (for GK rules)
    const potAtRetirement = data.find(d => d.age === input.retirementAge)?.potValue ?? currentPotValue;
    const gkEnabled = Boolean(input.gkEnabled);
    const gkBand = (input.gk?.bandWidthPct ?? 20) / 100; // ±20% around initial WR by default
    const gkAdjust = (input.gk?.adjustmentPct ?? 10) / 100; // 10% spending change by default
    const skipInflationOnLoss = input.gk?.skipInflationOnLoss ?? true;

    // Initial withdrawal rate based on the spending input and pot at retirement
    const initialWithdrawalRate = potAtRetirement > 0 ? (currentAnnualSpending / potAtRetirement) : 0;
    const upperGuardrail = initialWithdrawalRate * (1 + gkBand);
    const lowerGuardrail = initialWithdrawalRate * (1 - gkBand);

    // Post-retirement (burn-down) phase — start taking withdrawals from age (retirementAge + 1)
    let previousNominalReturn = input.postRetirementGrowth / 100; // use configured rate as nominal return

    for (let age = input.retirementAge + 1; age <= input.lifeExpectancy; age++) {
        const startOfYearPot = currentPotValue;
        let spendingThisYear = 0;
        let currentWR = 0;

        if (input.spendingProfileType === 'phased') {
            // Phased spending: Early, Mid, and Late retirement spending levels
            const yearsRetired = age - input.retirementAge;
            const earlyDuration = input.earlyRetirementDuration ?? 10;
            const midDuration = input.midRetirementDuration ?? 10;
            const earlySpending = input.earlyRetirementSpending ?? 45000;
            const midSpending = input.midRetirementSpending ?? 35000;
            const lateSpending = input.lateRetirementSpending ?? 25000;

            let baseRealSpending = earlySpending;
            if (yearsRetired <= earlyDuration) {
                baseRealSpending = earlySpending;
            } else if (yearsRetired <= earlyDuration + midDuration) {
                baseRealSpending = midSpending;
            } else {
                baseRealSpending = lateSpending;
            }

            // Inflate spending from currentAge to age to keep constant purchasing power in today's terms
            spendingThisYear = baseRealSpending * Math.pow(1 + input.inflationRate / 100, age - input.currentAge);
            if (startOfYearPot > 0) {
                currentWR = spendingThisYear / startOfYearPot;
            }
        } else {
            // Constant spending profile (with optional Guyton–Klinger rules)
            // 1) Inflation rule: optionally skip inflation raise after a negative real return in prior year
            const priorRealReturn = previousNominalReturn - (input.inflationRate / 100);
            if (!(gkEnabled && skipInflationOnLoss && priorRealReturn < 0)) {
                currentAnnualSpending *= (1 + input.inflationRate / 100);
            }

            // 2) Guardrails: adjust spending if current withdrawal rate breaches bands
            if (gkEnabled && startOfYearPot > 0 && initialWithdrawalRate > 0) {
                currentWR = currentAnnualSpending / startOfYearPot;
                if (currentWR > upperGuardrail) {
                    // Capital preservation: cut spending by adjustment percentage
                    currentAnnualSpending *= (1 - gkAdjust);
                } else if (currentWR < lowerGuardrail) {
                    // Prosperity: raise spending by adjustment percentage
                    currentAnnualSpending *= (1 + gkAdjust);
                }
            } else if (startOfYearPot > 0) {
                currentWR = currentAnnualSpending / startOfYearPot;
            }

            spendingThisYear = currentAnnualSpending;
        }

        // 3) Subtract annual spending at start of year
        currentPotValue -= spendingThisYear;

        // 4) Add pension income at start of year if applicable
        let pensionIncomeThisYear = 0;
        input.pensions.forEach(pension => {
            if (age >= pension.startAge) {
                const isLinked = pension.isInflationLinked ?? true;
                const actualAmount = isLinked
                    ? pension.amount * Math.pow(1 + input.inflationRate / 100, age - input.currentAge)
                    : pension.amount;
                currentPotValue += actualAmount;
                pensionIncomeThisYear += actualAmount;
            }
        });

        // 5) Apply growth to the remaining pot for the year
        currentPotValue *= (1 + input.postRetirementGrowth / 100);
        previousNominalReturn = input.postRetirementGrowth / 100; // fixed for now

        // Ensure pot value doesn't go below zero
        if (currentPotValue < 0) {
            currentPotValue = 0;
        }

        // If pot runs out, append zeros to life expectancy and stop
        if (currentPotValue === 0) {
            for (let futureAge = age + 1; futureAge <= input.lifeExpectancy; futureAge++) {
                data.push({age: futureAge, potValue: 0});
            }
            break;
        }
        data.push({age, potValue: currentPotValue, startOfYearPot, spendingThisYear, pensionIncomeThisYear, withdrawalRate: currentWR});
    }

    return data;
}
