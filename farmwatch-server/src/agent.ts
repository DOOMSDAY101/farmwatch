import { Agent, StructuredOutputError } from "@strands-agents/sdk";
import { createGetCurrentFarmDataTool } from "./tools/get-current-farm-data";
import { createCheckForAnomaliesTool } from "./tools/check_for_anomalies";
import { createGetHistoricalDataTool } from "./tools/get-historical-data";
import { FarmReading } from "./types/types";
import { InvestigationAIResult, investigationSchema } from "./schemas/agent_findings";

import { OpenAIModel } from "@strands-agents/sdk/models/openai";

const model = new OpenAIModel({
    api: "chat",
    apiKey: process.env.GROQ_API_KEY,
    modelId: "openai/gpt-oss-20b",
    clientConfig: {
        baseURL: "https://api.groq.com/openai/v1",
    },
});

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

Keep the response concise.
`

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

    try {
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
        if (!result.structuredOutput) {
            throw new Error("Agent completed without producing structured output");
        }
        return result.structuredOutput as InvestigationAIResult;

    } catch (error) {
        if (error instanceof StructuredOutputError) {
            console.error(
                "FarmWatch structured output failed:",
                error.message
            );

            throw new Error(
                "FarmWatch could not produce a valid investigation result."
            );
        }

        console.error(
            "FarmWatch investigation failed:",
            error
        );

        throw new Error(
            "Failed to process farm investigation"
        );

    }
}