import express from "express";
import "dotenv/config";

import {
    processReading,
    getReadings,
} from "./monitor";

import { FarmReading } from "./types/types";
import { enqueueInvestigation } from "./queue/investigationQueue";
import { getInvestigations } from "./repository/investigationRepository";
import cors from "cors";


const app = express();

app.use(express.json());
app.use(cors());

const PORT = Number(
    process.env.PORT ?? 3000
);

app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        service: "farmwatch-server",
    });
});

app.post(
    "/webhook/farm-data",
    async (req, res) => {
        const reading =
            req.body as FarmReading;

        if (
            !reading.farmId ||
            !reading.houseId ||
            !reading.timestamp
        ) {
            return res.status(400).json({
                error:
                    "Invalid farm reading",
            });
        }

        const result =
            processReading(reading);

        let investigationId:
            string | null = null;

        // agentic investigation
        if (
            result.status === "anomaly"
        ) {
            investigationId =
                enqueueInvestigation(
                    reading,
                    result.anomalies
                );
        }

        console.log({
            "Result": result,
            "Investigation": investigationId
        })
        return res.status(200).json({
            received: true,

            ...result,

            investigationId,
        });
    }
);

app.get(
    "/api/investigations",
    async (_req, res) => {

        const investigations =
            await getInvestigations(50);

        res.json({
            investigations,
        });
    }
);

app.get("/readings", (_req, res) => {
    res.json(getReadings());
});

app.listen(PORT, () => {
    console.log(
        `🤖 FarmWatch running on http://localhost:${PORT}`
    );

    console.log(
        `📡 Webhook: http://localhost:${PORT}/webhook/farm-data`
    );
});



// import express from "express";
// import "dotenv/config";
// import cors from "cors";

// import {
//     processReading,
//     getReadings,
// } from "./monitor";

// import {
//     FarmReading,
//     InvestigationDocument,
//     InvestigationResult,
// } from "./types/types";

// import {
//     getInvestigations,
//     saveInvestigation,
// } from "./repository/investigationRepository";

// import {
//     sendFarmAlertEmail,
// } from "./mail/send_mail";

// import {
//     investigateWithAgentCore,
// } from "./services/agentcore.service";

// const app = express();

// app.use(express.json());
// app.use(cors());

// const PORT =
//     Number(process.env.PORT ?? 3000);

// app.get("/health", (_req, res) => {
//     res.json({
//         status: "ok",
//         service: "farmwatch-server",
//     });
// });

// app.post(
//     "/webhook/farm-data",
//     async (req, res) => {

//         const reading =
//             req.body as FarmReading;

//         if (
//             !reading.farmId ||
//             !reading.houseId ||
//             !reading.timestamp
//         ) {
//             return res.status(400).json({
//                 error: "Invalid farm reading",
//             });
//         }

//         try {

//             /*
//              * STEP 1
//              * Deterministic monitoring.
//              */
//             const result =
//                 processReading(reading);

//             /*
//              * No anomaly:
//              * Do not invoke Bedrock.
//              */
//             if (
//                 result.status === "normal"
//             ) {
//                 console.log({
//                     Result: result,
//                 });

//                 return res.status(200).json({
//                     received: true,
//                     ...result,
//                     investigationId: null,
//                 });
//             }

//             /*
//              * STEP 2
//              * Anomaly detected.
//              *
//              * This calls:
//              *
//              * getHistoricalStats()
//              *          ↓
//              * AgentCore Runtime
//              *          ↓
//              * FarmWatch Agent
//              */
//             console.log(
//                 "🚨 Anomaly detected. Sending to AgentCore..."
//             );

//             const aiInvestigation =
//                 await investigateWithAgentCore(
//                     reading,
//                     result.anomalies
//                 );

//             /*
//              * STEP 3
//              * Build the investigation document.
//              */
//             const investigationId =
//                 `anomaly-${Date.now()}`;

//             const severity =
//                 result.anomalies.some(
//                     (anomaly) =>
//                         anomaly.severity === "high"
//                 )
//                     ? "high"
//                     : "medium";

//             const investigation:
//                 InvestigationResult = {
//                 finding:
//                     aiInvestigation.finding,

//                 evidence:
//                     aiInvestigation.evidence,

//                 historicalComparison:
//                     aiInvestigation.historicalComparison,

//                 likelyExplanation:
//                     aiInvestigation.likelyExplanation,

//                 severity,

//                 humanAttentionRecommended:
//                     result.anomalies.length > 0,
//             };

//             /*
//              * STEP 4
//              * Save investigation.
//              */
//             const document:
//                 InvestigationDocument = {
//                 anomalyId:
//                     investigationId,

//                 farmId:
//                     reading.farmId,

//                 houseId:
//                     reading.houseId,

//                 detectedAt:
//                     reading.timestamp,

//                 reading,

//                 anomalies:
//                     result.anomalies,

//                 investigation,

//                 createdAt:
//                     new Date().toISOString(),
//             };

//             await saveInvestigation(
//                 document
//             );

//             /*
//              * STEP 5
//              * Send alert email.
//              */
//             await sendFarmAlertEmail(
//                 investigation
//             );

//             console.log({
//                 Result: result,
//                 Investigation:
//                     investigationId,
//             });

//             return res.status(200).json({
//                 received: true,
//                 ...result,
//                 investigationId,
//                 investigation,
//             });

//         } catch (error) {

//             console.error(
//                 "❌ FarmWatch processing failed:",
//                 error
//             );

//             return res.status(500).json({
//                 error:
//                     "Failed to process farm reading",
//             });
//         }
//     }
// );

// app.get(
//     "/api/investigations",
//     async (_req, res) => {

//         try {

//             const investigations =
//                 await getInvestigations(50);

//             return res.json({
//                 investigations,
//             });

//         } catch (error) {

//             console.error(
//                 "Failed to get investigations:",
//                 error
//             );

//             return res.status(500).json({
//                 error:
//                     "Failed to retrieve investigations",
//             });
//         }
//     }
// );

// app.get(
//     "/readings",
//     (_req, res) => {
//         res.json(getReadings());
//     }
// );

// app.listen(
//     PORT,
//     () => {

//         console.log(
//             `🤖 FarmWatch running on http://localhost:${PORT}`
//         );

//         console.log(
//             `📡 Webhook: http://localhost:${PORT}/webhook/farm-data`
//         );
//     }
// );