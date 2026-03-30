import mongoose, { Schema, Document } from 'mongoose';

export type EmailOtpPurpose = 'signup' | 'reset';

export interface IEmailOtp extends Document {
  email: string;
  purpose: EmailOtpPurpose;
  otp: string;
  expiresAt: Date;
}

const EmailOtpSchema = new Schema<IEmailOtp>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    purpose: {
      type: String,
      enum: ['signup', 'reset'],
      required: true,
    },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

EmailOtpSchema.index({ email: 1, purpose: 1 }, { unique: true });
/** Auto-remove documents after expiresAt (MongoDB TTL). */
EmailOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const EmailOtp =
  mongoose.models.EmailOtp || mongoose.model<IEmailOtp>('EmailOtp', EmailOtpSchema);

export default EmailOtp;
