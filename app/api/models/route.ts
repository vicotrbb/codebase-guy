import { getSettings } from "@/lib/settings";
import { ModelProvider } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function GET(request: NextRequest) {
  try {
    const settings = await getSettings();
    const { searchParams } = request.nextUrl;
    const provider = searchParams.get("provider") as ModelProvider;
    const overrideUrl = searchParams.get("overrideUrl");

    if (provider === ModelProvider.OPENAI) {
      if (!settings || !settings.modelApiKey) {
        return NextResponse.json(
          { error: "OpenAI API key not configured" },
          { status: 400 }
        );
      }

      const openai = new OpenAI({
        apiKey: settings.modelApiKey,
        baseURL:
          overrideUrl ??
          settings.openApiCompatibleApiUrl ??
          process.env["OPENAI_BASE_URL"],
      });

      const response = await openai.models.list();

      const models = response.data.map((model) => ({
        id: model.id,
        name: model.id.split(":")[0],
      }));

      return NextResponse.json({ models }, { status: 200 });
    } else if (provider === ModelProvider.OLLAMA) {
      const response = await fetch(
        `${overrideUrl ?? settings.ollamaUrl}/api/tags`
      );

      const data = await response.json();
      const models = data.models.map((model: any) => ({
        id: model.model,
        name: model.name,
      }));

      return NextResponse.json(models, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "Model provider not supported" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
