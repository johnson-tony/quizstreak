import mongoose, { Schema, model, models } from 'mongoose';

export interface IErrorLog {
  message: string;
  stack?: string;
  path?: string;
  method?: string;
  userId?: string;
  timestamp: Date;
  metadata?: any;
}

const ErrorLogSchema = new Schema<IErrorLog>({
  message: { type: String, required: true },
  stack: { type: String },
  path: { type: String },
  method: { type: String },
  userId: { type: String },
  timestamp: { type: Date, default: Date.now },
  metadata: { type: Schema.Types.Mixed },
});

const ErrorLog = models.ErrorLog || model<IErrorLog>('ErrorLog', ErrorLogSchema);

export default ErrorLog;
