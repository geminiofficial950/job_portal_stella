import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { isUserRole } from "@/lib/roles";
import { setAuthCookie, signToken } from "@/lib/auth";

function badRequest(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const phone = String(body.phone ?? "").trim();
    const roleInput = body.role ?? "user";
    const adminSecret = String(body.adminSecret ?? "");

    if (!name || name.length < 2) {
      return badRequest("Name must be at least 2 characters");
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return badRequest("Valid email is required");
    }

    if (!password || password.length < 6) {
      return badRequest("Password must be at least 6 characters");
    }

    if (!isUserRole(roleInput)) {
      return badRequest("Role must be user, recruiter, or admin");
    }

    // Admin self-register only with ADMIN_SECRET from .env
    if (roleInput === "admin") {
      if (!process.env.ADMIN_SECRET || adminSecret !== process.env.ADMIN_SECRET) {
        return badRequest("Invalid admin secret", 403);
      }
    }

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return badRequest("Email already registered", 409);
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      authProvider: "local",
      role: roleInput,
      phone,
    });

    const token = await signToken({
      sub: String(user._id),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    await setAuthCookie(token);

    return NextResponse.json(
      {
        success: true,
        message: "Registered successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, message: "Registration failed" },
      { status: 500 }
    );
  }
}
