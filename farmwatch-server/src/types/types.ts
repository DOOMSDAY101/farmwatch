export interface FarmReading {
    farmId: string;
    houseId: string;
    timestamp: string;

    temperatureC: number;
    waterLiters: number;
    feedKg: number;
    eggCount: number;
}

export interface Anomaly {
    metric:
    | "water"
    | "feed"
    | "eggs"
    | "temperature";

    currentValue: number;
    baselineValue: number;

    deviationPercent: number;

    severity: "low" | "medium" | "high";

    message: string;
}