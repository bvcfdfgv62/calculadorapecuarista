export interface CalculatorInputs {
    sampleArea: 1.0 | 0.25
    sampleWeight: number
    dryMatterPercent: number
    forageSupplyPercent: number
    paddockCount: number
    occupationDays: number
    growthPeriod: number
    category: 'Macho' | 'Fêmea'
    bodyWeight: number
    gpd: number
    unavailabilityPercent: number
    pricePerArroba: number
    propertyData?: {
        farmName: string
        owner: string
        city: string
        state: string
        phone: string
        email: string
    }
}

export interface CalculatorOutputs {
    forageMass: number
    supportCapacity: number
    stockingRateUA: number
    stockingRateHeads: number
    productivity: number
    revenue: number
    reduction: number
    profit: number
}

export const calculateResults = (inputs: CalculatorInputs): CalculatorOutputs => {
    const {
        sampleArea,
        sampleWeight,
        dryMatterPercent,
        forageSupplyPercent,
        occupationDays,
        growthPeriod,
        bodyWeight,
        gpd,
        unavailabilityPercent,
        pricePerArroba
    } = inputs

    // 1. Forage Mass (kg MS/ha)
    const forageMass = sampleArea > 0 ? (sampleWeight * 10000 / sampleArea) * (dryMatterPercent / 100) : 0

    // 2. Stocking Rate (Cab/ha)
    const dailyRequirement = bodyWeight * (forageSupplyPercent / 100)
    const stockingRateHeads = (dailyRequirement > 0 && occupationDays > 0)
        ? (forageMass / occupationDays) / dailyRequirement
        : 0

    // 3. Stocking Rate (UA/ha)
    const stockingRateUA = (stockingRateHeads * bodyWeight) / 450

    // 4. Support Capacity (Total weight capacity in kg/ha)
    const supportCapacity = stockingRateHeads * bodyWeight

    // 5. Productivity (@)
    const productivity = (stockingRateHeads * gpd * growthPeriod) / 30

    // 6. Financials
    const revenue = productivity * pricePerArroba
    const reduction = revenue * (unavailabilityPercent / 100)
    const profit = revenue - reduction

    const sanitize = (val: number) => isFinite(val) && !isNaN(val) ? val : 0

    return {
        forageMass: Math.round(sanitize(forageMass) * 100) / 100,
        supportCapacity: Math.round(sanitize(supportCapacity) * 100) / 100,
        stockingRateUA: Math.round(sanitize(stockingRateUA) * 100) / 100,
        stockingRateHeads: Math.round(sanitize(stockingRateHeads) * 100) / 100,
        productivity: Math.round(sanitize(productivity) * 100) / 100,
        revenue: Math.round(sanitize(revenue) * 100) / 100,
        reduction: Math.round(sanitize(reduction) * 100) / 100,
        profit: Math.round(sanitize(profit) * 100) / 100,
    }
}
