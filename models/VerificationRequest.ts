import mongoose, { Schema, models, model } from "mongoose";

export const VERIFICATION_STATUSES = [
  "submitted",
  "in_review",
  "more_information_needed",
  "verified",
  "unable_to_verify",
  "discrepancy_found",
  "needs_recheck",
  "expired",
  "declined",
] as const;

export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

const ClaimSchema = new Schema(
  {
    checkType: { type: String, required: true },
    claimSummary: { type: String, required: true, trim: true },
    issuerOrEmployer: { type: String, default: "" },
    evidenceRefs: { type: [String], default: [] },
    consentGiven: { type: Boolean, default: false },
    consentVersion: { type: String, default: "v1-pending-owner" },
    method: { type: String, default: "Pending owner content" },
    source: { type: String, default: "" },
    reviewerId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    checkedAt: { type: Date, default: null },
    result: {
      type: String,
      enum: VERIFICATION_STATUSES,
      default: "submitted",
    },
    resultScope: { type: String, default: "" },
    expiryOrReviewAt: { type: Date, default: null },
    privateNotes: { type: String, default: "" },
    candidateExplanation: { type: String, default: "" },
    history: [
      {
        at: { type: Date, default: Date.now },
        by: { type: String, default: "system" },
        from: { type: String, default: "" },
        to: { type: String, default: "" },
        reason: { type: String, default: "" },
      },
    ],
  },
  { _id: true },
);

const VerificationRequestSchema = new Schema(
  {
    referenceId: { type: String, required: true, unique: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true },
    checkTypes: { type: [String], default: [] },
    notes: { type: String, trim: true, maxlength: 2000, default: "" },
    status: {
      type: String,
      enum: VERIFICATION_STATUSES,
      default: "submitted",
      index: true,
    },
    assignedReviewerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    claims: { type: [ClaimSchema], default: [] },
    evidenceDocuments: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: "" },
        fileName: { type: String, default: "" },
        uploadedAt: { type: Date, default: Date.now },
        ownerUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
      },
    ],
    consentChecking: { type: Boolean, default: false },
    consentSharing: { type: Boolean, default: false },
    consentVersion: { type: String, default: "v1-pending-owner" },
    withdrawalRequestedAt: { type: Date, default: null },
    candidateNextAction: { type: String, default: "Awaiting review" },
  },
  { timestamps: true },
);

/** Keep LearningInterest here for backwards compatibility */
const LearningInterestSchema = new Schema(
  {
    referenceId: { type: String, required: true, unique: true, trim: true },
    kind: {
      type: String,
      enum: ["masterclass", "course", "event"],
      required: true,
    },
    itemId: { type: String, required: true, trim: true },
    itemTitle: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true },
    notes: { type: String, trim: true, maxlength: 2000, default: "" },
    status: {
      type: String,
      enum: ["submitted", "contacted", "closed"],
      default: "submitted",
    },
  },
  { timestamps: true },
);

if (mongoose.models.VerificationRequest) {
  delete mongoose.models.VerificationRequest;
}

export const VerificationRequest = model(
  "VerificationRequest",
  VerificationRequestSchema,
);

export const LearningInterest =
  models.LearningInterest || model("LearningInterest", LearningInterestSchema);
