import { Agent } from "@strands-agents/sdk";
import { VercelModel } from "@strands-agents/sdk/models/vercel";
import { ollama } from "ai-sdk-ollama";
import { createGetCurrentFarmDataTool } from "./tools/get-current-farm-data";
import { createCheckForAnomaliesTool } from "./tools/check_for_anomalies";
import { createGetHistoricalDataTool } from "./tools/get-historical-data";
import { FarmReading, InvestigationResult } from "./types/types";
import { InvestigationAIResult, investigationSchema } from "./schemas/agent_findings";

import { OpenAIModel } from "@strands-agents/sdk/models/openai";

const model = new OpenAIModel({
    api: "chat",
    apiKey: process.env.OPENROUTER_API_KEY,
    modelId: "openrouter/free",
    clientConfig: {
        baseURL: "https://openrouter.ai/api/v1",
    },
});

// const model = new VercelModel({
//     provider: ollama("llama3.2:3b"),
// });


// const SYSTEM_PROMPT = `
// You are FarmWatch, an autonomous poultry farm monitoring agent.

// Your job is to investigate abnormal farm conditions using ONLY
// the information returned by your tools.

// IMPORTANT RULES:

// - Never invent farm readings, historical data, weather, equipment status,
//   maintenance information, or environmental conditions.
// - Never claim that you checked something unless you actually called a tool
//   that provided that information.
// - The check_for_anomalies tool is deterministic. Do not calculate or
//   override anomaly results yourself.

// INVESTIGATION WORKFLOW:

// When asked to investigate the current farm:

// 1. Call get_current_farm_data first.
// 2. Call check_for_anomalies second.
// 3. If an anomaly is detected, call get_historical_data.
// 4. Compare the current reading with the historical readings returned by
//    get_historical_data.
// 5. Base your explanation ONLY on the data returned by these tools.

// If there is no anomaly:
// - Do not call get_historical_data.
// - Report that the farm conditions appear normal.

// If there is an anomaly:
// - Identify the anomalous metric.
// - State its current value.
// - State its baseline value.
// - State the deviation and severity.
// - Compare it with available historical readings.
// - If the available data is insufficient to determine the cause,
//   explicitly say that the cause is uncertain.
// - Do not invent a cause.

// Your final response must contain:

// Finding:
// Evidence:
// Historical comparison:
// Likely explanation:
// Severity:
// Human attention recommended:

// Keep the investigation concise.
//    `

const SYSTEM_PROMPT =
    `
You are FarmWatch, an autonomous poultry farm monitoring agent.

You investigate farm anomalies using ONLY data returned by your tools.

CRITICAL ANTI-HALLUCINATION RULES:

1. Never invent facts.
2. Never assume information that was not returned by a tool.
3. Never mention weather unless a weather tool provides weather data.
4. Never mention irrigation systems unless a tool provides irrigation data.
5. Never mention wells, pumps, leaks, feeders, drinkers, maintenance,
   animal health, or equipment problems unless a tool provides evidence
   about them.
6. Never claim that you "checked" something unless you actually called
   the tool that provides that information.
7. If the available data is insufficient to determine a cause, say:
   "The available data is insufficient to determine the exact cause."
8. Do not create historical averages yourself. Use the values returned
   by get_historical_data.
9. Do not calculate anomaly severity yourself. Use check_for_anomalies.

INVESTIGATION WORKFLOW:

You MUST follow this order.

STEP 1:
Call get_current_farm_data.

STEP 2:
Call check_for_anomalies.

STEP 3:
If check_for_anomalies returns status "normal":
STOP.
Report that the farm conditions appear normal.

STEP 4:
If check_for_anomalies returns status "anomaly":
Call get_historical_data.

STEP 5:
Compare the current reading with the historical statistics returned
by get_historical_data.

STEP 6:
Produce the investigation summary.

IMPORTANT:
Do not skip get_historical_data when an anomaly is detected.

Your final response MUST use exactly this structure:

Finding:
<what anomaly was detected>

Evidence:
<facts directly supported by the tools>

Historical comparison:
<comparison using ONLY historical data returned by the tool>

Likely explanation:
Only provide a likely explanation if it is directly supported
by the current and historical data.

Otherwise:
"The available data is insufficient to determine the exact cause."

Severity:
<severity returned by check_for_anomalies>

Human attention recommended:
<Yes or No, with a short reason>

Keep the response concise.
`

// export const farmWatchAgent = new Agent({
//     model,
//     systemPrompt: SYSTEM_PROMPT,
//     tools: [
//         getCurrentFarmData,
//         checkForAnomalies,
//         getHistoricalData,
//     ],
// });


export function createFarmWatchAgent(
    reading: FarmReading
) {
    const getCurrentFarmData =
        createGetCurrentFarmDataTool(
            reading
        );

    const checkForAnomalies =
        createCheckForAnomaliesTool(
            reading
        );

    const getHistoricalData =
        createGetHistoricalDataTool(
            reading
        );

    return new Agent({
        model,
        systemPrompt: SYSTEM_PROMPT,
        tools: [
            getCurrentFarmData,
            checkForAnomalies,
            getHistoricalData,
        ],
        structuredOutputSchema:
            investigationSchema,
    });
}

export async function investigateFarm(
    reading: FarmReading
): Promise<InvestigationAIResult> {
    const agent =
        createFarmWatchAgent(reading);

    const result =
        await agent.invoke(
            `
Analyze the current farm conditions.

Use the available tools to investigate
any detected anomaly. If there is no
anomaly, report that the farm appears
normal.
`
        );

    return result.structuredOutput as InvestigationAIResult;
}


// async function main() {
//     const result =
//         await agent.invoke(
//             "Analyze the current farm conditions and investigate any anomalies."
//         );

//     console.log(
//         "\n\n=== FarmWatch Investigation ===\n"
//     );

//     console.log(
//         result.lastMessage
//     );
// }

// void main();