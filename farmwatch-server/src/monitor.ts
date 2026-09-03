import {
    FarmReading,
} from "./types/types";

import {
    baseline,
    detectAnomalies,
} from "./tools/detect_anomaly";

type StoredReading = FarmReading & {
    anomaly?: boolean;
};

const readings: StoredReading[] = [];


export function processReading(
    reading: FarmReading
) {

    const anomalies =
        detectAnomalies(
            reading,
            baseline
        );

    const hasAnomaly =
        anomalies.length > 0;

    // Store the reading together with
    // its deterministic anomaly status.
    const storedReading: StoredReading = {
        ...reading,
        anomaly: hasAnomaly,
    };


    readings.push(storedReading);


    console.log("\n📊 FarmWatch received:");
    console.log(reading);

    if (!hasAnomaly) {
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

export function getReadings(): StoredReading[] {
    return [...readings];
}

export function getLatestReading(): StoredReading | null {
    return readings.length > 0
        ? readings[readings.length - 1]
        : null;
}