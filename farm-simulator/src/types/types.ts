export interface FarmReading {
    farmId: string;
    timestamp: string;
    houseId: string;

    temperatureC: number;
    waterLiters: number;
    feedKg: number;
    eggCount: number;
}