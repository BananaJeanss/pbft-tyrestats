import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    anon: process.env.HC_AI_ANON_LIMIT || "20000",
    account: process.env.HC_AI_ACCOUNT_LIMIT || "40000",
  });
}
