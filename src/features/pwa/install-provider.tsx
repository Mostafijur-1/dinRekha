"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type InstallChoice = { outcome: "accepted" | "dismissed" };

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
};

type InstallContextValue = {
  installed: boolean;
  promptAvailable: boolean;
  requestInstall: () => Promise<InstallChoice["outcome"] | "unavailable">;
};

const InstallContext = createContext<InstallContextValue | null>(null);

export function InstallProvider({ children }: { children: ReactNode }) {
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    function capturePrompt(event: Event) {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    }

    function markInstalled() {
      setInstalled(true);
      setPromptEvent(null);
    }

    window.addEventListener("beforeinstallprompt", capturePrompt);
    window.addEventListener("appinstalled", markInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", capturePrompt);
      window.removeEventListener("appinstalled", markInstalled);
    };
  }, []);

  async function requestInstall() {
    if (!promptEvent) return "unavailable" as const;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    setPromptEvent(null);
    return choice.outcome;
  }

  return (
    <InstallContext.Provider
      value={{
        installed,
        promptAvailable: Boolean(promptEvent),
        requestInstall,
      }}
    >
      {children}
    </InstallContext.Provider>
  );
}

export function useInstallApp() {
  const context = useContext(InstallContext);
  if (!context)
    throw new Error("useInstallApp must be used inside InstallProvider");
  return context;
}
