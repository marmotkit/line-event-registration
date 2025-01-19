import mongoose from 'mongoose';

// 報名資料的 Schema
const registrationSchema = new mongoose.Schema({
  name: String,
  numberOfPeople: Number,
  notes: String,
  registeredAt: {
    type: Date,
    default: Date.now
  }
});

// 活動的 Schema
const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  startDate: Date,
  endDate: Date,
  registrationDeadline: Date,
  maxParticipants: Number,
  currentParticipants: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed'],
    default: 'active'
  },
  registrations: {
    type: [registrationSchema],
    default: []
  },
  createdBy: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Event || mongoose.model('Event', eventSchema); 