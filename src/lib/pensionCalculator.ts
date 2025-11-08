interface Pension {
    name: string;
    amount: number;
    startAge: number;
}

interface PensionInput {
    currentAge: number;
    pensionPotValue: number;
    retirementAge: number;
    lifeExpectancy: number;
    annualRetirementSpending: number;
    preRetirementGrowth: number; // percentage
    postRetirementGrowth: number; // percentage
    inflationRate: number; // percentage
    pensions: Pension[];
    annualPreRetirementIncome: number; // Now required
    contributionRate: number; // Now required
}

interface PensionDataPoint {
    age: number;
    potValue: number;
}

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
