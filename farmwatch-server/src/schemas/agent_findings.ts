import { z } from "zod";

export const investigationSchema = z.object({
    finding: z.string(),

    evidence: z.array(
        z.string()
    ),

    historicalComparison: z.string(),

    likelyExplanation: z.string(),
});

export type InvestigationAIResult =
    z.infer<typeof investigationSchema>;