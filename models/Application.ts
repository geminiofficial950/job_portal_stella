import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

export const APPLICATION_STATUSES = [
  "pending",
  "reviewing",
  "shortlisted",
  "rejected",
  "hired",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

const ApplicationSchema = new Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    seekerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recruiterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: "pending",
      index: true,
    },
    coverNote: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    statusNote: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  { timestamps: true }
);

ApplicationSchema.index({ jobId: 1, seekerId: 1 }, { unique: true });

export type ApplicationDocument = InferSchemaType<typeof ApplicationSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const Application: mongoose.Model<ApplicationDocument> =
  (models.Application as mongoose.Model<ApplicationDocument> | undefined) ??
  model<ApplicationDocument>("Application", ApplicationSchema);

export function serializeApplication(doc: {
  _id: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  seekerId: mongoose.Types.ObjectId;
  recruiterId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  status: ApplicationStatus;
  coverNote?: string | null;
  statusNote?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    id: String(doc._id),
    jobId: String(doc.jobId),
    seekerId: String(doc.seekerId),
    recruiterId: String(doc.recruiterId),
    companyId: String(doc.companyId),
    status: doc.status,
    coverNote: doc.coverNote || "",
    statusNote: doc.statusNote || "",
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : null,
    updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : null,
  };
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: "Pending",
  reviewing: "Under review",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
  hired: "Hired",
};
