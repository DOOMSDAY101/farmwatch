import { investigateFarm } from "../agent";
import { sendFarmAlertEmail } from "../mail/send_mail";
import { saveInvestigation } from "../repository/investigationRepository";
import { Anomaly, FarmReading, InvestigationDocument, InvestigationResult } from "../types/types";


interface InvestigationJob {
    id: string;

    reading: FarmReading;

    anomalies: Anomaly[];

    createdAt: string;
}

const queue: InvestigationJob[] = [];

let workerRunning = false;

export function enqueueInvestigation(
    reading: FarmReading,
    anomalies: Anomaly[]
) {
    const job: InvestigationJob = {
        id: `anomaly-${Date.now()}`,

        reading,

        anomalies,

        createdAt:
            new Date().toISOString(),
    };

    queue.push(job);

    console.log(
        `📥 Investigation queued: ${job.id}`
    );

    void processQueue();

    return job.id;
}

async function processQueue() {
    if (workerRunning) {
        return;
    }

    workerRunning = true;

    try {
        while (queue.length > 0) {
            const job = queue.shift();

            if (!job) {
                continue;
            }

            console.log(
                `🤖 Investigating ${job.id}`
            );

            try {
                const aiInvestigation =
                    await investigateFarm(job.reading);

                const severity =
                    job.anomalies.some(
                        anomaly => anomaly.severity === "high"
                    )
                        ? "high"
                        : "medium";

                const investigation: InvestigationResult = {
                    finding: aiInvestigation.finding,

                    evidence: aiInvestigation.evidence,

                    historicalComparison:
                        aiInvestigation.historicalComparison,

                    likelyExplanation:
                        aiInvestigation.likelyExplanation,

                    severity,

                    humanAttentionRecommended:
                        job.anomalies.length > 0,
                };


                const document: InvestigationDocument = {
                    anomalyId: job.id,

                    farmId: job.reading.farmId,

                    houseId: job.reading.houseId,

                    detectedAt: job.reading.timestamp,

                    reading: job.reading,

                    anomalies: job.anomalies,

                    investigation,

                    createdAt: new Date().toISOString(),
                };

                await saveInvestigation(
                    document
                );

                try {
                    await sendFarmAlertEmail(investigation);
                } catch (error) {
                    console.error(
                        "⚠️ Farm alert email failed, continuing execution:",
                        error
                    );
                }

                console.log(
                    `💾 Investigation saved: ${job.id}`
                );

            } catch (error) {
                console.error(
                    `❌ Investigation failed: ${job.id}`,
                    error
                );
            }
        }
    } finally {
        workerRunning = false;
    }
}

export function getQueueStatus() {
    return {
        queued: queue.length,
        processing: workerRunning,
    };
}