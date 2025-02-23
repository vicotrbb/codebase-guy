import { Settings } from "@/types";

export const getSettings = async () => {
  const foundSettings = await prisma.settings.findFirst();
  return foundSettings as Settings;
};
