import {
    BedrockAgentCoreClient,
    InvokeAgentRuntimeCommand,
} from "@aws-sdk/client-bedrock-agentcore";

import { randomUUID } from "crypto";

import { FarmReading, Anomaly } from "../types/types";
import {
    getHistoricalStats,
} from "./historicalStats.service";

interface InvestigationAIResult {
    finding: string;
    evidence: string[];
    historicalComparison: string;
    likelyExplanation: string;
}

const region =
    process.env.AWS_REGION ?? "us-east-1";

const agentRuntimeArn =
    process.env.AGENTCORE_RUNTIME_ARN;

if (!agentRuntimeArn) {
    throw new Error(
        "AGENTCORE_RUNTIME_ARN is not configured"
    );
}

const client =
    new BedrockAgentCoreClient({
        region,
    });

export async function investigateWithAgentCore(
    reading: FarmReading,
    anomalies: Anomaly[]
): Promise<InvestigationAIResult> {

    const historicalData =
        await getHistoricalStats(reading);

    const payload = {
        reading,
        historicalData,
        anomalies,
    };

    const command =
        new InvokeAgentRuntimeCommand({
            agentRuntimeArn,
            runtimeSessionId: randomUUID(),
            payload: JSON.stringify(payload),
            contentType: "application/json",
            accept: "application/json",
            qualifier: "DEFAULT",
        });

    console.log(
        "🤖 Invoking FarmWatch AgentCore runtime..."
    );

    const response =
        await client.send(command);

    const responseBody =
        await response.response?.transformToString();

    if (!responseBody) {
        throw new Error(
            "AgentCore returned an empty response"
        );
    }

    console.log(
        "🤖 AgentCore response:",
        responseBody
    );

    try {
        return JSON.parse(
            responseBody
        ) as InvestigationAIResult;

    } catch (error) {
        console.error(
            "Failed to parse AgentCore response:",
            responseBody
        );

        throw new Error(
            "AgentCore returned invalid JSON"
        );
    }
}