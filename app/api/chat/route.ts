import { errorMessage } from "@/lib/defaultMessages";
import { Chat, SystemChatMessage } from "@/types";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const chats = await prisma.chat.findMany();

  const response: Chat[] = chats.map((chat) => ({
    id: chat.id,
    name: chat.name,
    messages: [],
  }));

  return NextResponse.json(response, { status: 200 });
}

export async function POST(request: Request) {
  try {
  } catch (error) {
    console.error(error);
    const response: SystemChatMessage = {
      message: errorMessage,
      relatedProjects: [],
    };

    return NextResponse.json(response, { status: 200 });
  }
}
