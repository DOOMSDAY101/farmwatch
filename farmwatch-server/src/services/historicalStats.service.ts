import { getInvestigations } from "../repository/investigationRepository";
import { FarmReading } from "../types/types";

export interface HistoricalStats {
  sampleSize: number;
  water?: { average: number; minimum: number; maximum: number };
  feed?: { average: number; minimum: number; maximum: number };
  eggs?: { average: number; minimum: number; maximum: number };
  temperature?: { average: number; minimum: number; maximum: number };
  message?: string;
}

export async function getHistoricalStats(currentReading: FarmReading): Promise<HistoricalStats> {
  const investigations = await getInvestigations(50);

  // Only use investigations that belong to the same house as the current reading.
  const historicalReadings = investigations
    .filter((investigation) => investigation.houseId === currentReading.houseId)
    .map((investigation) => investigation.reading)
    .filter((reading) => reading !== currentReading)
    .slice(0, 10);

  if (historicalReadings.length === 0) {
    return {
      sampleSize: 0,
      message: "No historical readings available.",
    };
  }

  const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
  const min = (values: number[]) => Math.min(...values);
  const max = (values: number[]) => Math.max(...values);

  const waterValues = historicalReadings.map((r) => r.waterLiters);
  const feedValues = historicalReadings.map((r) => r.feedKg);
  const eggValues = historicalReadings.map((r) => r.eggCount);
  const temperatureValues = historicalReadings.map((r) => r.temperatureC);

  return {
    sampleSize: historicalReadings.length,
    water: {
      average: Number(average(waterValues).toFixed(2)),
      minimum: min(waterValues),
      maximum: max(waterValues),
    },
    feed: {
      average: Number(average(feedValues).toFixed(2)),
      minimum: min(feedValues),
      maximum: max(feedValues),
    },
    eggs: {
      average: Number(average(eggValues).toFixed(2)),
      minimum: min(eggValues),
      maximum: max(eggValues),
    },
    temperature: {
      average: Number(average(temperatureValues).toFixed(2)),
      minimum: min(temperatureValues),
      maximum: max(temperatureValues),
    },
  };
}
