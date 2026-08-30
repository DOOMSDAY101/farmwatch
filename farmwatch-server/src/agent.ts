import { Agent } from "@strands-agents/sdk";
import { VercelModel } from "@strands-agents/sdk/models/vercel";
import { ollama } from "ai-sdk-ollama";

const model = new VercelModel({
    provider: ollama("llama3.2:3b"),
});

const agent = new Agent({
    model,
});

async function main() {
    const result = await agent.invoke(
        "You are FarmWatch, an autonomous poultry farm monitoring agent. Explain your role in one sentence."
    );

    console.log(result);
}

void main();