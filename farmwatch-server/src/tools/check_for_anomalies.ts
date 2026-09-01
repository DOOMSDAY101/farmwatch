import {
    tool,
} from "@strands-agents/sdk";
import {
    detectAnomalies,
    baseline,
} from "./detect_anomaly";
import { FarmReading } from "../types/types";

export const createCheckForAnomaliesTool = (
    reading: FarmReading
) => {
    return tool({
        name: "check_for_anomalies",
        description:
            "REQUIRED SECOND STEP. Runs the deterministic anomaly detector against the latest farm reading. Returns detected anomalies, their severity, current values, baseline values, and deviation percentages. Do not calculate anomalies yourself.",

        inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
        },

        callback: () => {


            const anomalies =
                detectAnomalies(
                    reading,
                    baseline
                );

            if (anomalies.length === 0) {
                return JSON.stringify({
                    status: "normal",
                    anomalies: [],
                });
            }

            return JSON.stringify({
                status: "anomaly",
                anomalies,
            });
        },
    });
}