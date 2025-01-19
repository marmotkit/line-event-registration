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

  try {
    await dbConnect();

    const { id } = req.query;  // 使用 id 而不是 eventId
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

    // 檢查活動狀態
    if (event.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: '活動已結束報名'
      });
    }

    // 檢查報名截止時間
    if (new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({
        success: false,
        message: '已超過報名截止時間'
      });
    }

    // 檢查剩餘名額
    const remainingSpots = event.maxParticipants - event.currentParticipants;
    if (numberOfPeople > remainingSpots) {
      return res.status(400).json({
        success: false,
        message: `剩餘名額不足，目前只剩 ${remainingSpots} 個名額`
      });
    }

    // 建立報名資料
    const registration = {
      name,
      numberOfPeople,
      notes: notes || '',
      registeredAt: new Date()
    };

    // 更新活動資料
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        $push: { registrations: registration },
        $inc: { currentParticipants: numberOfPeople },
        $set: { updatedAt: new Date() }
      },
      { new: true, runValidators: true }
    );

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
      error: error.message
    });
  }
} 