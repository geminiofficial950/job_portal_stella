import { Schema, model, models } from "mongoose";

const newsletterSubscriberSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  source: { type: String, default: "footer" },
}, { timestamps: true });

export const NewsletterSubscriber = models.NewsletterSubscriber || model("NewsletterSubscriber", newsletterSubscriberSchema);
