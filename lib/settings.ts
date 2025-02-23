import { PublicSettings, Settings } from "@/types";

let settings: Settings | undefined = undefined;

(async () => {
  const foundSettings = await prisma.settings.findFirst();

  if (foundSettings) {
    settings = foundSettings;
    global.settings = settings;
  }
})();

export const getSettings = (): Settings | null => {
  // Just to make sure
  if (typeof window !== "undefined") {
    throw new Error("getSettings can only be called from server-side code");
  }

  if (!settings) {
    return null;
  }

  return settings;
};

export default settings;
