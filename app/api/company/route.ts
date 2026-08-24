import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/requireApiAuth";
import { Company, serializeCompany } from "@/models/Company";

function badRequest(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

function parseBody(body: Record<string, unknown>) {
  return {
    name: String(body.name ?? "").trim(),
    website: String(body.website ?? "").trim(),
    industry: String(body.industry ?? "").trim(),
    location: String(body.location ?? "").trim(),
    size: String(body.size ?? "").trim(),
    phone: String(body.phone ?? "").trim(),
    about: String(body.about ?? "").trim(),
    logoUrl: String(body.logoUrl ?? "").trim(),
  };
}

export async function GET() {
  const result = await requireApiAuth(["recruiter"]);
  if (result.error) return result.error;

  try {
    await connectDB();
    const company = await Company.findOne({ ownerId: result.auth.sub });
    return NextResponse.json({
      success: true,
      company: company ? serializeCompany(company) : null,
    });
  } catch (error) {
    console.error("Company GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load company" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const result = await requireApiAuth(["recruiter"]);
  if (result.error) return result.error;

  try {
    const body = await request.json();
    const data = parseBody(body);

    if (!data.name || data.name.length < 2) {
      return badRequest("Company name must be at least 2 characters");
    }
    if (!data.phone) {
      return badRequest("Phone is required");
    }
    if (!data.industry) {
      return badRequest("Industry is required");
    }
    if (!data.size) {
      return badRequest("Company size is required");
    }
    if (!data.location) {
      return badRequest("Location is required");
    }
    if (!data.logoUrl) {
      return badRequest("Company logo is required");
    }
    if (!data.about) {
      return badRequest("About company is required");
    }
    if (data.about.length > 2000) {
      return badRequest("About text is too long");
    }

    await connectDB();

    const existing = await Company.findOne({ ownerId: result.auth.sub });
    if (existing) {
      return badRequest("Company profile already exists. Use update instead.", 409);
    }

    const company = await Company.create({
      ...data,
      ownerId: result.auth.sub,
      status: "pending",
      rejectionReason: "",
      approvedAt: null,
      approvedBy: null,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Company submitted for approval",
        company: serializeCompany(company),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Company POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create company" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const result = await requireApiAuth(["recruiter"]);
  if (result.error) return result.error;

  try {
    const body = await request.json();
    const data = parseBody(body);

    if (!data.name || data.name.length < 2) {
      return badRequest("Company name must be at least 2 characters");
    }
    if (!data.phone) {
      return badRequest("Phone is required");
    }
    if (!data.industry) {
      return badRequest("Industry is required");
    }
    if (!data.size) {
      return badRequest("Company size is required");
    }
    if (!data.location) {
      return badRequest("Location is required");
    }
    if (!data.logoUrl) {
      return badRequest("Company logo is required");
    }
    if (!data.about) {
      return badRequest("About company is required");
    }
    if (data.about.length > 2000) {
      return badRequest("About text is too long");
    }

    await connectDB();

    const company = await Company.findOne({ ownerId: result.auth.sub });
    if (!company) {
      return badRequest("No company profile found. Create one first.", 404);
    }

    company.name = data.name;
    company.website = data.website;
    company.industry = data.industry;
    company.location = data.location;
    company.size = data.size;
    company.phone = data.phone;
    company.about = data.about;
    company.logoUrl = data.logoUrl;
    // Any edit goes back to pending until admin re-approves
    company.status = "pending";
    company.rejectionReason = "";
    company.approvedAt = null;
    company.approvedBy = null;

    await company.save();

    return NextResponse.json({
      success: true,
      message: "Company updated and pending approval",
      company: serializeCompany(company),
    });
  } catch (error) {
    console.error("Company PUT error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update company" },
      { status: 500 }
    );
  }
}
