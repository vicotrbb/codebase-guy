import { WebSearchProvider } from "@prisma/client";
import { getSettings } from "./settings";
import { WebSearchResult } from "@/types";
import { Readability } from "@mozilla/readability";
import got from "got";
import { generateContent } from "./llm";
import { JSDOM } from "jsdom";

export async function searchWeb({
  query,
  limit = 5,
}: {
  query: string;
  limit: number;
}): Promise<WebSearchResult[]> {
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
        content: null,
      }));

      return results;
    } else {
      return [];
    }
  } else {
    throw new Error("Web search provider is not configured.");
  }
}

export const fetchWebContent = async (
  url: string,
  summarize: boolean = false
): Promise<string> => {
  const html = await got(url, { responseType: "text" });

  const dom = new JSDOM(html.body, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  const body = article?.textContent ?? "";

  if (summarize) {
    const settings = await getSettings();

    const summarizedContent = await generateContent({
      model: settings.weakModel,
      prompt: `
      You are a helpful assistant that summarizes web content. Summarize the following content, focusing on the most important technical information:

      <web-content>
      ${body}
      </web-content>

      <summary>
      </summary>
      `,
    });

    return summarizedContent;
  }

  return body;
};

export const searchWebByQuery = async (
  query: string,
  limit: number = 5,
  summarize: boolean = false
): Promise<WebSearchResult[]> => {
  const settings = await getSettings();

  if (!settings.webSearchEnabled) {
    return [];
  }

  const webQuery = await generateContent({
    model: settings.weakModel,
    prompt: `
    You are a helpful assistant that generates a web query based on a user's question. The query should be a single sentence that captures the user's question. The query should be no more than 100 characters. The query should be in natural language. The query should be in the same language as the user's question.

    <user-question>
    ${query}
    </user-question>

    <web-query>
    </web-query>
    `,
  });

  const results = await searchWeb({ query: webQuery, limit });
  const content = await Promise.all(
    results.map((result) => fetchWebContent(result.link, summarize))
  );

  return results.map((result, index) => ({
    ...result,
    content: content[index],
  }));
};
