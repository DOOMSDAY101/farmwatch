import express from "express";
import "dotenv/config";

import {
    FarmSimulator,
    FarmEvent,
} from "./simulator";

const app = express();

app.use(express.json());

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

async function sendReading(): Promise<void> {
    const reading =
        simulator.generateReading();

    console.log("\n🐔 Farm reading generated");
    console.log(reading);

    try {
        const response = await fetch(
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
    (req, res) => {
        const event =
            req.body.event as FarmEvent;

        const validEvents: FarmEvent[] = [
            "normal",
            "water_system_issue",
            "feed_system_issue",
            "production_drop",
        ];

        if (!validEvents.includes(event)) {
            return res.status(400).json({
                error: "Invalid simulation event",
                validEvents,
            });
        }

        currentEvent = event;

        simulator.setEvent(event);

        res.json({
            message:
                "Simulation event updated",
            event,
        });
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