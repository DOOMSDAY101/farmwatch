import { getDatabase } from "../database/mongodb";
import {
    InvestigationDocument,
} from "../types/types";

const COLLECTION_NAME = "investigations";

export async function saveInvestigation(
    investigation: InvestigationDocument
) {
    const db = await getDatabase();

    const collection =
        db.collection<InvestigationDocument>(
            COLLECTION_NAME
        );

    const result = await collection.insertOne(
        investigation
    );

    console.log(
        `💾 Investigation stored: ${result.insertedId}`
    );

    return result.insertedId;
}

export async function getInvestigations(
    limit = 50
) {
    const db = await getDatabase();

    const collection =
        db.collection<InvestigationDocument>(
            COLLECTION_NAME
        );

    return collection
        .find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
}

export async function getInvestigationById(
    anomalyId: string
) {
    const db = await getDatabase();

    const collection =
        db.collection<InvestigationDocument>(
            COLLECTION_NAME
        );

    return collection.findOne({
        anomalyId,
    });
}
export async function getInvestigationsByHouse(
    houseId: string,
    limit = 10
) {
    const db = await getDatabase();

    const collection =
        db.collection<InvestigationDocument>(
            COLLECTION_NAME
        );

    return collection
        .find({ houseId })
        .sort({ detectedAt: -1 })
        .limit(limit)
        .toArray();
}