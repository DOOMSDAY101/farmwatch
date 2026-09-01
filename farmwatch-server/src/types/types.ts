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

export interface InvestigationResult {
    finding: string;
    evidence: string[];
    historicalComparison: string;
    likelyExplanation: string;
    severity: "medium" | "high";
    humanAttentionRecommended: boolean;
}
export interface InvestigationDocument {
    anomalyId: string;
    farmId: string;
    houseId: string;
    detectedAt: string;
    reading: FarmReading;
    anomalies: Anomaly[];
    investigation: InvestigationResult;
    createdAt: string;
}