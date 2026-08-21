import { useEffect, useState } from "react";
import { api, API_URL } from "../api/client";

const DISMISS_KEY = "push-prompt-dismissed";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationPrompt() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supported =
      typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
    if (!supported) return;
    if (Notification.permission !== "default") return;
    if (localStorage.getItem(DISMISS_KEY)) return;
    setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  const enable = async () => {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        dismiss();
        return;
      }

      const { public_key: publicKey } = await fetch(`${API_URL}/push/vapid-public-key`).then((r) => r.json());
      if (!publicKey) {
        dismiss();
        return;
      }

      const registration = await navigator.serviceWorker.register("/push-sw.js");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const raw = subscription.toJSON();
      await api.post("/push/subscribe", { endpoint: raw.endpoint, keys: raw.keys });

      setVisible(false);
    } catch {
      dismiss();
    } finally {
      setBusy(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="border border-line bg-paper-raised px-4 py-3 mb-6 flex items-center justify-between gap-3 flex-wrap">
      <p className="text-sm">Get notified the moment a new post goes up?</p>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={enable}
          disabled={busy}
          className="border border-line bg-paper px-3 py-1.5 hover:border-ink transition-colors font-mono text-xs uppercase tracking-wide"
        >
          {busy ? "Enabling..." : "Enable notifications"}
        </button>
        <button
          onClick={dismiss}
          className="font-mono text-xs uppercase tracking-wide text-ink-soft hover:text-ink"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
