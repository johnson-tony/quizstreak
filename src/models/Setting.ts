import mongoose, { Schema, model, models } from 'mongoose';

export interface ISetting {
  isSubscriptionEnabled: boolean;
  upiLink: string;
  freeSetsLimit: number;
  siteName: string;
  logoUrl: string;
  dailyQuote: string;
  autoUpdateQuote: boolean;
  adminUpiId?: string;
  paymentQrUrl?: string;
  platformCommissionPercent?: number;
}

const SettingSchema = new Schema<ISetting>({
  isSubscriptionEnabled: { type: Boolean, default: false },
  upiLink: { type: String, default: "" },
  freeSetsLimit: { type: Number, default: 10 },
  siteName: { type: String, default: "QuizStreak" },
  logoUrl: { type: String, default: "/quickstreak.svg" },
  dailyQuote: { type: String, default: "Master the skills that matter. One challenge at a time." },
  autoUpdateQuote: { type: Boolean, default: true },
  adminUpiId: { type: String, default: "" },
  paymentQrUrl: { type: String, default: "" },
  platformCommissionPercent: { type: Number, default: 10 },
});

const Setting = models.Setting || model<ISetting>('Setting', SettingSchema);

export default Setting;
