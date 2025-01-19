import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '../../../../utils/db';
import Event from '../../../../models/Event';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('開始處理報名請求');
  console.log('請求方法:', req.method);
  console.log('活動 ID:', req.query.id);
  console.log('報名資料:', req.body);

  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允許' });
  }

  try {
    await dbConnect();
    console.log('資料庫連接成功');

    const { id } = req.query;
    const { name, numberOfPeople, notes } = req.body;

    console.log('報名資料:', { id, name, numberOfPeople, notes });

    // 驗證必要欄位
    if (!name || !numberOfPeople) {
      return res.status(400).json({
        success: false,
        message: '請填寫姓名和報名人數'
      });
    }

    // 驗證 id 格式
    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({
        success: false,
        message: '無效的活動 ID'
      });
    }

    // 找到活動
    const event = await Event.findById(id).lean();
    console.log('找到活動:', event);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: '找不到活動'
      });
    }

    // 建立報名資料
    const registration = {
      name,
      numberOfPeople: parseInt(numberOfPeople),
      notes: notes || '',
      registeredAt: new Date()
    };

    // 使用 updateOne 而不是 findByIdAndUpdate
    const result = await Event.updateOne(
      { _id: id },
      {
        $push: { registrations: registration },
        $inc: { currentParticipants: parseInt(numberOfPeople) },
        $set: { updatedAt: new Date() }
      }
    );

    console.log('更新結果:', result);

    if (result.modifiedCount === 0) {
      throw new Error('更新活動資料失敗');
    }

    // 重新獲取更新後的活動資料
    const updatedEvent = await Event.findById(id);

    return res.status(200).json({
      success: true,
      message: '報名成功',
      data: updatedEvent
    });

  } catch (error: any) {
    console.error('報名處理錯誤:', error);
    return res.status(500).json({
      success: false,
      message: '報名處理失敗',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 