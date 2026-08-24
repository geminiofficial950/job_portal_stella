import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/requireApiAuth";
import { Company, serializeCompany } from "@/models/Company";

type Params = { params: Promise<{ id: string }> };

function badRequest(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(request: Request, { params }: Params) {
  const result = await requireApiAuth(["admin"]);
  if (result.error) return result.error;

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const action = String((body as { action?: string }).action ?? "").toLowerCase();
    const rejectionReason = String(
      (body as { rejectionReason?: string }).rejectionReason ?? ""
    ).trim();

    if (action !== "approve" && action !== "reject") {
      return badRequest('action must be "approve" or "reject"');
    }

    await connectDB();
    const company = await Company.findById(id);
    if (!company) {
      return badRequest("Company not found", 404);
    }

    if (action === "approve") {
      company.status = "approved";
      company.rejectionReason = "";
      company.approvedAt = new Date();
      company.approvedBy = new mongoose.Types.ObjectId(result.auth.sub);
    } else {
      company.status = "rejected";
      company.rejectionReason =
        rejectionReason || "Company profile was rejected by admin";
      company.approvedAt = null;
      company.approvedBy = null;
    }

    await company.save();

    return NextResponse.json({
      success: true,
      message:
        action === "approve"
          ? "Company approved and now active"
          : "Company rejected",
      company: serializeCompany(company),
    });
  } catch (error) {
    console.error("Admin company review error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to review company" },
      { status: 500 }
    );
  }
}
