import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

export const JOB_STATUSES = ["draft", "open", "paused", "closed"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const EMPLOYMENT_TYPES = [
  "full-time",
  "part-time",
  "casual",
  "contract",
] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const WORK_MODES = ["onsite", "hybrid", "remote"] as const;
export type WorkMode = (typeof WORK_MODES)[number];

export const EXPERIENCE_LEVELS = ["entry", "mid", "senior"] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const SALARY_PERIODS = ["hour", "day", "week", "year"] as const;
export type SalaryPeriod = (typeof SALARY_PERIODS)[number];

const JobSchema = new Schema(
  {
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
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 5000,
    },
    requirements: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 4000,
    },
    responsibilities: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 4000,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    employmentType: {
      type: String,
      enum: EMPLOYMENT_TYPES,
      required: true,
    },
    workMode: {
      type: String,
      enum: WORK_MODES,
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: EXPERIENCE_LEVELS,
      required: true,
    },
    salaryMin: {
      type: Number,
      required: true,
      min: 0,
    },
    salaryMax: {
      type: Number,
      required: true,
      min: 0,
    },
    salaryCurrency: {
      type: String,
      required: true,
      default: "AUD",
      trim: true,
      maxlength: 3,
    },
    salaryPeriod: {
      type: String,
      enum: SALARY_PERIODS,
      required: true,
      default: "year",
    },
    vacancies: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    skills: {
      type: [String],
      default: [],
    },
    benefits: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    applicationDeadline: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: JOB_STATUSES,
      default: "open",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

JobSchema.index({ title: "text", description: "text", location: "text" });

export type JobDocument = InferSchemaType<typeof JobSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Job: mongoose.Model<JobDocument> =
  (models.Job as mongoose.Model<JobDocument> | undefined) ??
  model<JobDocument>("Job", JobSchema);

export function serializeJob(doc: {
  _id: mongoose.Types.ObjectId;
  recruiterId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  location: string;
  category: string;
  employmentType: EmploymentType;
  workMode: WorkMode;
  experienceLevel: ExperienceLevel;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  salaryPeriod: SalaryPeriod;
  vacancies: number;
  skills?: string[] | null;
  benefits?: string | null;
  applicationDeadline?: Date | null;
  status: JobStatus;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    id: String(doc._id),
    recruiterId: String(doc.recruiterId),
    companyId: String(doc.companyId),
    title: doc.title,
    description: doc.description,
    requirements: doc.requirements,
    responsibilities: doc.responsibilities,
    location: doc.location,
    category: doc.category,
    employmentType: doc.employmentType,
    workMode: doc.workMode,
    experienceLevel: doc.experienceLevel,
    salaryMin: doc.salaryMin,
    salaryMax: doc.salaryMax,
    salaryCurrency: doc.salaryCurrency,
    salaryPeriod: doc.salaryPeriod,
    vacancies: doc.vacancies,
    skills: doc.skills || [],
    benefits: doc.benefits || "",
    applicationDeadline: doc.applicationDeadline
      ? doc.applicationDeadline.toISOString()
      : null,
    status: doc.status,
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : null,
    updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : null,
  };
}
