import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '../../../../utils/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('1. 開始處理報名請求');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允許' });
  }

  try {
    console.log('2. 連接資料庫前');
    await dbConnect();
    console.log('3. 資料庫已連接');

    const { id } = req.query;
    const { name, numberOfPeople, notes } = req.body;
    
    console.log('4. 收到的資料:', {
      id,
      name,
      numberOfPeople,
      notes
    });

    // 確保資料庫已連接
    if (!mongoose.connection.db) {
      throw new Error('資料庫未連接');
    }

    // 使用原生 MongoDB 操作
    const collection = mongoose.connection.db.collection('events');

    // 直接更新文檔
    const result = await collection.updateOne(
      { _id: new mongoose.Types.ObjectId(id as string) },
      {
        $push: {
          participants: {
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

    console.log('5. 更新結果:', result);

    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        success: false,
        message: '找不到活動' 
      });
    }

    if (result.modifiedCount === 0) {
      return res.status(400).json({ 
        success: false,
        message: '更新失敗' 
      });
    }

    return res.status(200).json({
      success: true,
      message: '報名成功'
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
      message: error.message || '報名失敗',
      details: {
        name: error.name,
        code: error.code,
        connectionState: mongoose.connection.readyState
      }
    });
  }
}