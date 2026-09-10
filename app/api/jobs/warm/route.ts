import { NextResponse } from "next/server";
import { warmJobsCache } from "@/lib/warm-jobs-cache";

export const maxDuration = 60;

/**
 * POST /api/jobs/warm — cron / deploy hook to preload jobs on the server.
 * Optional header: Authorization: Bearer $JOBS_WARM_SECRET
 */
export async function POST(request: Request) {
  const secret = process.env.JOBS_WARM_SECRET?.trim();
  if (secret) {
    const auth = request.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (token !== secret) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
  }

  const force =
    new URL(request.url).searchParams.get("force") === "1" ||
    new URL(request.url).searchParams.get("force") === "true";

  const result = await warmJobsCache({ force });
  return NextResponse.json(
    { success: result.ok, ...result },
    { status: result.ok ? 200 : 500 },
  );
}

export async function GET(request: Request) {
  return POST(request);
}
