import mongoose from 'mongoose';

// 定義報名資料 Schema
const registrationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '請輸入姓名']
  },
  numberOfPeople: {
    type: Number,
    required: [true, '請輸入報名人數'],
    min: [1, '報名人數至少為 1']
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
    min: [1, '人數上限至少為 1']
  },
  currentParticipants: {
    type: Number,
    default: 0
  },
  groupId: {
    type: String,
    required: [true, '請輸入 Line 群組 ID']
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed'],
    default: 'active'
  },
  registrations: [registrationSchema],
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