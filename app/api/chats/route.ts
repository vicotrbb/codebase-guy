import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/chats - List all chats
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

// POST /api/chats - Create a new chat
export async function POST(request: NextRequest) {
  try {
    const { name = "New Chat" } = await request.json();

    const chat = await prisma.chat.create({
      data: { name },
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
