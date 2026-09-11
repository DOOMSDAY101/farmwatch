import {
    tool,
} from "@strands-agents/sdk";

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
            return JSON.stringify(reading);
        },
    });
}