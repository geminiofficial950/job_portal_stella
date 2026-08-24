import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/requireApiAuth";
import { User } from "@/models/User";
import { Company } from "@/models/Company";
import { isUserRole } from "@/lib/roles";

function badRequest(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function GET(request: Request) {
  const result = await requireApiAuth(["admin"]);
  if (result.error) return result.error;

  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const q = searchParams.get("q")?.trim().toLowerCase() || "";

    await connectDB();

    const filter: Record<string, unknown> = {};
    if (role && isUserRole(role)) {
      filter.role = role;
    }
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .select(
        "name email role phone isActive authProvider createdAt updatedAt settings"
      )
      .lean();

    const recruiterIds = users
      .filter((u) => u.role === "recruiter")
      .map((u) => u._id);

    const companies = await Company.find({
      ownerId: { $in: recruiterIds },
    })
      .select("ownerId name status")
      .lean();

    const companyByOwner = new Map(
      companies.map((c) => [String(c.ownerId), c])
    );

    return NextResponse.json({
      success: true,
      users: users.map((u) => {
        const company = companyByOwner.get(String(u._id));
        return {
          id: String(u._id),
          name: u.name,
          email: u.email,
          role: u.role,
          phone: u.phone || "",
          isActive: u.isActive !== false,
          authProvider: u.authProvider || "local",
          createdAt: u.createdAt
            ? new Date(u.createdAt as Date).toISOString()
            : null,
          updatedAt: u.updatedAt
            ? new Date(u.updatedAt as Date).toISOString()
            : null,
          company: company
            ? {
                id: String(company._id),
                name: company.name,
                status: company.status,
              }
            : null,
          teamInvitesCount: u.settings?.teamInvites?.length || 0,
        };
      }),
    });
  } catch (error) {
    console.error("Admin users GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load users" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const result = await requireApiAuth(["admin"]);
  if (result.error) return result.error;

  try {
    const body = await request.json();
    const userId = String(body.userId ?? "");
    const action = String(body.action ?? "");

    if (!userId) return badRequest("userId is required");

    await connectDB();
    const user = await User.findById(userId);
    if (!user) return badRequest("User not found", 404);

    if (String(user._id) === result.auth.sub && action === "deactivate") {
      return badRequest("You cannot deactivate your own admin account");
    }

    if (action === "activate") {
      user.isActive = true;
    } else if (action === "deactivate") {
      user.isActive = false;
    } else if (action === "setRole") {
      const role = body.role;
      if (!isUserRole(role)) return badRequest("Invalid role");
      if (String(user._id) === result.auth.sub && role !== "admin") {
        return badRequest("You cannot change your own admin role");
      }
      user.role = role;
    } else {
      return badRequest('action must be "activate", "deactivate", or "setRole"');
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "User updated",
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Admin users PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user" },
      { status: 500 }
    );
  }
}
