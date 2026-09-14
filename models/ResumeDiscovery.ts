import mongoose, { Schema } from "mongoose";

const draftSchema = new Schema({
  tokenHash: { type: String, required: true, unique: true },
  profile: { type: Schema.Types.Mixed, required: true },
  resume: { type: Buffer, required: true },
  expiresAt: { type: Date, required: true, expires: 0 },
  claimed: { type: Boolean, default: false },
});
const limitSchema = new Schema({
  _id: String,
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, expires: 0 },
});
export const ResumeDiscovery = mongoose.models.ResumeDiscovery || mongoose.model("ResumeDiscovery", draftSchema);
export const ResumeDiscoveryLimit = mongoose.models.ResumeDiscoveryLimit || mongoose.model("ResumeDiscoveryLimit", limitSchema);
