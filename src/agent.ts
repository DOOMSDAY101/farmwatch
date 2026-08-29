import { Agent } from "@strands-agents/sdk";

const agent = new Agent();

const result = agent.invoke(
    "You are FarmWatch, an AI assistant for poultry farmers. " +
    "Briefly explain what you can help a poultry farmer monitor."
);

console.log(result);