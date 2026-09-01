import {
    FarmReading,
} from "./types/types";

import {
    baseline,
    detectAnomalies,
} from "./tools/detect_anomaly";

const readings: FarmReading[] = [];

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
    return [...readings];
}

export function getLatestReading(): FarmReading | null {
    return readings.length > 0
        ? readings[readings.length - 1]
        : null;
}