import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'replied' | 'ignored';
  userId?: mongoose.Types.ObjectId;
  replies: {
    message: string;
    sentAt: Date;
    adminEmail: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'replied', 'ignored'],
      default: 'pending',
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    replies: [
      {
        message: { type: String, required: true },
        sentAt: { type: Date, default: Date.now },
        adminEmail: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);
