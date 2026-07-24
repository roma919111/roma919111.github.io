import { NextResponse } from "next/server";
import { getAccountSummary } from "@/lib/generation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const account = await getAccountSummary();
    return NextResponse.json(account);
  } catch (error) {
    return NextResponse.json(
      {
        credits: 10,
        plan: "Studio Free",
        source: "local",
        message: error instanceof Error ? error.message : "Failed to load account",
      },
      { status: 200 },
    );
  }
}
