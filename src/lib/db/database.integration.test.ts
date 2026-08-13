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

    const activityIndexes = await database
      .collection("dailyActivities")
      .indexes();
    expect(
      activityIndexes.some(
        (index) => index.name === "daily_activity_owner_list",
      ),
    ).toBe(true);

    const progressIndexes = await database
      .collection("dailyActivityProgress")
      .indexes();
    expect(
      progressIndexes.find(
        (index) => index.name === "daily_progress_owner_activity_date_unique",
      )?.unique,
    ).toBe(true);

    const timelineIndexes = await database
      .collection("timelineEntries")
      .indexes();
    expect(
      timelineIndexes.some(
        (index) => index.name === "timeline_owner_date_start",
      ),
    ).toBe(true);
  });

  it("stores daily progress and rejects a different owner", async () => {
    const ownerId = new ObjectId();
    const otherOwnerId = new ObjectId();
    const activityId = new ObjectId();
    const now = new Date();
    await client.db(databaseName).collection("dailyActivities").insertOne({
      _id: activityId,
      ownerId,
      name: "হাঁটা",
      category: "স্বাস্থ্য",
      measurement: "duration",
      target: 30,
      unit: "মিনিট",
      status: "active",
      sortOrder: 1,
      createdAt: now,
      updatedAt: now,
    });

    const { listDailyActivities, setDailyProgress } =
      await import("@/features/daily-activities/repository");
    await expect(
      setDailyProgress(
        otherOwnerId.toHexString(),
        activityId.toHexString(),
        "2026-08-13",
        20,
      ),
    ).resolves.toBe(false);
    await expect(
      setDailyProgress(
        ownerId.toHexString(),
        activityId.toHexString(),
        "2026-08-13",
        30,
      ),
    ).resolves.toBe(true);

    const activities = await listDailyActivities(
      ownerId.toHexString(),
      "2026-08-13",
    );
    expect(activities).toEqual([
      expect.objectContaining({
        id: activityId.toHexString(),
        value: 30,
        completed: true,
      }),
    ]);
  });

  it("shows selected-day activities only on their scheduled weekday", async () => {
    const ownerId = new ObjectId();
    const activityId = new ObjectId();
    const now = new Date();
    await client
      .db(databaseName)
      .collection("dailyActivities")
      .insertOne({
        _id: activityId,
        ownerId,
        name: "সাপ্তাহিক পরিকল্পনা",
        category: "কাজ",
        measurement: "boolean",
        target: 1,
        frequency: "selected_days",
        days: [1],
        status: "active",
        sortOrder: 2,
        createdAt: now,
        updatedAt: now,
      });

    const { listDailyActivities, setDailyProgress } =
      await import("@/features/daily-activities/repository");
    const monday = "2026-08-17";
    const tuesday = "2026-08-18";
    await expect(
      setDailyProgress(
        ownerId.toHexString(),
        activityId.toHexString(),
        tuesday,
        1,
      ),
    ).resolves.toBe(false);
    await expect(
      listDailyActivities(ownerId.toHexString(), tuesday),
    ).resolves.toEqual([]);
    await expect(
      setDailyProgress(
        ownerId.toHexString(),
        activityId.toHexString(),
        monday,
        1,
      ),
    ).resolves.toBe(true);
    await expect(
      listDailyActivities(ownerId.toHexString(), monday),
    ).resolves.toEqual([
      expect.objectContaining({
        id: activityId.toHexString(),
        completed: true,
        frequency: "selected_days",
        days: [1],
      }),
    ]);
  });

  it("stores owner-scoped Timeline entries and rejects overlaps", async () => {
    const ownerId = new ObjectId();
    const otherOwnerId = new ObjectId();
    const { createTimelineEntry, deleteTimelineEntry, listTimelineEntries } =
      await import("@/features/timeline/repository");
    const first = await createTimelineEntry(
      ownerId.toHexString(),
      "2026-08-13",
      {
        activity: "পড়াশোনা",
        category: "কাজ",
        startTime: "09:00",
        endTime: "10:00",
        note: "অধ্যায় এক",
      },
    );
    expect(first).toBe("success");
    await expect(
      createTimelineEntry(ownerId.toHexString(), "2026-08-13", {
        activity: "হাঁটা",
        category: "স্বাস্থ্য",
        startTime: "09:30",
        endTime: "10:30",
        note: "",
      }),
    ).resolves.toBe("overlap");
    const entries = await listTimelineEntries(
      ownerId.toHexString(),
      "2026-08-13",
    );
    expect(entries).toEqual([
      expect.objectContaining({
        activity: "পড়াশোনা",
        startTime: "09:00",
        endTime: "10:00",
      }),
    ]);
    await expect(
      deleteTimelineEntry(otherOwnerId.toHexString(), entries[0].id),
    ).resolves.toBe(false);
    await expect(
      deleteTimelineEntry(ownerId.toHexString(), entries[0].id),
    ).resolves.toBe(true);
  });
});
