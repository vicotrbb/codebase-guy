import { WebSearchProvider } from "@prisma/client";
import { getSettings } from "./settings";

export async function searchWeb({
  query,
  limit = 20,
}: {
  query: string;
  limit: number;
}) {
  const settings = await getSettings();

  if (settings.webSearchProvider === WebSearchProvider.SERPER) {
    if (!settings.serperApiKey || !settings.serperUrl) {
      throw new Error("Serper is not configured.");
    }

    const response = await fetch(`${settings.serperUrl}/search`, {
      method: "POST",
      headers: {
        "X-API-KEY": settings.serperApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query,
        engine: "google",
        num: limit,
      }),
      redirect: "follow",
    });

    const searchResults = await response.json();
    if (searchResults.organic && Array.isArray(searchResults.organic)) {
      const results = searchResults.organic.map((searchItem: any) => ({
        title: searchItem.title,
        link: searchItem.link,
        snippet: searchItem.snippet,
      }));

      return results;
    } else {
      return [];
    }
  } else {
    throw new Error("Web search provider is not configured.");
  }
}
