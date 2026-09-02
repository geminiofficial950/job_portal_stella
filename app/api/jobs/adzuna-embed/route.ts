import { NextResponse } from "next/server";
import {
  buildEmbedFallbackHtml,
  buildEmbedHtml,
  fetchAdzunaListingContent,
} from "@/lib/adzuna-scrape";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("id")?.trim() || "job";
    const listingUrl = searchParams.get("url")?.trim() || "";
    const title = searchParams.get("title")?.trim() || "Job listing";

    if (!listingUrl) {
      return new NextResponse("Missing listing URL", { status: 400 });
    }

    const content = await fetchAdzunaListingContent(listingUrl, jobId);
    const html = content?.isFull
      ? buildEmbedHtml({
          title,
          descriptionHtml: content.descriptionHtml,
          listingUrl,
        })
      : buildEmbedFallbackHtml(listingUrl);

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Adzuna embed GET error:", error);
    return new NextResponse("Failed to load listing", { status: 500 });
  }
}
