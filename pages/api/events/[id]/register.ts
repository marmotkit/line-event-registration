import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '../../../../utils/db';
import Event from '../../../../models/Event';
import Registration from '../../../../models/Registration';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允許' });
  }

  try {
    await dbConnect();

    const { id } = req.query;
    const { name, numberOfPeople, notes } = req.body;

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
    if (!event) {
      return res.status(404).json({
        success: false,
        message: '找不到活動'
      });
    }

    if (event.status !== 'active') {
      return res.status(400).json({ message: '活動已結束或已取消' });
    }

    if (event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({ message: '活動已額滿' });
    }

    // 檢查是否重複報名
    const existingRegistration = await Registration.findOne({
      eventId: id,
      userId: name,
    });

    if (existingRegistration) {
      return res.status(400).json({ message: '已經報名過此活動' });
    }

    // 建立報名記錄
    const registration = await Registration.create({
      eventId: id,
      userId: name,
      lineProfile: {
        name: name,
        numberOfPeople: numberOfPeople,
        notes: notes,
      },
    });

    // 更新活動報名人數
    await Event.findByIdAndUpdate(id, {
      $inc: { currentParticipants: 1 },
    });

    res.status(201).json(registration);
  } catch (error: any) {
    console.error('報名處理錯誤:', error);
    return res.status(500).json({
      success: false,
      message: '報名處理失敗',
      error: error.message
    });
  }
} 