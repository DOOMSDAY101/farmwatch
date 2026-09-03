import express from "express";
import cors from "cors";

import "dotenv/config";

import {
    FarmSimulator,
    FarmEvent,
} from "./simulator";
import { FarmReading } from "./types/types";

const app = express();

app.use(express.json()); app.use(cors());


const PORT = Number(
    process.env.PORT ?? 4000
);

const FARMWATCH_WEBHOOK_URL =
    process.env.FARMWATCH_WEBHOOK_URL ??
    "http://localhost:3000/webhook/farm-data";

const SIMULATION_INTERVAL_MS =
    Number(
        process.env.SIMULATION_INTERVAL_MS ??
        60 * 60 * 1000
    );

const simulator =
    new FarmSimulator(
        "farm-001",
        "house-01"
    );

let currentEvent: FarmEvent = "normal";


async function sendReadingToFarmWatch(
    reading: FarmReading
): Promise<Response> {
    return fetch(
        FARMWATCH_WEBHOOK_URL,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body: JSON.stringify(reading),
        }
    );
}

async function sendReading(): Promise<void> {
    const reading =
        simulator.generateReading();

    console.log("\n🐔 Farm reading generated");
    console.log(reading);

    try {
        const response =
            await sendReadingToFarmWatch(
                reading
            );

        if (!response.ok) {
            console.error(
                `❌ FarmWatch returned ${response.status}`
            );

            return;
        }

        console.log(
            "✅ Reading sent to FarmWatch"
        );
    } catch (error) {
        console.error(
            "❌ Could not reach FarmWatch:",
            error
        );
    }
}


// Health check
app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        service: "farm-simulator",
        event: currentEvent,
    });
});

// Change simulation scenario
app.post(
    "/simulation/event",
    async (req, res) => {
        const {
            event,
            reading,
        } = req.body as {
            event: FarmEvent;
            reading: FarmReading;
        };

        console.log("\n🚨 Manual simulation event received");
        console.log("Event:", event);
        console.log("Reading:", reading);

        const validEvents: FarmEvent[] = [
            "normal",
            "water_system_issue",
            "feed_system_issue",
            "production_drop",
            "heat_stress",
        ];

        if (!validEvents.includes(event)) {
            return res.status(400).json({
                error:
                    "Invalid simulation event",
                validEvents,
            });
        }

        if (
            !reading ||
            !reading.farmId ||
            !reading.houseId ||
            !reading.timestamp ||
            typeof reading.temperatureC !==
            "number" ||
            typeof reading.waterLiters !==
            "number" ||
            typeof reading.feedKg !==
            "number" ||
            typeof reading.eggCount !==
            "number"
        ) {
            return res.status(400).json({
                error:
                    "Invalid farm reading",
            });
        }

        console.log(
            "🐔 Farm reading received from frontend"
        );

        console.log(reading);

        try {
            const response =
                await sendReadingToFarmWatch(
                    reading
                );


            if (!response.ok) {
                console.error(
                    `❌ FarmWatch returned ${response.status}`
                );

                return res.status(502).json({
                    error:
                        "FarmWatch rejected the reading",
                    status:
                        response.status,
                });
            }

            const result =
                await response.json();

            console.log(
                "✅ Manual event sent to FarmWatch"
            );

            return res.status(200).json({
                received: true,
                event,
                reading,
                result,
            });
        } catch (error) {
            console.error(
                "❌ Could not reach FarmWatch:",
                error
            );

            return res.status(502).json({
                error:
                    "Could not reach FarmWatch",
            });
        }
    }
);


app.listen(PORT, () => {
    console.log(
        `🐔 Farm Simulator running on http://localhost:${PORT}`
    );

    console.log(
        `📡 Sending readings to ${FARMWATCH_WEBHOOK_URL}`
    );

    console.log(
        `⏱️ Interval: ${SIMULATION_INTERVAL_MS}ms`
    );

    // Generate immediately so we don't
    // have to wait for the first interval.
    void sendReading();

    setInterval(
        () => {
            void sendReading();
        },
        SIMULATION_INTERVAL_MS
    );
});