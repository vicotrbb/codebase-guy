import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { generateContent } from "@/lib/llm";
import { getSettings } from "@/lib/settings";

export async function GET() {
  try {
    const chats = await prisma.chat.findMany({
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(chats, { status: 200 });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { firstMessage } = await request.json();
    const settings = await getSettings();

    // Generate chat name based on the first message
    const chatName = await generateContent({
      model: settings.weakModel,
      prompt: `
        <goal>
        Generate a short name for a chat based on the user's first message.
        </goal>

        <instructions>
        - The name should be descriptive of the chat's topic
        - Keep it under 15 characters
        - Make it concise and relevant
        - Don't use quotes or special characters
        </instructions>

        <user-message>
        ${firstMessage}
        </user-message>

        <chat-name>
        </chat-name>
      `,
    });

    const chat = await prisma.chat.create({
      data: { name: chatName.trim() },
    });

    return NextResponse.json(chat, { status: 201 });
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
