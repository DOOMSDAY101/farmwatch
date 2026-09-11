import {
    tool,
} from "@strands-agents/sdk";

import {
    getReadings,
} from "../monitor";
import { FarmReading } from "../types/types";
import { getInvestigations } from "../repository/investigationRepository";

export function createGetHistoricalDataTool(
    currentReading: FarmReading
) {
    return tool({
        name: "get_historical_data",
        description:
            `REQUIRED AFTER AN ANOMALY IS CONFIRMED. Returns previous farm readings so the agent can compare the current abnormal reading against recent historical patterns. Only call this after check_for_anomalies detects an anomaly.
            Returns statistical evidence from the previous farm readings. Use this only after an anomaly has been confirmed. It provides recent averages, minimums, maximums, and trends for comparison.`,

        inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
        },

        callback: async () => {


            const investigations =
                await getInvestigations
                    (50);

            // Only use investigations that belong to
            // the same house as the current reading.
            const historicalReadings =
                investigations
                    .filter(
                        (investigation) =>
                            investigation.houseId ===
                            currentReading.houseId
                    )
                    .map(
                        (investigation) =>
                            investigation.reading
                    )
                    .filter(
                        (reading) =>
                            reading !== currentReading
                    )
                    .slice(0, 10);

            if (
                historicalReadings.length === 0
            ) {
                return JSON.stringify({
                    sampleSize: 0,
                    message:
                        "No historical readings available.",
                });
            }


            if (historicalReadings.length === 0) {
                return JSON.stringify({
                    sampleSize: 0,
                    message:
                        "No historical readings available.",
                });
            }

            const average = (
                values: number[]
            ) =>
                values.reduce(
                    (sum, value) => sum + value,
                    0
                ) / values.length;

            const min = (values: number[]) =>
                Math.min(...values);

            const max = (values: number[]) =>
                Math.max(...values);

            const waterValues =
                historicalReadings.map(
                    (r) => r.waterLiters
                );

            const feedValues =
                historicalReadings.map(
                    (r) => r.feedKg
                );

            const eggValues =
                historicalReadings.map(
                    (r) => r.eggCount
                );

            const temperatureValues =
                historicalReadings.map(
                    (r) => r.temperatureC
                );

            return JSON.stringify({
                sampleSize:
                    historicalReadings.length,

                water: {
                    average: Number(
                        average(waterValues).toFixed(2)
                    ),
                    minimum: min(waterValues),
                    maximum: max(waterValues),
                },

                feed: {
                    average: Number(
                        average(feedValues).toFixed(2)
                    ),
                    minimum: min(feedValues),
                    maximum: max(feedValues),
                },

                eggs: {
                    average: Number(
                        average(eggValues).toFixed(2)
                    ),
                    minimum: min(eggValues),
                    maximum: max(eggValues),
                },

                temperature: {
                    average: Number(
                        average(
                            temperatureValues
                        ).toFixed(2)
                    ),
                    minimum: min(
                        temperatureValues
                    ),
                    maximum: max(
                        temperatureValues
                    ),
                },
            });
        },
    });
}