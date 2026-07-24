import { NextResponse } from "next/server";
import { listCreations } from "@/lib/generation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") || "12");

  try {
    const items = await listCreations(Number.isFinite(limit) ? limit : 12);
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json(
      {
        items: [],
        error: error instanceof Error ? error.message : "Failed to list creations",
      },
      { status: 200 },
    );
  }
}
