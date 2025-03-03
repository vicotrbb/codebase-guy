import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { referenceChatId: params.chatId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const { role, content, relatedProjects } = await request.json();

    // Validate chat exists
    const chat = await prisma.chat.findUnique({
      where: { id: params.chatId },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const message = await prisma.chatMessage.create({
      data: {
        role,
        content,
        relatedProjects,
        referenceChatId: params.chatId,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
