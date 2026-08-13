import { MongoClient, MongoServerError, ObjectId } from "mongodb";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const testUri = process.env.MONGODB_TEST_URI;
const describeWithDatabase = testUri ? describe : describe.skip;

describeWithDatabase("MongoDB authentication persistence", () => {
  const databaseName = `chondo_test_${process.pid}_${Date.now()}`;
  let client: MongoClient;

  beforeAll(async () => {
    process.env.MONGODB_URI = testUri;
    process.env.MONGODB_DB_NAME = databaseName;
    process.env.AUTH_SECRET ??=
      "integration-test-auth-secret-at-least-32-characters";
    client = new MongoClient(testUri!);
    await client.connect();

    const { ensureDatabaseIndexes } = await import("@/lib/db/indexes");
    await ensureDatabaseIndexes();
  });

  afterAll(async () => {
    await client?.db(databaseName).dropDatabase();
    await client?.close();
  });

  it("enforces unique user and Google identity indexes", async () => {
    const database = client.db(databaseName);
    const users = database.collection("users");
    const now = new Date();
    const user = {
      email: "index@example.com",
      emailNormalized: "index@example.com",
      name: "Index User",
      status: "active",
      sessionVersion: 1,
      profile: { timezone: "Asia/Dhaka", initializedAt: now },
      createdAt: now,
      updatedAt: now,
    };

    await users.insertOne({ _id: new ObjectId(), ...user });
    let duplicateError: unknown;
    try {
      await users.insertOne({ _id: new ObjectId(), ...user });
    } catch (error) {
      duplicateError = error;
    }
    expect(duplicateError).toBeInstanceOf(MongoServerError);
    expect((duplicateError as MongoServerError).code).toBe(11000);

    const accountIndexes = await database.collection("oauthAccounts").indexes();
    const identityIndex = accountIndexes.find(
      (index) => index.name === "oauth_provider_account_unique",
    );
    expect(identityIndex?.unique).toBe(true);
  });
});
