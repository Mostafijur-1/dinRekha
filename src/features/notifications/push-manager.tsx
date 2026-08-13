"use client";

import { useEffect, useState } from "react";

function applicationKey(value: string) {
  const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
  const raw = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

export function PushManager({ publicKey }: { publicKey?: string }) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const available =
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;
    if (!available) {
      queueMicrotask(() => setSupported(false));
      return;
    }
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((registration) => registration.pushManager.getSubscription())
      .then((current) => {
        setSupported(true);
        setSubscription(current);
      })
      .catch(() => setMessage("Service Worker চালু করা যায়নি।"));
  }, []);

  async function subscribe() {
    if (!publicKey)
      return setMessage("Push notification এখনো server-এ configure করা হয়নি।");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted")
        return setMessage("Browser notification permission দেয়নি।");
      const registration = await navigator.serviceWorker.ready;
      const next = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationKey(publicKey),
      });
      const response = await fetch("/api/notifications/subscription", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!response.ok) {
        await next.unsubscribe();
        throw new Error();
      }
      setSubscription(next);
      setMessage("এই device-এ Push Reminder চালু হয়েছে।");
    } catch {
      setMessage("Push Reminder চালু করা যায়নি। আবার চেষ্টা করুন।");
    }
  }

  async function unsubscribe() {
    if (!subscription) return;
    const response = await fetch("/api/notifications/subscription", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
    if (!response.ok) {
      setMessage("Push Reminder বন্ধ করা যায়নি। আবার চেষ্টা করুন।");
      return;
    }
    await subscription.unsubscribe();
    setSubscription(null);
    setMessage("এই device-এর Push Reminder বন্ধ হয়েছে।");
  }

  if (supported === false)
    return (
      <p>
        এই browser-এ Push Notification সমর্থিত নয়। Dashboard Reminder ব্যবহার
        করতে পারবেন।
      </p>
    );
  return (
    <div className="push-manager">
      <p>
        HTTPS ও supported browser-এ দিনরেখা বন্ধ থাকলেও generic Reminder পেতে
        পারেন।
      </p>
      <button
        type="button"
        className="activity-button"
        onClick={subscription ? unsubscribe : subscribe}
        disabled={supported !== true}
      >
        {subscription
          ? "এই device-এ Push বন্ধ করুন"
          : "এই device-এ Push চালু করুন"}
      </button>
      {message && <p role="status">{message}</p>}
    </div>
  );
}
