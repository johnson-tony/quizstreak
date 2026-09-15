import mongoose, { Schema, model, models } from 'mongoose';

export interface IPoolQuestion {
  day: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
  explanation: string;
  difficulty?: string;
  points?: number;
}

export interface IPool {
  _id: mongoose.Types.ObjectId;
  title: string;
  type: 'weekend_tournament' | 'custom_duel';
  creatorId: mongoose.Types.ObjectId;
  creatorName: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Mixed';
  questionCount: number;
  maxMembers: number;
  entryFee: number;
  totalPrizePool: number;
  platformFeePercent: number;
  inviteCode: string;
  status: 'open' | 'active' | 'completed' | 'cancelled';
  startDate: Date;
  endDate: Date;
  questions: IPoolQuestion[];
  createdAt: Date;
}

const PoolQuestionSchema = new Schema<IPoolQuestion>(
  {
    day: { type: String, required: true },
    question: { type: String, required: true },
    options: {
      A: { type: String, required: true },
      B: { type: String, required: true },
      C: { type: String, required: true },
      D: { type: String, required: true },
    },
    correctAnswer: { type: String, required: true },
    explanation: { type: String, default: '' },
    difficulty: { type: String, default: 'Medium' },
    points: { type: Number, default: 10 },
  },
  { _id: false }
);

const PoolSchema = new Schema<IPool>({
  title: { type: String, required: true },
  type: { type: String, enum: ['weekend_tournament', 'custom_duel'], default: 'custom_duel' },
  creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  creatorName: { type: String, default: 'Quiz Master' },
  category: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', 'Mixed'], default: 'Medium' },
  questionCount: { type: Number, required: true, default: 10 },
  maxMembers: { type: Number, required: true, default: 5 },
  entryFee: { type: Number, required: true, default: 50 },
  totalPrizePool: { type: Number, required: true, default: 225 },
  platformFeePercent: { type: Number, default: 10 },
  inviteCode: { type: String, required: true, unique: true },
  status: { type: String, enum: ['open', 'active', 'completed', 'cancelled'], default: 'open' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  questions: [PoolQuestionSchema],
  createdAt: { type: Date, default: Date.now },
});

const Pool = models.Pool || model<IPool>('Pool', PoolSchema);

export default Pool;
