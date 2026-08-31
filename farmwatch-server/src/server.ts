import express from "express";
import "dotenv/config";

import {
    processReading,
    getReadings,
} from "./monitor";

import { FarmReading } from "./types/types";

const app = express();

app.use(express.json());

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
    (req, res) => {
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

        res.status(200).json({
            received: true,
            ...result,
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