import { FarmReading } from "./types/types";

export type FarmEvent =
    | "normal"
    | "water_system_issue"
    | "feed_system_issue"
    | "production_drop";

export class FarmSimulator {
    private readonly farmId: string;
    private readonly houseId: string;

    private event: FarmEvent = "normal";

    private readonly baseline = {
        temperatureC: 28,
        waterLiters: 80,
        feedKg: 42,
        eggCount: 410,
    };

    constructor(
        farmId = "farm-001",
        houseId = "house-01"
    ) {
        this.farmId = farmId;
        this.houseId = houseId;
    }

    setEvent(event: FarmEvent): void {
        this.event = event;
    }

    generateReading(
        timestamp: Date = new Date()
    ): FarmReading {
        let waterLiters = this.randomAround(
            this.baseline.waterLiters,
            3
        );

        let feedKg = this.randomAround(
            this.baseline.feedKg,
            2
        );

        let eggCount = Math.round(
            this.randomAround(
                this.baseline.eggCount,
                8
            )
        );

        let temperatureC = this.randomAround(
            this.baseline.temperatureC,
            1
        );

        switch (this.event) {
            case "water_system_issue":
                waterLiters = this.randomBetween(38, 45);
                break;

            case "feed_system_issue":
                feedKg = this.randomBetween(55, 65);
                break;

            case "production_drop":
                eggCount = Math.round(
                    this.randomBetween(300, 350)
                );
                break;
        }

        return {
            farmId: this.farmId,
            houseId: this.houseId,
            timestamp: timestamp.toISOString(),

            temperatureC: this.round(
                temperatureC,
                1
            ),

            waterLiters: this.round(
                waterLiters,
                1
            ),

            feedKg: this.round(
                feedKg,
                1
            ),

            eggCount,
        };
    }

    private randomAround(
        value: number,
        variation: number
    ): number {
        return this.randomBetween(
            value - variation,
            value + variation
        );
    }

    private randomBetween(
        min: number,
        max: number
    ): number {
        return (
            min +
            Math.random() * (max - min)
        );
    }

    private round(
        value: number,
        decimals: number
    ): number {
        const multiplier = 10 ** decimals;

        return (
            Math.round(value * multiplier) /
            multiplier
        );
    }
}