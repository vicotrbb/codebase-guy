import { ModelProvider } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const provider = searchParams.get("provider") as ModelProvider;
    const overrideUrl = searchParams.get("overrideUrl");

    if (provider === ModelProvider.OPENAI) {
      return NextResponse.json(
        {
          models: [
            {
              id: "gpt-4o",
              name: "GPT-4o",
            },
            {
              id: "gpt-4o-mini",
              name: "GPT-4o Mini",
            },
          ],
        },
        { status: 200 }
      );
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
