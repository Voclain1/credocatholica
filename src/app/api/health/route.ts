import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      application: "CredoCatholica",
      phase: "M0.1",
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
