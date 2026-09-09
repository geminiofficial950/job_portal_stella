import mongoose, { Schema, models, model } from "mongoose";

/** E04 — interview invitations */
const InterviewInvitationSchema = new Schema(
  {
    referenceId: { type: String, required: true, unique: true },
    recruiterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    seekerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", default: null },
    roleTitle: { type: String, required: true },
    employerName: { type: String, required: true },
    proposedTimes: { type: [String], default: [] },
    contactMethod: { type: String, default: "platform" },
    status: {
      type: String,
      enum: [
        "invited",
        "accepted",
        "declined",
        "reschedule_suggested",
        "cancelled",
      ],
      default: "invited",
      index: true,
    },
    seekerMessage: { type: String, default: "" },
    contactReleased: { type: Boolean, default: false },
  },
  { timestamps: true },
);

/** E05 — recruitment pipeline stages beyond application */
export const PIPELINE_STAGES = [
  "shortlisted",
  "interview_requested",
  "interview_booked",
  "offer",
  "hired",
  "unsuccessful",
  "withdrawn",
] as const;

const PipelineUpdateSchema = new Schema(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      index: true,
    },
    stage: { type: String, enum: PIPELINE_STAGES, required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    employerReportedHire: { type: Boolean, default: false },
    candidateConfirmedHire: { type: Boolean, default: false },
    privateNote: { type: String, default: "" },
  },
  { timestamps: true },
);

export const InterviewInvitation =
  models.InterviewInvitation ||
  model("InterviewInvitation", InterviewInvitationSchema);

export const PipelineUpdate =
  models.PipelineUpdate || model("PipelineUpdate", PipelineUpdateSchema);
