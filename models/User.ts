import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";
import { USER_ROLES } from "@/lib/roles";

const TeamInviteSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    access: {
      type: String,
      enum: ["viewer", "editor"],
      default: "viewer",
    },
    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
    },
    invitedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
      minlength: 6,
      select: false,
      default: undefined,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
      required: true,
    },
    googleId: {
      type: String,
      default: null,
      sparse: true,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "user",
      required: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    seekerProfile: {
      headline: { type: String, trim: true, maxlength: 120, default: "" },
      location: { type: String, trim: true, maxlength: 120, default: "" },
      about: { type: String, trim: true, maxlength: 2000, default: "" },
      skills: { type: [String], default: [] },
      experienceLevel: {
        type: String,
        enum: ["entry", "mid", "senior"],
        required: false,
      },
      education: { type: String, trim: true, maxlength: 200, default: "" },
      preferredEmploymentTypes: { type: [String], default: [] },
      preferredWorkModes: { type: [String], default: [] },
      salaryExpectation: { type: String, trim: true, maxlength: 80, default: "" },
      linkedin: { type: String, trim: true, maxlength: 200, default: "" },
      portfolio: { type: String, trim: true, maxlength: 200, default: "" },
      resumeUrl: { type: String, trim: true, maxlength: 500, default: "" },
      openToWork: { type: Boolean, default: true },
    },
    settings: {
      notifications: {
        emailNewApplications: { type: Boolean, default: true },
        emailInterviewReminders: { type: Boolean, default: true },
        emailWeeklyDigest: { type: Boolean, default: false },
        emailJobStatus: { type: Boolean, default: true },
      },
      seekerNotifications: {
        emailJobAlerts: { type: Boolean, default: true },
        emailApplicationUpdates: { type: Boolean, default: true },
        emailInterviewReminders: { type: Boolean, default: true },
        emailWeeklyDigest: { type: Boolean, default: false },
      },
      hiring: {
        defaultEmploymentType: {
          type: String,
          enum: ["full-time", "part-time", "casual", "contract"],
          default: "full-time",
        },
        defaultWorkMode: {
          type: String,
          enum: ["onsite", "hybrid", "remote"],
          default: "onsite",
        },
        showSalaryPublicly: { type: Boolean, default: true },
        autoPauseAfterDays: { type: Number, default: 0, min: 0, max: 365 },
      },
      teamInvites: {
        type: [TeamInviteSchema],
        default: [],
      },
    },
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof UserSchema> & {
  _id: mongoose.Types.ObjectId;
};

// Next.js hot-reload can keep a stale compiled model without new fields
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export const User = model("User", UserSchema);

export function defaultRecruiterSettings() {
  return {
    notifications: {
      emailNewApplications: true,
      emailInterviewReminders: true,
      emailWeeklyDigest: false,
      emailJobStatus: true,
    },
    hiring: {
      defaultEmploymentType: "full-time" as const,
      defaultWorkMode: "onsite" as const,
      showSalaryPublicly: true,
      autoPauseAfterDays: 0,
    },
    teamInvites: [] as Array<{
      id?: string;
      email: string;
      access: "viewer" | "editor";
      status: "pending" | "accepted";
      invitedAt?: string | null;
    }>,
  };
}

export function serializeRecruiterSettings(user: {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string | null;
  authProvider?: string | null;
  role: string;
  settings?: {
    notifications?: {
      emailNewApplications?: boolean;
      emailInterviewReminders?: boolean;
      emailWeeklyDigest?: boolean;
      emailJobStatus?: boolean;
    };
    hiring?: {
      defaultEmploymentType?: string;
      defaultWorkMode?: string;
      showSalaryPublicly?: boolean;
      autoPauseAfterDays?: number;
    };
    teamInvites?: Array<{
      _id?: mongoose.Types.ObjectId;
      email: string;
      access: string;
      status: string;
      invitedAt?: Date;
    }>;
  } | null;
}) {
  const defaults = defaultRecruiterSettings();
  const n = user.settings?.notifications;
  const h = user.settings?.hiring;

  return {
    profile: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      authProvider: user.authProvider || "local",
      role: user.role,
    },
    notifications: {
      emailNewApplications:
        n?.emailNewApplications ?? defaults.notifications.emailNewApplications,
      emailInterviewReminders:
        n?.emailInterviewReminders ??
        defaults.notifications.emailInterviewReminders,
      emailWeeklyDigest:
        n?.emailWeeklyDigest ?? defaults.notifications.emailWeeklyDigest,
      emailJobStatus: n?.emailJobStatus ?? defaults.notifications.emailJobStatus,
    },
    hiring: {
      defaultEmploymentType:
        h?.defaultEmploymentType ?? defaults.hiring.defaultEmploymentType,
      defaultWorkMode: h?.defaultWorkMode ?? defaults.hiring.defaultWorkMode,
      showSalaryPublicly:
        h?.showSalaryPublicly ?? defaults.hiring.showSalaryPublicly,
      autoPauseAfterDays:
        h?.autoPauseAfterDays ?? defaults.hiring.autoPauseAfterDays,
    },
    teamInvites: (user.settings?.teamInvites || []).map((invite) => ({
      id: invite._id ? String(invite._id) : undefined,
      email: invite.email,
      access: invite.access as "viewer" | "editor",
      status: invite.status as "pending" | "accepted",
      invitedAt: invite.invitedAt ? invite.invitedAt.toISOString() : null,
    })),
  };
}

export function defaultSeekerProfile() {
  return {
    headline: "",
    location: "",
    about: "",
    skills: [] as string[],
    experienceLevel: "" as "" | "entry" | "mid" | "senior",
    education: "",
    preferredEmploymentTypes: [] as string[],
    preferredWorkModes: [] as string[],
    salaryExpectation: "",
    linkedin: "",
    portfolio: "",
    resumeUrl: "",
    openToWork: true,
  };
}

export function defaultSeekerNotifications() {
  return {
    emailJobAlerts: true,
    emailApplicationUpdates: true,
    emailInterviewReminders: true,
    emailWeeklyDigest: false,
  };
}

export function serializeSeekerProfile(user: {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string | null;
  authProvider?: string | null;
  role: string;
  seekerProfile?: {
    headline?: string | null;
    location?: string | null;
    about?: string | null;
    skills?: string[] | null;
    experienceLevel?: string | null;
    education?: string | null;
    preferredEmploymentTypes?: string[] | null;
    preferredWorkModes?: string[] | null;
    salaryExpectation?: string | null;
    linkedin?: string | null;
    portfolio?: string | null;
    resumeUrl?: string | null;
    openToWork?: boolean | null;
  } | null;
  settings?: {
    seekerNotifications?: {
      emailJobAlerts?: boolean;
      emailApplicationUpdates?: boolean;
      emailInterviewReminders?: boolean;
      emailWeeklyDigest?: boolean;
    };
  } | null;
}) {
  const d = defaultSeekerProfile();
  const p = user.seekerProfile;
  const n = user.settings?.seekerNotifications;
  const nd = defaultSeekerNotifications();

  return {
    account: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      authProvider: user.authProvider || "local",
      role: user.role,
    },
    profile: {
      headline: p?.headline ?? d.headline,
      location: p?.location ?? d.location,
      about: p?.about ?? d.about,
      skills: p?.skills ?? d.skills,
      experienceLevel: (p?.experienceLevel || "") as
        | ""
        | "entry"
        | "mid"
        | "senior",
      education: p?.education ?? d.education,
      preferredEmploymentTypes:
        p?.preferredEmploymentTypes ?? d.preferredEmploymentTypes,
      preferredWorkModes: p?.preferredWorkModes ?? d.preferredWorkModes,
      salaryExpectation: p?.salaryExpectation ?? d.salaryExpectation,
      linkedin: p?.linkedin ?? d.linkedin,
      portfolio: p?.portfolio ?? d.portfolio,
      resumeUrl: p?.resumeUrl ?? d.resumeUrl,
      openToWork: p?.openToWork ?? d.openToWork,
    },
    notifications: {
      emailJobAlerts: n?.emailJobAlerts ?? nd.emailJobAlerts,
      emailApplicationUpdates:
        n?.emailApplicationUpdates ?? nd.emailApplicationUpdates,
      emailInterviewReminders:
        n?.emailInterviewReminders ?? nd.emailInterviewReminders,
      emailWeeklyDigest: n?.emailWeeklyDigest ?? nd.emailWeeklyDigest,
    },
  };
}
