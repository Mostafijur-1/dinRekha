"use client";

import { useState } from "react";

import { useInstallApp } from "@/features/pwa/install-provider";

function isStandalone() {
  const navigatorWithStandalone = navigator as Navigator & {
    standalone?: boolean;
  };
  return (
    window.matchMedia?.("(display-mode: standalone)").matches === true ||
    navigatorWithStandalone.standalone === true
  );
}

function isAppleMobile() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function InstallControl({ compact = false }: { compact?: boolean }) {
  const { installed, promptAvailable, requestInstall } = useInstallApp();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function install() {
    if (installed || isStandalone()) {
      setMessage("দিনরেখা ইতিমধ্যে এই ডিভাইসে ইনস্টল করা আছে।");
      return;
    }

    if (!promptAvailable) {
      setMessage(
        isAppleMobile()
          ? "Safari-এর Share বোতাম চাপুন, তারপর ‘Add to Home Screen’ বেছে নিন।"
          : "Browser menu খুলে ‘Install app’ বা ‘Add to Home screen’ বেছে নিন।",
      );
      return;
    }

    setPending(true);
    try {
      const outcome = await requestInstall();
      setMessage(
        outcome === "accepted"
          ? "ইনস্টল শুরু হয়েছে। সম্পন্ন হলে দিনরেখা আলাদা অ্যাপ হিসেবে খুলবে।"
          : "ইনস্টল বাতিল হয়েছে। চাইলে পরে আবার চেষ্টা করতে পারবেন।",
      );
    } catch {
      setMessage(
        "Install prompt খোলা যায়নি। Browser menu থেকে আবার চেষ্টা করুন।",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={compact ? "install-control is-compact" : "install-control"}>
      <button
        className={
          compact
            ? "button button-quiet"
            : "activity-button activity-button-primary"
        }
        disabled={pending}
        onClick={install}
        type="button"
      >
        <span aria-hidden="true">⇩</span>
        {pending
          ? "অপেক্ষা করুন…"
          : installed
            ? "ইনস্টল করা আছে"
            : "অ্যাপ ইনস্টল করুন"}
      </button>
      {message && <p role="status">{message}</p>}
    </div>
  );
}
