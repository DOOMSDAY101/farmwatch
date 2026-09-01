import {
    tool,
} from "@strands-agents/sdk";

import {
    getLatestReading,
} from "../monitor";
import { FarmReading } from "../types/types";

export function createGetCurrentFarmDataTool(
    reading: FarmReading
) {
    return tool({
        name: "get_current_farm_data",
        description:
            "REQUIRED FIRST STEP. Returns the latest farm reading including temperature, water consumption, feed consumption, and egg production.",

        inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
        },

        callback: () => {
            // const reading =
            //     getLatestReading();

            // if (!reading) {
            //     return JSON.stringify({
            //         error: "No farm readings are available.",
            //     });
            // }

            return JSON.stringify(reading);
        },
    });
}