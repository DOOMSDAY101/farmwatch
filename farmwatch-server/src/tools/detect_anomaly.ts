import {
    FarmReading,
    Anomaly,
} from "../types/types";

export interface FarmBaseline {
    waterLiters: number;
    feedKg: number;
    eggCount: number;
    temperatureC: number;
}

export const baseline: FarmBaseline = {
    waterLiters: 80,
    feedKg: 42,
    eggCount: 410,
    temperatureC: 28,
};

export function detectAnomalies(
    reading: FarmReading,
    baseline: FarmBaseline
): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // Water
    const waterDeviation =
        percentageDifference(
            reading.waterLiters,
            baseline.waterLiters
        );

    if (Math.abs(waterDeviation) >= 20) {
        anomalies.push({
            metric: "water",
            currentValue: reading.waterLiters,
            baselineValue: baseline.waterLiters,
            deviationPercent: waterDeviation,
            severity:
                Math.abs(waterDeviation) >= 40
                    ? "high"
                    : "medium",
            message:
                `Water consumption is ${formatPercent(
                    waterDeviation
                )} normal.`,
        });
    }

    // Feed
    const feedDeviation =
        percentageDifference(
            reading.feedKg,
            baseline.feedKg
        );

    if (Math.abs(feedDeviation) >= 20) {
        anomalies.push({
            metric: "feed",
            currentValue: reading.feedKg,
            baselineValue: baseline.feedKg,
            deviationPercent: feedDeviation,
            severity:
                Math.abs(feedDeviation) >= 40
                    ? "high"
                    : "medium",
            message:
                `Feed consumption is ${formatPercent(
                    feedDeviation
                )} from normal.`,
        });
    }

    // Egg production
    const eggDeviation =
        percentageDifference(
            reading.eggCount,
            baseline.eggCount
        );

    if (Math.abs(eggDeviation) >= 15) {
        anomalies.push({
            metric: "eggs",
            currentValue: reading.eggCount,
            baselineValue: baseline.eggCount,
            deviationPercent: eggDeviation,
            severity:
                Math.abs(eggDeviation) >= 30
                    ? "high"
                    : "medium",
            message:
                `Egg production is ${formatPercent(
                    eggDeviation
                )} from normal.`,
        });
    }

    // Temperature
    const temperatureDifference =
        Math.abs(
            reading.temperatureC -
            baseline.temperatureC
        );

    if (temperatureDifference >= 3) {
        anomalies.push({
            metric: "temperature",
            currentValue: reading.temperatureC,
            baselineValue: baseline.temperatureC,
            deviationPercent:
                percentageDifference(
                    reading.temperatureC,
                    baseline.temperatureC
                ),
            severity:
                temperatureDifference >= 5
                    ? "high"
                    : "medium",
            message:
                `Temperature is ${temperatureDifference.toFixed(
                    1
                )}°C away from normal.`,
        });
    }

    return anomalies;
}

function percentageDifference(
    current: number,
    baseline: number
): number {
    if (baseline === 0) {
        return 0;
    }

    return (
        ((current - baseline) / baseline) *
        100
    );
}

function formatPercent(
    value: number
): string {
    const rounded =
        Math.abs(value).toFixed(1);

    return value < 0
        ? `${rounded}% below`
        : `${rounded}% above`;
}