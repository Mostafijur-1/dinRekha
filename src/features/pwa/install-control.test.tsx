import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { InstallControl } from "@/features/pwa/install-control";
import {
  type BeforeInstallPromptEvent,
  InstallProvider,
} from "@/features/pwa/install-provider";

function renderControl() {
  return render(
    <InstallProvider>
      <InstallControl />
    </InstallProvider>,
  );
}

function dispatchInstallPrompt(outcome: "accepted" | "dismissed") {
  const event = new Event("beforeinstallprompt", {
    cancelable: true,
  }) as BeforeInstallPromptEvent;
  event.prompt = vi.fn().mockResolvedValue(undefined);
  event.userChoice = Promise.resolve({ outcome });
  window.dispatchEvent(event);
  return event;
}

describe("InstallControl", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockReturnValue({ matches: false }),
    });
  });

  it("opens the native install prompt and reports acceptance", async () => {
    renderControl();
    const promptEvent = dispatchInstallPrompt("accepted");

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /অ্যাপ ইনস্টল করুন/ }),
      ).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: /অ্যাপ ইনস্টল করুন/ }));

    await waitFor(() => expect(promptEvent.prompt).toHaveBeenCalledOnce());
    expect(await screen.findByRole("status")).toHaveTextContent(
      "ইনস্টল শুরু হয়েছে",
    );
  });

  it("marks the app as installed when the browser confirms it", async () => {
    renderControl();
    window.dispatchEvent(new Event("appinstalled"));
    expect(
      await screen.findByRole("button", { name: /ইনস্টল করা আছে/ }),
    ).toBeVisible();
  });

  it("shows browser instructions when a native prompt is unavailable", async () => {
    renderControl();
    fireEvent.click(screen.getByRole("button", { name: /অ্যাপ ইনস্টল করুন/ }));
    expect(await screen.findByRole("status")).toHaveTextContent("Browser menu");
  });
});
