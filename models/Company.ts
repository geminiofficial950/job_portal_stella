import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

export const COMPANY_STATUSES = ["pending", "approved", "rejected"] as const;
export type CompanyStatus = (typeof COMPANY_STATUSES)[number];

const CompanySchema = new Schema(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    website: {
      type: String,
      trim: true,
      default: "",
    },
    industry: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    size: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    about: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    logoUrl: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: COMPANY_STATUSES,
      default: "pending",
      required: true,
      index: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

export type CompanyDocument = InferSchemaType<typeof CompanySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Company = models.Company || model("Company", CompanySchema);

export function serializeCompany(doc: {
  _id: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  name: string;
  website?: string | null;
  industry?: string | null;
  location?: string | null;
  size?: string | null;
  phone?: string | null;
  about?: string | null;
  logoUrl?: string | null;
  status: CompanyStatus;
  rejectionReason?: string | null;
  approvedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    id: String(doc._id),
    ownerId: String(doc.ownerId),
    name: doc.name,
    website: doc.website || "",
    industry: doc.industry || "",
    location: doc.location || "",
    size: doc.size || "",
    phone: doc.phone || "",
    about: doc.about || "",
    logoUrl: doc.logoUrl || "",
    status: doc.status,
    rejectionReason: doc.rejectionReason || "",
    approvedAt: doc.approvedAt ? doc.approvedAt.toISOString() : null,
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : null,
    updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : null,
  };
}
