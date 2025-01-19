import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '../../../../utils/db';
import Event from '../../../../models/Event';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允許' });
  }

  let connection;
  try {
    // 1. 連接資料庫
    connection = await dbConnect();
    console.log('MongoDB 連接狀態:', mongoose.connection.readyState);

    // 2. 獲取並驗證輸入
    const { id } = req.query;
    const { name, numberOfPeople, notes } = req.body;
    console.log('收到報名資料:', { id, name, numberOfPeople, notes });

    // 3. 基本驗證
    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ message: '無效的活動 ID' });
    }

    // 4. 使用原子操作更新資料
    const result = await Event.findOneAndUpdate(
      { _id: id },
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
      },
      { 
        new: true,
        runValidators: true
      }
    );

    console.log('更新結果:', result ? '成功' : '失敗');

    if (!result) {
      return res.status(404).json({ message: '找不到活動或更新失敗' });
    }

    // 5. 返回成功
    return res.status(200).json({
      success: true,
      message: '報名成功'
    });

  } catch (error: any) {
    console.error('報名錯誤:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      message: '報名失敗',
      error: error.message,
      details: error.code
    });
  }
} 