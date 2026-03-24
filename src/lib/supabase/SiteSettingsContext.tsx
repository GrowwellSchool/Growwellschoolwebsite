"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "./browserClient";

type SettingsMap = Record<string, unknown>;
type SettingsCache = Record<string, { value: unknown; updatedAt: number }>;

interface SiteSettingsContextValue {
  /** Get a cached setting value, or null if not loaded yet */
  getSetting: (key: string) => unknown | null;
  /** Subscribe to a setting - returns the current value and triggers re-renders on change */
  useSetting: <T = unknown>(key: string) => T | null;
  /** Batch load multiple settings at once */
  loadSettings: (keys: string[]) => Promise<void>;
  /** Check if settings have been loaded */
  isLoaded: (key: string) => boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue | null>(null);

const CACHE_TTL_MS = 60_000; // 1 minute cache

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const cacheRef = useRef<SettingsCache>({});
  const [, forceUpdate] = useState({});
  const subscribersRef = useRef<Set<string>>(new Set());
  const channelRef = useRef<RealtimeChannel | null>(null);
  const loadedKeysRef = useRef<Set<string>>(new Set());

  const notifySubscribers = useCallback((key: string) => {
    // Force a re-render for components using this key
    forceUpdate({});
  }, []);

  const applySetting = useCallback((key: string, value: unknown, version: string | number) => {
    const now = Date.now();
    cacheRef.current[key] = { value, updatedAt: now };
    loadedKeysRef.current.add(key);
    notifySubscribers(key);
  }, [notifySubscribers]);

  const loadSettings = useCallback(async (keys: string[]) => {
    if (keys.length === 0) return;

    const supabase = getSupabaseBrowserClient();

    // Batch fetch all requested keys in one query
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value, updated_at")
      .in("key", keys);

    if (error) {
      console.error("Failed to load settings:", error);
      return;
    }

    const now = Date.now();
    for (const row of data || []) {
      const version = (row.value as { version?: unknown })?.version ?? row.updated_at ?? now;
      cacheRef.current[row.key] = { value: row.value, updatedAt: now };
      loadedKeysRef.current.add(row.key);
    }

    forceUpdate({});
  }, []);

  const getSetting = useCallback((key: string): unknown | null => {
    const cached = cacheRef.current[key];
    if (!cached) return null;

    // Check if cache is still valid
    const now = Date.now();
    if (now - cached.updatedAt > CACHE_TTL_MS) {
      return null; // Cache expired
    }

    return cached.value;
  }, []);

  // Set up a single realtime subscription for all site_settings changes
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const channel = supabase
      .channel("site-settings-global")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings" },
        (payload) => {
          const row = payload.new as { key?: string; value?: unknown; updated_at?: string } | undefined;
          if (row?.key) {
            const value = row.value as { version?: unknown } | null;
            const versionFromValue = value?.version;
            const version = versionFromValue ?? row.updated_at ?? Date.now();
            applySetting(row.key, row.value, String(version));
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [applySetting]);

  const isLoaded = useCallback((key: string) => {
    return loadedKeysRef.current.has(key);
  }, []);

  const contextValue = useMemo<SiteSettingsContextValue>(() => ({
    getSetting,
    useSetting: <T = unknown,>(key: string): T | null => {
      // Track subscription
      subscribersRef.current.add(key);

      // Trigger load if not already loaded
          if (!loadedKeysRef.current.has(key)) {
            loadSettings([key]);
          }

      const cached = cacheRef.current[key];
      return cached?.value as T | null;
    },
    loadSettings,
    isLoaded,
  }), [getSetting, loadSettings, isLoaded]);

  return (
    <SiteSettingsContext.Provider value={contextValue}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error("useSiteSettings must be used within a SiteSettingsProvider");
  }
  return context;
}

/** Hook to get a single setting with automatic loading and realtime updates */
export function useSiteSetting<T = unknown>(key: string): { value: T | null; isLoading: boolean } {
  const { getSetting, loadSettings, isLoaded } = useSiteSettings();

  useEffect(() => {
    if (!isLoaded(key)) {
      loadSettings([key]);
    }
  }, [key, loadSettings, isLoaded]);

  const value = getSetting(key) as T | null;
  const isLoading = !isLoaded(key);

  return { value, isLoading };
}

/** Hook to batch load multiple settings at once */
export function useSiteSettingsBatch<T extends Record<string, unknown>>(
  keys: string[]
): { values: Partial<T>; isLoading: boolean } {
  const { getSetting, loadSettings, isLoaded } = useSiteSettings();

  useEffect(() => {
    const unloadedKeys = keys.filter(k => !isLoaded(k));
    if (unloadedKeys.length > 0) {
      loadSettings(unloadedKeys);
    }
  }, [keys.join(","), loadSettings, isLoaded]);

  const values: Partial<T> = {};
  let isLoading = false;

  for (const key of keys) {
    if (isLoaded(key)) {
      values[key as keyof T] = getSetting(key) as T[keyof T];
    } else {
      isLoading = true;
    }
  }

  return { values, isLoading };
}
