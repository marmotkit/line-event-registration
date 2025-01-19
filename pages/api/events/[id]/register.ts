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

    console.log('驗證報名資料...');
    // 驗證必要欄位
    if (!name || !numberOfPeople) {
      console.log('缺少必要欄位');
      return res.status(400).json({
        success: false,
        message: '請填寫姓名和報名人數'
      });
    }

    // 驗證 id 格式
    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      console.log('無效的活動 ID');
      return res.status(400).json({
        success: false,
        message: '無效的活動 ID'
      });
    }

    console.log('查詢活動資料...');
    // 找到活動
    const event = await Event.findById(id);
    console.log('活動資料:', event);

    if (!event) {
      console.log('找不到活動');
      return res.status(404).json({
        success: false,
        message: '找不到活動'
      });
    }

    // 檢查活動狀態
    if (event.status !== 'active') {
      console.log('活動已結束報名');
      return res.status(400).json({
        success: false,
        message: '活動已結束報名'
      });
    }

    // 檢查報名截止時間
    if (new Date() > new Date(event.registrationDeadline)) {
      console.log('已超過報名截止時間');
      return res.status(400).json({
        success: false,
        message: '已超過報名截止時間'
      });
    }

    // 檢查剩餘名額
    const remainingSpots = event.maxParticipants - event.currentParticipants;
    if (numberOfPeople > remainingSpots) {
      console.log('剩餘名額不足');
      return res.status(400).json({
        success: false,
        message: `剩餘名額不足，目前只剩 ${remainingSpots} 個名額`
      });
    }

    console.log('建立報名資料...');
    // 建立報名資料
    const registration = {
      name,
      numberOfPeople,
      notes: notes || '',
      registeredAt: new Date()
    };

    console.log('更新活動資料...');
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

    console.log('報名成功');
    return res.status(200).json({
      success: true,
      message: '報名成功',
      data: updatedEvent
    });

  } catch (error: any) {
    console.error('報名處理錯誤:', {
      error: error,
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({
      success: false,
      message: '報名處理失敗',
      error: error.message,
      details: error.errors ? Object.values(error.errors).map((err: any) => err.message) : []
    });
  }
} 