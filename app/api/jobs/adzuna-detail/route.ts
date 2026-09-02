import { NextResponse } from "next/server";
import {
  fetchAdzunaJobByAdref,
  isAdzunaConfigured,
  parseAdzunaJobId,
} from "@/lib/adzuna";
import { fetchAdzunaListingContent } from "@/lib/adzuna-scrape";

export async function GET(request: Request) {
  try {
    if (!isAdzunaConfigured()) {
      return NextResponse.json(
        { success: false, message: "Adzuna is not configured" },
        { status: 503 },
      );
    }

    const { searchParams } = new URL(request.url);
    const compositeId = searchParams.get("id")?.trim() || "";
    const adref = searchParams.get("adref")?.trim() || "";
    const applyUrl = searchParams.get("applyUrl")?.trim() || "";
    const parsed = parseAdzunaJobId(compositeId);

    if (!parsed) {
      return NextResponse.json(
        { success: false, message: "Invalid Adzuna job reference" },
        { status: 400 },
      );
    }

    if (!adref && !applyUrl) {
      return NextResponse.json(
        { success: false, message: "Missing Adzuna listing reference" },
        { status: 400 },
      );
    }

    let job = adref
      ? await fetchAdzunaJobByAdref(parsed.country, adref)
      : null;

    const listingUrl = applyUrl || job?.applyUrl || "";
    const listing = await fetchAdzunaListingContent(listingUrl, compositeId);

    if (job && listing?.isFull) {
      job.description = listing.description;
      job.requirements = listing.description;
      job.responsibilities = listing.description;
    }

    if (!job && listing) {
      job = {
        id: compositeId,
        source: "adzuna",
        title: searchParams.get("title")?.trim() || "Job listing",
        description: listing.description,
        requirements: listing.description,
        responsibilities: listing.description,
        location: "",
        category: "",
        employmentType: "full-time",
        workMode: "onsite",
        experienceLevel: "mid",
        salaryMin: 0,
        salaryMax: 0,
        salaryCurrency: "AUD",
        salaryPeriod: "year",
        skills: [],
        benefits: "",
        createdAt: null,
        applyUrl: listingUrl,
        adref: "",
        country: parsed.country,
        countryLabel: "",
        company: {
          id: "",
          name: "",
          logoUrl: "",
          location: "",
          industry: "",
          about: "",
          website: "",
          size: "",
        },
      };
    }

    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      job,
      descriptionHtml: listing?.descriptionHtml || "",
      descriptionSource: listing?.isFull ? "listing" : "api-preview",
    });
  } catch (error) {
    console.error("Adzuna detail GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load job details" },
      { status: 500 },
    );
  }
}
