"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { Nav } from "@/components/Nav";

const STORAGE_KEY = "signet.notification-prefs";

type Prefs = {
  email: string;
  sevenDayReminder: boolean;
  oneDayReminder: boolean;
};

const defaultPrefs: Prefs = { email: "", sevenDayReminder: true, oneDayReminder: true };

function subscribeToStorage() {
  return () => {};
}

function getStorageSnapshot() {
  return localStorage.getItem(STORAGE_KEY);
}

function getStorageServerSnapshot() {
  return null;
}

export default function SettingsPage() {
  const router = useRouter();
  const { ready, authenticated, logout } = usePrivy();
  const [saved, setSaved] = useState(false);
  const [edits, setEdits] = useState<Partial<Prefs>>({});

  useEffect(() => {
    if (!ready) return;
    if (!authenticated) router.push("/");
  }, [ready, authenticated, router]);

  const storedRaw = useSyncExternalStore(
    subscribeToStorage,
    getStorageSnapshot,
    getStorageServerSnapshot
  );

  const stored = useMemo<Prefs>(() => {
    if (!storedRaw) return defaultPrefs;
    try {
      return { ...defaultPrefs, ...JSON.parse(storedRaw) };
    } catch {
      return defaultPrefs;
    }
  }, [storedRaw]);

  const prefs: Prefs = { ...stored, ...edits };

  function updatePrefs(patch: Partial<Prefs>) {
    setEdits((prev) => ({ ...prev, ...patch }));
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col flex-1">
      <Nav />
      <main className="flex-1 w-full max-w-lg mx-auto px-6 py-12 flex flex-col gap-8">
        <h1 className="text-2xl font-bold">Settings</h1>

        <label className="flex flex-col gap-2 text-sm text-muted">
          Email for reminders
          <input
            type="email"
            placeholder="you@example.com"
            value={prefs.email}
            onChange={(e) => updatePrefs({ email: e.target.value })}
            className="rounded-md border border-muted/30 bg-transparent px-4 py-3 text-fg focus:border-accent focus:outline-none"
          />
        </label>

        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 text-sm text-fg">
            <input
              type="checkbox"
              checked={prefs.sevenDayReminder}
              onChange={(e) => updatePrefs({ sevenDayReminder: e.target.checked })}
              className="accent-accent"
            />
            Remind me 7 days before expiry
          </label>
          <label className="flex items-center gap-3 text-sm text-fg">
            <input
              type="checkbox"
              checked={prefs.oneDayReminder}
              onChange={(e) => updatePrefs({ oneDayReminder: e.target.checked })}
              className="accent-accent"
            />
            Remind me 24 hours before expiry
          </label>
        </div>

        <button
          onClick={save}
          className="self-start rounded-full bg-fg px-6 py-3 text-sm font-medium text-bg hover:opacity-90 transition-opacity"
        >
          {saved ? "Saved" : "Save preferences"}
        </button>

        <button
          onClick={() => logout()}
          className="self-start rounded-full border border-wax px-6 py-3 text-sm font-medium text-wax hover:bg-wax hover:text-fg transition-colors"
        >
          Disconnect wallet
        </button>
      </main>
    </div>
  );
}
