import mongoose, { Schema, model, models } from 'mongoose';

const ActivitySchema = new Schema(
  {
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const TicketSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    category: { type: String, required: true, trim: true },
    assignedPerson: { type: String, required: true, trim: true },
    status: { type: String, enum: ['open', 'in-progress', 'closed'], default: 'open' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    activity: { type: [ActivitySchema], default: [] },
  },
  { timestamps: true }
);

TicketSchema.index({ title: 'text', description: 'text' });

export default models.Ticket || model('Ticket', TicketSchema);
