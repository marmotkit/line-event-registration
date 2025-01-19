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
    console.log('MongoDB 連接狀態:', mongoose.connection.readyState);

    // 2. 獲取輸入
    const { id } = req.query;
    const { name, numberOfPeople, notes } = req.body;
    console.log('收到報名資料:', { id, name, numberOfPeople, notes });

    // 3. 直接使用 mongoose 操作
    const Event = mongoose.model('Event');
    
    // 4. 嘗試更新
    const result = await Event.collection.updateOne(
      { _id: new mongoose.Types.ObjectId(id as string) },
      {
        $push: {
          registrations: {
            name,
            numberOfPeople: Number(numberOfPeople),
            notes: notes || '',
            registeredAt: new Date()
          }
        },
        $inc: { currentParticipants: Number(numberOfPeople) },
        $set: { updatedAt: new Date() }
      }
    );

    console.log('更新結果:', result);

    if (result.modifiedCount === 0) {
      return res.status(404).json({ 
        success: false,
        message: '找不到活動或更新失敗' 
      });
    }

    return res.status(200).json({
      success: true,
      message: '報名成功',
      result: result
    });

  } catch (error: any) {
    console.error('報名錯誤:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack,
      connectionState: mongoose.connection.readyState
    });

    return res.status(500).json({
      success: false,
      message: '報名失敗',
      error: error.message,
      code: error.code,
      connectionState: mongoose.connection.readyState
    });
  }
} 