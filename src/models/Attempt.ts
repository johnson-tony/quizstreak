import mongoose, { Schema, model, models } from 'mongoose';

export interface IAttempt {
  userId: mongoose.Types.ObjectId;
  questionId: string;
  date: Date;
  selectedAnswer: string;
  correct: boolean;
  pointsEarned: number;
  createdAt: Date;
}

const AttemptSchema = new Schema<IAttempt>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  questionId: { type: String, required: true },
  date: { type: Date, required: true, index: true },
  selectedAnswer: { type: String, required: true },
  correct: { type: Boolean, required: true },
  pointsEarned: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Attempt = models.Attempt || model<IAttempt>('Attempt', AttemptSchema);

export default Attempt;
