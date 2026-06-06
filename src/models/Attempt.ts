import mongoose, { Schema, model, models } from 'mongoose';

export interface IAttempt {
  userId: mongoose.Types.ObjectId;
  questionId: string;
  date: Date;
  selectedAnswer: string;
  correct: boolean;
  pointsEarned: number;
  type: 'daily' | 'practice'; // New field
  createdAt: Date;
}

const AttemptSchema = new Schema<IAttempt>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  questionId: { type: String, required: true },
  date: { type: Date, required: true },
  selectedAnswer: { type: String, required: true },
  correct: { type: Boolean, required: true },
  pointsEarned: { type: Number, required: true },
  type: { type: String, enum: ['daily', 'practice'], default: 'daily' },
  createdAt: { type: Date, default: Date.now },
});

const Attempt = models.Attempt || model<IAttempt>('Attempt', AttemptSchema);

export default Attempt;
