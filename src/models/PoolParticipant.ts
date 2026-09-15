import mongoose, { Schema, model, models } from 'mongoose';

export interface IPoolParticipant {
  _id: mongoose.Types.ObjectId;
  poolId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userImage?: string;
  paymentStatus: 'pending' | 'verified' | 'rejected';
  paymentUtr?: string;
  paymentProofUrl?: string;
  paidAmount: number;
  quizStatus: 'not_started' | 'in_progress' | 'completed' | 'terminated_cheating';
  score: number;
  totalQuestions: number;
  timeTakenSeconds: number;
  answers: Array<{
    day: string;
    selectedAnswer: string;
    correct: boolean;
  }>;
  rank?: number;
  prizeWon?: number;
  payoutStatus: 'none' | 'pending' | 'disbursed';
  payoutUpiVpa?: string;
  joinedAt: Date;
}

const PoolParticipantSchema = new Schema<IPoolParticipant>({
  poolId: { type: Schema.Types.ObjectId, ref: 'Pool', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userImage: { type: String, default: '' },
  paymentStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  paymentUtr: { type: String, default: '' },
  paymentProofUrl: { type: String, default: '' },
  paidAmount: { type: Number, required: true },
  quizStatus: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'terminated_cheating'],
    default: 'not_started',
  },
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  timeTakenSeconds: { type: Number, default: 0 },
  answers: [
    {
      day: { type: String, required: true },
      selectedAnswer: { type: String, required: true },
      correct: { type: Boolean, required: true },
    },
  ],
  rank: { type: Number },
  prizeWon: { type: Number, default: 0 },
  payoutStatus: {
    type: String,
    enum: ['none', 'pending', 'disbursed'],
    default: 'none',
  },
  payoutUpiVpa: { type: String, default: '' },
  joinedAt: { type: Date, default: Date.now },
});

// Ensure a user can only participate once in a given pool
PoolParticipantSchema.index({ poolId: 1, userId: 1 }, { unique: true });

const PoolParticipant =
  models.PoolParticipant ||
  model<IPoolParticipant>('PoolParticipant', PoolParticipantSchema);

export default PoolParticipant;
