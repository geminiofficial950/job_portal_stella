import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

export const NOTIFICATION_TYPES = [
  "application_status",
  "application_received",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

const NotificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 400,
    },
    link: {
      type: String,
      trim: true,
      default: "/dashboard/seeker/applications",
    },
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export type NotificationDocument = InferSchemaType<
  typeof NotificationSchema
> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const Notification: mongoose.Model<NotificationDocument> =
  (models.Notification as mongoose.Model<NotificationDocument> | undefined) ??
  model<NotificationDocument>("Notification", NotificationSchema);

export function serializeNotification(doc: {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  applicationId?: mongoose.Types.ObjectId | null;
  read?: boolean;
  createdAt?: Date;
}) {
  return {
    id: String(doc._id),
    userId: String(doc.userId),
    type: doc.type,
    title: doc.title,
    message: doc.message,
    link: doc.link || "/dashboard/seeker/applications",
    applicationId: doc.applicationId ? String(doc.applicationId) : null,
    read: Boolean(doc.read),
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : null,
  };
}
