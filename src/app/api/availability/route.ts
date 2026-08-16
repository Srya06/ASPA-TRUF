import { NextRequest, NextResponse } from "next/server";
import { getAvailability } from "@/lib/queries/availability";

export async function GET(request: NextRequest) {
  try {
    const date = request.nextUrl.searchParams.get("date") ?? undefined;
    const data = await getAvailability(date);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API /availability]", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 },
    );
  }
}
