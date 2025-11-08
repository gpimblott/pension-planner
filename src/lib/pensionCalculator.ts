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
}

/**
 * Represents a single data point in the pension projection.
 */
interface PensionDataPoint {
    /** The age at this data point. */
    age: number;
    /** The value of the pension pot at this data point. */
    potValue: number;
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
    let currentAnnualSpending = input.annualRetirementSpending;

    // Pre-retirement phase
    for (let age = input.currentAge + 1; age <= input.retirementAge; age++) {
        // Add annual contributions
        currentPotValue += input.annualPreRetirementIncome * (input.contributionRate / 100);

        // Apply pre-retirement growth
        currentPotValue *= (1 + input.preRetirementGrowth / 100);

        data.push({age, potValue: currentPotValue});
    }

    // Post-retirement (burn-down) phase
    for (let age = input.retirementAge+1; age <= input.lifeExpectancy; age++) {
        if (age > input.retirementAge) {
            currentAnnualSpending *= (1 + input.inflationRate / 100);
        }

        // Subtract annual spending
        currentPotValue -= currentAnnualSpending;

        // Add pension income if applicable
        input.pensions.forEach(pension => {
            if (age > pension.startAge) {
                currentPotValue += pension.amount;
            }
        });

        // Apply post-retirement growth
        currentPotValue *= (1 + input.postRetirementGrowth / 100);

        // Ensure pot value doesn't go below zero
        if (currentPotValue < 0) {
            currentPotValue = 0;
        }

        // If pot runs out, stop calculation
        if (currentPotValue === 0) {
            // Optionally, add more data points with 0 value until life expectancy
            for (let futureAge = age + 1; futureAge <= input.lifeExpectancy; futureAge++) {
                data.push({age: futureAge, potValue: 0});
            }
            break;
        }
        data.push({age, potValue: currentPotValue});
    }

    return data;
}
