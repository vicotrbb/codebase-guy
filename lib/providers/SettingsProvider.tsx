"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { PublicSettings } from "@/types";

const SettingsContext = createContext<PublicSettings>({} as PublicSettings);

export function usePublicSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("usePublicSettings must be used within a SettingsProvider");
  }
  return context;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [publicSettings, setPublicSettings] = useState<PublicSettings>(
    {} as PublicSettings
  );

  useEffect(() => {
    async function fetchSettings() {
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
          agenticModeEnabled: settings.agenticModeEnabled,
        };

        setPublicSettings(filteredSettings);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    }

    fetchSettings();
  }, []);

  if (!publicSettings) {
    return null; // or a loading spinner
  }

  return (
    <SettingsContext.Provider value={publicSettings}>
      {children}
    </SettingsContext.Provider>
  );
}
