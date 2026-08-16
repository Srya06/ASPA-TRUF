import { NextResponse } from "next/server";
import { getSports } from "@/lib/queries/sports";

export async function GET() {
  try {
    const data = await getSports();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API /sports]", error);
    return NextResponse.json(
      { error: "Failed to fetch sports" },
      { status: 500 },
    );
  }
}
