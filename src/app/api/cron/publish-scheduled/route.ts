import { NextRequest, NextResponse } from "next/server";
import { publishDueScheduledPosts } from "../../../../actions/posts";
import { logAppEvent } from "../../../../lib/observability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorize(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;
  const headerSecret = request.headers.get("x-cron-secret");
  return headerSecret === secret;
}

export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await publishDueScheduledPosts();
    logAppEvent("info", "cron.publish_scheduled", result);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    logAppEvent("error", "cron.publish_scheduled", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
