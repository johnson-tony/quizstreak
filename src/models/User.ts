import mongoose, { Schema, model, models } from 'mongoose';

export interface IUser {
  googleId: string;
  name: string;
  email: string;
  image: string;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  badges: string[];
  joinedAt: Date;
  lastAttemptDate?: Date;
}

const UserSchema = new Schema<IUser>({
  googleId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  totalPoints: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  badges: { type: [String], default: [] },
  joinedAt: { type: Date, default: Date.now },
  lastAttemptDate: { type: Date },
});

const User = models.User || model<IUser>('User', UserSchema);

export default User;
