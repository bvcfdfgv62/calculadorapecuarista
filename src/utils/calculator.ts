export interface CalculatorInputs {
    sampleArea: 1.0 | 0.25
    sampleWeight: number
    dryMatterPercent: number
    forageSupplyPercent: number
    paddockCount: number
    occupationDays: number
    growthPeriod: number
    category: 'Bezerro' | 'Novilha' | 'BoiGordo' | 'VacaCria' | 'VacaSeca'
    bodyWeight: number
    gpd: number
    unavailabilityPercent: number
    pricePerArroba: number
    pastureArea: number
    areaUnit: 'ha' | 'alq_sp' | 'alq_mg'
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
        pricePerArroba,
        pastureArea,
        areaUnit
    } = inputs

    const areaMultiplier = areaUnit === 'alq_sp' ? 2.42 : areaUnit === 'alq_mg' ? 4.84 : 1
    const totalAreaHa = (pastureArea || 1) * areaMultiplier

    const forageMass = sampleArea > 0 ? (sampleWeight * 10000 / sampleArea) * (dryMatterPercent / 100) : 0
    const usefulMass = forageMass
    const dailyRequirement = bodyWeight * (forageSupplyPercent / 100)
    
    // Cab/ha
    const stockingRateHeadsHa = (dailyRequirement > 0 && occupationDays > 0) ? (usefulMass / occupationDays) / dailyRequirement : 0
    const stockingRateHeads = stockingRateHeadsHa * totalAreaHa

    // UA/ha
    const stockingRateUAHa = (stockingRateHeadsHa * bodyWeight) / 450
    const stockingRateUA = stockingRateUAHa * totalAreaHa

    const supportCapacity = stockingRateHeadsHa * bodyWeight // kg/ha

    // Produtividade Total (@)
    const productivityHa = (stockingRateHeadsHa * gpd * growthPeriod) / 30
    const productivity = productivityHa * totalAreaHa

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
