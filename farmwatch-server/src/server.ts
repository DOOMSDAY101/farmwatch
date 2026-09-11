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