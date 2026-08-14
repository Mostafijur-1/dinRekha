import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ConnectionDisconnectButton } from "@/features/connections/connection-disconnect-button";

describe("ConnectionDisconnectButton", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("does not submit when disconnect confirmation is cancelled", () => {
    const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
    vi.stubGlobal(
      "confirm",
      vi.fn(() => false),
    );
    render(
      <form onSubmit={submit}>
        <ConnectionDisconnectButton name="রাফি" />
      </form>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "সংযোগ বিচ্ছিন্ন করুন" }),
    );

    expect(confirm).toHaveBeenCalledWith(
      "রাফি-এর সঙ্গে সংযোগ বিচ্ছিন্ন করবেন? আবার যুক্ত হতে নতুন Invitation প্রয়োজন হবে।",
    );
    expect(submit).not.toHaveBeenCalled();
  });

  it("submits only after disconnect confirmation", () => {
    const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true),
    );
    render(
      <form onSubmit={submit}>
        <ConnectionDisconnectButton name="রাফি" />
      </form>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "সংযোগ বিচ্ছিন্ন করুন" }),
    );

    expect(submit).toHaveBeenCalledOnce();
  });
});
