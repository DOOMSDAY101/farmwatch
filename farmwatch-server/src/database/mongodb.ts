import { MongoClient, Db } from "mongodb";
require("dotenv").config();

const uri = process.env.MONGODB_URI;

if (!uri) {
    throw new Error("MONGODB_URI is not defined");
}

const client = new MongoClient(uri);

let database: Db | null = null;

export async function getDatabase(): Promise<Db> {
    if (database) {
        return database;
    }

    await client.connect();

    database = client.db(
        process.env.MONGODB_DATABASE || "farmwatch"
    );

    console.log("🍃 Connected to MongoDB");

    return database;
}

export async function closeDatabase() {
    await client.close();
    database = null;
}