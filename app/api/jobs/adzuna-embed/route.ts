import { NextResponse } from "next/server";
import {
  buildEmbedFallbackHtml,
  buildEmbedHtml,
  descriptionHtmlFromApiPreview,
  fetchAdzunaListingContent,
} from "@/lib/adzuna-scrape";

export const maxDuration = 30;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("id")?.trim() || "job";
    const listingUrl = searchParams.get("url")?.trim() || "";
    const title = searchParams.get("title")?.trim() || "Job listing";
    const preview = searchParams.get("preview")?.trim() || "";

    if (!listingUrl) {
      return new NextResponse("Missing listing URL", { status: 400 });
    }

    const content = await fetchAdzunaListingContent(listingUrl, jobId);
    if (content?.isFull) {
      return new NextResponse(
        buildEmbedHtml({
          title,
          descriptionHtml: content.descriptionHtml,
          listingUrl,
        }),
        {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "private, max-age=3600",
          },
        },
      );
    }

    const previewHtml =
      content?.descriptionHtml || descriptionHtmlFromApiPreview(preview);
    if (previewHtml) {
      return new NextResponse(
        buildEmbedHtml({
          title,
          descriptionHtml: `${previewHtml}<p style="margin-top:1.25rem;color:#64748b;font-size:0.9rem">Full posting may include more detail on Adzuna.</p>`,
          listingUrl,
        }),
        {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "private, max-age=600",
          },
        },
      );
    }

    return new NextResponse(buildEmbedFallbackHtml(listingUrl), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    console.error("Adzuna embed GET error:", error);
    return new NextResponse("Failed to load listing", { status: 500 });
  }
}
