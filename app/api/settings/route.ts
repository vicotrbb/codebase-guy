import { Settings } from "@/types";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const settings = await prisma?.settings.findFirst();
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const settings = (await request.json()) as Partial<Settings>;
    const updatedSettings = await prisma?.settings.update({
      where: { id: settings.id },
      data: settings,
    });

    return NextResponse.json(updatedSettings, { status: 200 });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
