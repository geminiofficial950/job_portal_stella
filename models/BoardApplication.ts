import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";
import { APPLICATION_STATUSES, type ApplicationStatus } from "./Application";

const BoardApplicationSchema = new Schema(
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
    listingUrl: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
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
  { timestamps: true },
);

BoardApplicationSchema.index(
  { seekerId: 1, externalKey: 1 },
  { unique: true },
);

export type BoardApplicationDocument = InferSchemaType<
  typeof BoardApplicationSchema
> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const BoardApplication: mongoose.Model<BoardApplicationDocument> =
  (models.BoardApplication as
    | mongoose.Model<BoardApplicationDocument>
    | undefined) ??
  model<BoardApplicationDocument>("BoardApplication", BoardApplicationSchema);

export function serializeBoardApplication(doc: {
  _id: mongoose.Types.ObjectId;
  seekerId: mongoose.Types.ObjectId;
  externalKey: string;
  source: string;
  title: string;
  companyName?: string | null;
  location?: string | null;
  employmentType?: string | null;
  workMode?: string | null;
  category?: string | null;
  listingUrl?: string | null;
  status: ApplicationStatus;
  coverNote?: string | null;
  statusNote?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    id: String(doc._id),
    kind: "board" as const,
    seekerId: String(doc.seekerId),
    externalKey: doc.externalKey,
    source: doc.source,
    status: doc.status,
    coverNote: doc.coverNote || "",
    statusNote: doc.statusNote || "",
    listingUrl: doc.listingUrl || "",
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : null,
    updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : null,
    job: {
      title: doc.title,
      location: doc.location || "",
      employmentType: doc.employmentType || "",
      workMode: doc.workMode || "",
      status: "open",
      category: doc.category || "",
    },
    company: {
      name: doc.companyName || "Employer",
      logoUrl: "",
    },
  };
}
