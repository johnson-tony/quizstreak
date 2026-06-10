import mongoose, { Schema, model, models } from 'mongoose';

export interface IUser {
  googleId: string;
  name: string;
  email: string;
  image: string;
  totalPoints: number;
  currentSet: number;
  currentStreak: number;
  longestStreak: number;
  badges: string[];
  isSubscribed: boolean;
  subscriptionExpiresAt?: Date;
  preferredTrack: string;
  persona: 'technical' | 'non-technical' | 'mixed' | 'unselected';
  joinedAt: Date;
  lastAttemptDate?: Date;
  status: 'active' | 'suspended' | 'deleted';
}

const UserSchema = new Schema<IUser>({
  googleId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  totalPoints: { type: Number, default: 0 },
  currentSet: { type: Number, default: 1 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  badges: { type: [String], default: [] },
  isSubscribed: { type: Boolean, default: false },
  subscriptionExpiresAt: { type: Date },
  preferredTrack: { type: String, default: 'Mixed' },
  persona: { 
    type: String, 
    enum: ['technical', 'non-technical', 'mixed', 'unselected'], 
    default: 'unselected' 
  },
  joinedAt: { type: Date, default: Date.now },
  lastAttemptDate: { type: Date },
  status: { 
    type: String, 
    enum: ['active', 'suspended', 'deleted'], 
    default: 'active',
    index: true 
  },
});

const User = models.User || model<IUser>('User', UserSchema);

export default User;
