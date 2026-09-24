import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  
  console.info("[zapier inbound]", body);
  return NextResponse.json({ received: true });
}
