"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { PublicSettings } from "@/types";

interface SettingsContextType {
  settings: PublicSettings;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: {} as PublicSettings,
  refreshSettings: async () => {},
});

export function usePublicSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("usePublicSettings must be used within a SettingsProvider");
  }
  return context.settings;
}

export function useSettingsRefresh() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error(
      "useSettingsRefresh must be used within a SettingsProvider"
    );
  }
  return context.refreshSettings;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [publicSettings, setPublicSettings] = useState<PublicSettings>(
    {} as PublicSettings
  );

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch("/api/settings");
      const settings = await response.json();

      // Only extract the public settings properties
      const filteredSettings: PublicSettings = {
        guyName: settings.guyName,
        modelProvider: settings.modelProvider,
        weakModel: settings.weakModel,
        strongModel: settings.strongModel,
        reasoningModel: settings.reasoningModel,
        cacheEnabled: settings.cacheEnabled,
        cacheProvider: settings.cacheProvider,
        webSearchEnabled: settings.webSearchEnabled,
        webSearchProvider: settings.webSearchProvider,
        allowAgenticMode: settings.allowAgenticMode,
      };

      setPublicSettings(filteredSettings);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  if (!publicSettings) {
    return null; // or a loading spinner
  }

  return (
    <SettingsContext.Provider
      value={{ settings: publicSettings, refreshSettings: fetchSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
