import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  registrationDeadline: {
    type: Date,
    required: true,
  },
  maxParticipants: {
    type: Number,
    required: true,
  },
  currentParticipants: {
    type: Number,
    default: 0,
  },
  groupId: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'cancelled'],
    default: 'active',
  },
}, {
  timestamps: true,
});

export default mongoose.models.Event || mongoose.model('Event', eventSchema); 