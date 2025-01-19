import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('請設定 MONGODB_URI 環境變數');
}

// 確保 MONGODB_URI 一定有值
const MONGODB_URI: string = process.env.MONGODB_URI;

// 定義快取介面
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// 定義全域變數介面
declare global {
  var mongoose: MongooseCache | undefined;
}

// 初始化快取
let cached: MongooseCache = global.mongoose || {
  conn: null,
  promise: null
};

// 確保全域變數存在
if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    console.log('使用已存在的資料庫連接');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log('建立新的資料庫連接...');
    // 安全地使用 MONGODB_URI，因為已經確認它一定有值
    console.log('MongoDB URI:', MONGODB_URI.replace(/:[^:@]*@/, ':****@'));

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('資料庫連接成功');
      return mongoose;
    });
  }

  try {
    const mongoose = await cached.promise;
    cached.conn = mongoose;
    console.log('資料庫連接狀態:', mongoose.connection.readyState);
    return mongoose;
  } catch (error) {
    cached.promise = null;
    console.error('等待資料庫連接時發生錯誤:', error);
    throw error;
  }
}

// 監聽連接事件
mongoose.connection.on('connected', () => {
  console.log('Mongoose 已連接');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose 連接錯誤:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose 已斷開連接');
});

export default dbConnect; 