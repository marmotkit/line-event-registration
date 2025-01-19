import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '../../../../utils/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允許' });
  }

  try {
    // 1. 連接資料庫
    await dbConnect();
    
    // 2. 檢查連接狀態
    if (mongoose.connection.readyState !== 1) {
      throw new Error(`資料庫未連接，目前狀態: ${mongoose.connection.readyState}`);
    }

    // 3. 獲取活動 ID
    const { id } = req.query;
    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ message: '無效的活動 ID' });
    }

    // 4. 檢查資料庫是否可用
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('無法獲取資料庫實例');
    }

    // 5. 檢查集合是否存在
    const collections = await db.listCollections().toArray();
    const hasEventsCollection = collections.some(col => col.name === 'events');
    if (!hasEventsCollection) {
      throw new Error('events 集合不存在');
    }

    // 6. 查詢活動是否存在
    const collection = db.collection('events');
    const event = await collection.findOne({ 
      _id: new mongoose.Types.ObjectId(id as string) 
    });

    if (!event) {
      return res.status(404).json({ message: '找不到活動' });
    }

    // 7. 返回成功
    return res.status(200).json({
      success: true,
      message: '資料庫連接正常',
      event: event
    });

  } catch (error: any) {
    console.error('錯誤:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack,
      connectionState: mongoose.connection.readyState
    });

    return res.status(500).json({
      success: false,
      message: error.message || '操作失敗',
      details: {
        name: error.name,
        code: error.code,
        connectionState: mongoose.connection.readyState
      }
    });
  }
}