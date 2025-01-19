import type { NextApiRequest, NextApiResponse } from 'next';
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
    console.log('資料庫連接成功');

    const { id } = req.query;
    const { name, numberOfPeople, notes } = req.body;

    // 先查詢活動，看看結構
    const existingEvent = await Event.findById(id);
    console.log('現有活動資料:', JSON.stringify(existingEvent, null, 2));

    if (!existingEvent) {
      return res.status(404).json({ message: '找不到活動' });
    }

    // 準備要更新的資料
    const updateData = {
      name,
      numberOfPeople: Number(numberOfPeople),
      notes: notes || '',
      registeredAt: new Date()
    };
    console.log('準備更新的資料:', updateData);

    // 更新活動
    existingEvent.participants = existingEvent.participants || [];
    existingEvent.participants.push(updateData);
    existingEvent.currentParticipants = (existingEvent.currentParticipants || 0) + Number(numberOfPeople);
    existingEvent.updatedAt = new Date();

    // 保存更改
    const savedEvent = await existingEvent.save();
    console.log('更新後的活動:', JSON.stringify(savedEvent, null, 2));

    return res.status(200).json({
      success: true,
      message: '報名成功',
      data: savedEvent
    });

  } catch (error: any) {
    console.error('報名失敗:', {
      error: error,
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });

    return res.status(500).json({
      success: false,
      message: '報名失敗',
      error: error.message,
      details: error.code
    });
  }
}