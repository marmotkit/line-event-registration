import mongoose from 'mongoose';

// 定義參與者 Schema
const participantSchema = new mongoose.Schema({
  userId: String,
  displayName: String,
  pictureUrl: String,
  registeredAt: {
    type: Date,
    default: Date.now
  }
});

// 定義活動 Schema
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
    required: [true, '請輸入人數上限'],
    min: [1, '人數上限必須大於 0']
  },
  currentParticipants: {
    type: Number,
    default: 0
  },
  participants: [participantSchema],
  groupId: {
    type: String,
    required: [true, '請輸入 Line 群組 ID']
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'cancelled'],
    default: 'active'
  },
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
}, {
  timestamps: true,
});

// 在儲存前轉換日期字串為 Date 物件
eventSchema.pre('save', function(next) {
  if (typeof this.startDate === 'string') {
    this.startDate = new Date(this.startDate);
  }
  if (typeof this.endDate === 'string') {
    this.endDate = new Date(this.endDate);
  }
  if (typeof this.registrationDeadline === 'string') {
    this.registrationDeadline = new Date(this.registrationDeadline);
  }
  this.updatedAt = new Date();
  next();
});

// 確保不會重複定義 model
const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

export default Event; 