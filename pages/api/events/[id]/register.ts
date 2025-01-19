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
    console.log('連接資料庫...');
    await dbConnect();
    console.log('資料庫連接成功');

    const { id } = req.query;
    const { name, numberOfPeople, notes } = req.body;

    console.log('報名資料:', { name, numberOfPeople, notes });

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
    const event = await Event.findById(id);
    console.log('找到活動:', event);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: '找不到活動'
      });
    }

    // 檢查活動是否有 registrations 欄位，如果沒有則初始化
    if (!event.registrations) {
      event.registrations = [];
    }

    // 建立報名資料
    const registration = {
      name,
      numberOfPeople: parseInt(numberOfPeople),
      notes: notes || '',
      registeredAt: new Date()
    };

    console.log('準備更新活動資料:', {
      registration,
      currentParticipants: event.currentParticipants || 0
    });

    // 更新活動資料
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        $push: { registrations: registration },
        $inc: { currentParticipants: parseInt(numberOfPeople) },
        $set: { updatedAt: new Date() }
      },
      { 
        new: true, 
        runValidators: true,
        upsert: false
      }
    );

    console.log('更新後的活動資料:', updatedEvent);

    if (!updatedEvent) {
      throw new Error('更新活動資料失敗');
    }

    return res.status(200).json({
      success: true,
      message: '報名成功',
      data: updatedEvent
    });

  } catch (error: any) {
    console.error('報名處理錯誤:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    });

    // 如果是 MongoDB 錯誤
    if (error.name === 'MongoServerError') {
      return res.status(500).json({
        success: false,
        message: '資料庫操作失敗',
        error: error.message,
        code: error.code
      });
    }

    return res.status(500).json({
      success: false,
      message: '報名處理失敗',
      error: error.message
    });
  }
} 