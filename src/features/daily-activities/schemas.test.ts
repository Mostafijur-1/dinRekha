import { describe, expect, it } from "vitest";

import { activityDefinitionSchema } from "@/features/daily-activities/schemas";

const base = {
  name: "সকালের হাঁটা",
  description: "",
  category: "স্বাস্থ্য",
  target: 1,
  unit: "",
};

describe("Daily Activity validation", () => {
  it("keeps boolean targets unambiguous", () => {
    const result = activityDefinitionSchema.safeParse({
      ...base,
      measurement: "boolean",
      target: 2,
    });
    expect(result.success).toBe(false);
  });

  it("requires a unit for quantity measurement", () => {
    const result = activityDefinitionSchema.safeParse({
      ...base,
      measurement: "quantity",
    });
    expect(result.success).toBe(false);
  });

  it("defaults duration measurement to minutes", () => {
    const result = activityDefinitionSchema.parse({
      ...base,
      measurement: "duration",
      target: 30,
    });
    expect(result.unit).toBe("মিনিট");
  });
});
