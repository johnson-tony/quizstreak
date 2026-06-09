import mongoose, { Schema, model, models } from 'mongoose';

export interface ISetting {
  isSubscriptionEnabled: boolean;
  upiLink: string;
  freeSetsLimit: number;
}

const SettingSchema = new Schema<ISetting>({
  isSubscriptionEnabled: { type: Boolean, default: false },
  upiLink: { type: String, default: "" },
  freeSetsLimit: { type: Number, default: 10 },
});

const Setting = models.Setting || model<ISetting>('Setting', SettingSchema);

export default Setting;
