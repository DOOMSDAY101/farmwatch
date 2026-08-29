import {
    FarmReading,
} from "./types/types";

import {
    detectAnomalies,
    FarmBaseline,
} from "./anomaly.js";

const readings: FarmReading[] = [];

const baseline: FarmBaseline = {
    waterLiters: 80,
    feedKg: 42,
    eggCount: 410,
    temperatureC: 28,
};

export function processReading(
    reading: FarmReading
) {
    readings.push(reading);

    const anomalies =
        detectAnomalies(
            reading,
            baseline
        );

    console.log("\n📊 FarmWatch received:");
    console.log(reading);

    if (anomalies.length === 0) {
        console.log(
            "✅ Farm conditions appear normal."
        );

        return {
            status: "normal" as const,
            anomalies: [],
        };
    }

    console.log(
        "\n🚨 ANOMALY DETECTED"
    );

    for (const anomaly of anomalies) {
        console.log(
            `- ${anomaly.message}`
        );
    }

    return {
        status: "anomaly" as const,
        anomalies,
    };
}

export function getReadings(): FarmReading[] {
    return readings;
}