import mongoose from 'mongoose';

// 參與者 Schema
const participantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '請輸入姓名']
  },
  numberOfPeople: {
    type: Number,
    required: [true, '請輸入人數'],
    min: [1, '人數必須大於 0']
  },
  notes: {
    type: String,
    default: ''
  },
  registeredAt: {
    type: Date,
    default: Date.now
  }
});

// 活動 Schema
const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '請輸入活動名稱']
  },
  description: {
    type: String,
    required: [true, '請輸入活動說明']
  },
  startDate: {
    type: Date,
    required: [true, '請選擇開始時間']
  },
  endDate: {
    type: Date,
    required: [true, '請選擇結束時間']
  },
  registrationDeadline: {
    type: Date,
    required: [true, '請選擇報名截止時間']
  },
  maxParticipants: {
    type: Number,
    required: [true, '請輸入人數上限']
  },
  currentParticipants: {
    type: Number,
    default: 0
  },
  groupId: {
    type: String,
    required: [true, '請輸入群組 ID']
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed'],
    default: 'active'
  },
  participants: [participantSchema],  // 使用參與者 Schema
  createdBy: {
    type: String,
    required: [true, '請輸入建立者']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
export default Event; 