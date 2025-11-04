interface PensionInput {
  currentAge: number;
  pensionPotValue: number;
  retirementAge: number;
  lifeExpectancy: number;
  annualRetirementSpending: number;
  preRetirementGrowth: number; // percentage
  postRetirementGrowth: number; // percentage
  inflationRate: number; // percentage
  statePensionIncome: number;
  annualPreRetirementIncome: number; // Now required
  contributionRate: number; // Now required
}

interface PensionDataPoint {
  age: number;
  potValue: number;
}

export function calculatePension(input: PensionInput): PensionDataPoint[] {
  const data: PensionDataPoint[] = [];
  let currentPotValue = input.pensionPotValue;
  let currentAnnualSpending = input.annualRetirementSpending;

  // Pre-retirement phase
  for (let age = input.currentAge; age < input.retirementAge; age++) {
    // Apply pre-retirement growth
    currentPotValue *= (1 + input.preRetirementGrowth / 100);

    // Add annual contributions
    currentPotValue += input.annualPreRetirementIncome * (input.contributionRate / 100);

    data.push({ age, potValue: currentPotValue });
  }

  // Post-retirement (burn-down) phase
  for (let age = input.retirementAge; age <= input.lifeExpectancy; age++) {
    // Apply post-retirement growth
    currentPotValue *= (1 + input.postRetirementGrowth / 100);

    // Adjust spending for inflation
    if (age > input.retirementAge) {
      currentAnnualSpending *= (1 + input.inflationRate / 100);
    }

    // Subtract annual spending and add state pension
    currentPotValue -= (currentAnnualSpending - input.statePensionIncome);

    // Ensure pot value doesn't go below zero
    if (currentPotValue < 0) {
      currentPotValue = 0;
    }

    data.push({ age, potValue: currentPotValue });

    // If pot runs out, stop calculation
    if (currentPotValue === 0 && age < input.lifeExpectancy) {
      // Optionally, add more data points with 0 value until life expectancy
      for (let futureAge = age + 1; futureAge <= input.lifeExpectancy; futureAge++) {
        data.push({ age: futureAge, potValue: 0 });
      }
      break;
    }
  }

  return data;
}
