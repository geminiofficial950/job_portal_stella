import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/requireApiAuth";
import { Company, serializeCompany } from "@/models/Company";
import { User } from "@/models/User";

export async function GET() {
  const result = await requireApiAuth(["admin"]);
  if (result.error) return result.error;

  try {
    await connectDB();
    const companies = await Company.find({})
      .sort({ updatedAt: -1 })
      .lean();

    const ownerIds = companies.map((c) => c.ownerId);
    const owners = await User.find({ _id: { $in: ownerIds } })
      .select("name email")
      .lean();
    const ownerMap = new Map(owners.map((o) => [String(o._id), o]));

    return NextResponse.json({
      success: true,
      companies: companies.map((c) => ({
        ...serializeCompany(c as Parameters<typeof serializeCompany>[0]),
        owner: ownerMap.get(String(c.ownerId))
          ? {
              name: ownerMap.get(String(c.ownerId))!.name,
              email: ownerMap.get(String(c.ownerId))!.email,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error("Admin companies GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load companies" },
      { status: 500 }
    );
  }
}
