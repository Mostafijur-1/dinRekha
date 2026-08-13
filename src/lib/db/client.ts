import "server-only";

import { Db, MongoClient } from "mongodb";

import { getServerEnvironment } from "@/lib/env.server";

type MongoGlobal = typeof globalThis & {
  __dinrekhaMongoClientPromise?: Promise<MongoClient>;
};

const mongoGlobal = globalThis as MongoGlobal;

function createClientPromise(): Promise<MongoClient> {
  const { MONGODB_URI } = getServerEnvironment();
  const client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 10,
    minPoolSize: 0,
    maxIdleTimeMS: 10_000,
    serverSelectionTimeoutMS: 5_000,
    connectTimeoutMS: 10_000,
    retryReads: true,
    retryWrites: true,
  });

  return client.connect().catch((error: unknown) => {
    mongoGlobal.__dinrekhaMongoClientPromise = undefined;
    throw error;
  });
}

export function getMongoClient(): Promise<MongoClient> {
  mongoGlobal.__dinrekhaMongoClientPromise ??= createClientPromise();
  return mongoGlobal.__dinrekhaMongoClientPromise;
}

export async function getDatabase(): Promise<Db> {
  const [client, environment] = await Promise.all([
    getMongoClient(),
    Promise.resolve(getServerEnvironment()),
  ]);

  return client.db(environment.MONGODB_DB_NAME);
}
