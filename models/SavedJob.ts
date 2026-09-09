import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const SavedJobSchema = new Schema(
  {
    seekerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    externalKey: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      index: true,
    },
    source: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
      default: "board",
    },
    jobId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    companyName: {
      type: String,
      trim: true,
      maxlength: 160,
      default: "",
    },
    companyLogoUrl: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    location: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    employmentType: {
      type: String,
      trim: true,
      maxlength: 40,
      default: "",
    },
    workMode: {
      type: String,
      trim: true,
      maxlength: 40,
      default: "",
    },
    category: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },
    experienceLevel: {
      type: String,
      trim: true,
      maxlength: 40,
      default: "",
    },
    salaryMin: { type: Number, default: null },
    salaryMax: { type: Number, default: null },
    salaryCurrency: {
      type: String,
      trim: true,
      maxlength: 8,
      default: "AUD",
    },
    salaryPeriod: {
      type: String,
      trim: true,
      maxlength: 20,
      default: "",
    },
    applyUrl: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },
  },
  { timestamps: true },
);

SavedJobSchema.index({ seekerId: 1, externalKey: 1 }, { unique: true });

export type SavedJobDocument = InferSchemaType<typeof SavedJobSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const SavedJob: mongoose.Model<SavedJobDocument> =
  (models.SavedJob as mongoose.Model<SavedJobDocument> | undefined) ??
  model<SavedJobDocument>("SavedJob", SavedJobSchema);

export function savedJobExternalKey(source: string, jobId: string) {
  return `${source || "board"}:${jobId}`.slice(0, 200);
}

export function serializeSavedJob(doc: {
  _id: mongoose.Types.ObjectId;
  seekerId: mongoose.Types.ObjectId;
  externalKey: string;
  source: string;
  jobId: string;
  title: string;
  companyName?: string | null;
  companyLogoUrl?: string | null;
  location?: string | null;
  employmentType?: string | null;
  workMode?: string | null;
  category?: string | null;
  experienceLevel?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: string | null;
  applyUrl?: string | null;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    id: String(doc._id),
    externalKey: doc.externalKey,
    source: doc.source,
    jobId: doc.jobId,
    title: doc.title,
    companyName: doc.companyName || "",
    companyLogoUrl: doc.companyLogoUrl || "",
    location: doc.location || "",
    employmentType: doc.employmentType || "",
    workMode: doc.workMode || "",
    category: doc.category || "",
    experienceLevel: doc.experienceLevel || "",
    salaryMin: doc.salaryMin ?? null,
    salaryMax: doc.salaryMax ?? null,
    salaryCurrency: doc.salaryCurrency || "AUD",
    salaryPeriod: doc.salaryPeriod || "",
    applyUrl: doc.applyUrl || "",
    description: doc.description || "",
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : null,
    updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : null,
  };
}
