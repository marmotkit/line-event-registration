import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('請設定 MONGODB_URI 環境變數');
}

// 定義快取介面
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// 定義全域變數介面
declare global {
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    console.log('使用已存在的資料庫連接');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log('建立新的資料庫連接...');
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('資料庫連接成功');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
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