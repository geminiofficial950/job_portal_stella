import mongoose, { Schema, models, model } from "mongoose";

/** L01 — masterclass sessions */
const MasterclassSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    outcome: { type: String, required: true, trim: true },
    speaker: { type: String, required: true, trim: true },
    speakerBackground: { type: String, default: "" },
    startsAt: { type: Date, required: true },
    timeZone: { type: String, default: "Australia/Sydney" },
    durationMinutes: { type: Number, default: 60 },
    format: { type: String, enum: ["online", "in-person"], default: "online" },
    venueOrLink: { type: String, default: "" },
    capacity: { type: Number, default: 40 },
    bookedCount: { type: Number, default: 0 },
    price: { type: String, default: "Pending owner content" },
    bookingStatus: {
      type: String,
      enum: ["interest", "open", "full", "cancelled", "rescheduled", "pending_content"],
      default: "pending_content",
    },
    topic: { type: String, default: "General" },
    isReplay: { type: Boolean, default: false },
    pendingOwnerContent: { type: Boolean, default: true },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

/** L04 — courses */
const CourseSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    outcome: { type: String, required: true, trim: true },
    provider: { type: String, default: "Pending owner content" },
    duration: { type: String, default: "" },
    mode: {
      type: String,
      enum: ["online", "blended", "in-person"],
      default: "online",
    },
    prerequisites: { type: String, default: "None" },
    price: { type: String, default: "Pending owner content" },
    trainingType: {
      type: String,
      enum: ["professional-development", "accredited", "qualification"],
      default: "professional-development",
    },
    nationallyRecognised: { type: Boolean, default: false },
    accessInstructions: { type: String, default: "" },
    accessUrl: { type: String, default: "" },
    pendingOwnerContent: { type: Boolean, default: true },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

/** L06 — events */
const EventSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    organiser: { type: String, required: true },
    industry: { type: String, default: "General" },
    location: { type: String, default: "" },
    region: { type: String, default: "au" },
    startsAt: { type: Date, required: true },
    timeZone: { type: String, default: "Australia/Sydney" },
    format: {
      type: String,
      enum: ["online", "in-person", "hybrid"],
      default: "in-person",
    },
    accessibility: { type: String, default: "" },
    price: { type: String, default: "Pending owner content" },
    hostedBy: { type: String, enum: ["stella", "external"], default: "stella" },
    bookingUrl: { type: String, default: null },
    pendingOwnerContent: { type: Boolean, default: true },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

/** L02 — session bookings */
const SessionBookingSchema = new Schema(
  {
    referenceId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    masterclassId: {
      type: Schema.Types.ObjectId,
      ref: "Masterclass",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled", "waitlist", "attended", "no_show"],
      default: "confirmed",
    },
    reminderSentAt: { type: Date, default: null },
    calendarNote: { type: String, default: "" },
  },
  { timestamps: true },
);
SessionBookingSchema.index(
  { userId: 1, masterclassId: 1, status: 1 },
  { unique: false },
);

/** L05 — course enrolment */
const CourseEnrolmentSchema = new Schema(
  {
    referenceId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    status: {
      type: String,
      enum: [
        "requested",
        "enrolled",
        "in_progress",
        "awaiting_confirmation",
        "completed",
        "withdrawn",
      ],
      default: "requested",
    },
    completionSource: {
      type: String,
      enum: ["none", "provider", "staff_review", "self_reported"],
      default: "none",
    },
    accessGrantedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

/** L03 — materials (replay/worksheets) — watching does NOT create verified badges */
const LearningMaterialSchema = new Schema(
  {
    title: { type: String, required: true },
    kind: { type: String, enum: ["replay", "worksheet", "resource"], default: "resource" },
    masterclassId: { type: Schema.Types.ObjectId, ref: "Masterclass", default: null },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", default: null },
    url: { type: String, required: true },
    accessRule: {
      type: String,
      enum: ["booked_attendees", "enrolled", "staff_only", "public"],
      default: "booked_attendees",
    },
    availableFrom: { type: Date, default: null },
    availableTo: { type: Date, default: null },
    createsVerifiedSkill: { type: Boolean, default: false }, // always treated as false in logic
  },
  { timestamps: true },
);

/** L07 — reminder preferences */
const ReminderPreferenceSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    jobs: { type: Boolean, default: true },
    sessions: { type: Boolean, default: true },
    courses: { type: Boolean, default: true },
    events: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false },
    frequency: {
      type: String,
      enum: ["immediate", "daily", "weekly", "none"],
      default: "immediate",
    },
  },
  { timestamps: true },
);

export const Masterclass =
  models.Masterclass || model("Masterclass", MasterclassSchema);
export const Course = models.Course || model("Course", CourseSchema);
export const ProfessionalEvent =
  models.ProfessionalEvent || model("ProfessionalEvent", EventSchema);
export const SessionBooking =
  models.SessionBooking || model("SessionBooking", SessionBookingSchema);
export const CourseEnrolment =
  models.CourseEnrolment || model("CourseEnrolment", CourseEnrolmentSchema);
export const LearningMaterial =
  models.LearningMaterial || model("LearningMaterial", LearningMaterialSchema);
export const ReminderPreference =
  models.ReminderPreference ||
  model("ReminderPreference", ReminderPreferenceSchema);
