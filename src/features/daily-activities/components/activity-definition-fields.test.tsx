import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ActivityDefinitionFields } from "@/features/daily-activities/components/activity-definition-fields";

describe("ActivityDefinitionFields", () => {
  it("offers every supported measurement without hard-coded activity names", () => {
    render(<ActivityDefinitionFields />);
    expect(screen.getByLabelText("Activity-এর নাম")).toBeRequired();
    expect(
      screen.getByRole("option", { name: "Done / Not Done" }),
    ).toBeVisible();
    expect(screen.getByRole("option", { name: "কতবার" })).toBeVisible();
    expect(screen.getByRole("option", { name: "সময়" })).toBeVisible();
    expect(screen.getByRole("option", { name: "পরিমাণ" })).toBeVisible();
  });
});
