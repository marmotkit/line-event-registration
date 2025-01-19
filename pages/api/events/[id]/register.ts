import type { NextApiRequest, NextApiResponse } from 'next';
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

  const { id } = req.query;
  const { userId, lineProfile } = req.body;

  await dbConnect();

  try {
    // 檢查活動是否存在且開放報名
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: '活動不存在' });
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
      userId: userId,
    });

    if (existingRegistration) {
      return res.status(400).json({ message: '已經報名過此活動' });
    }

    // 建立報名記錄
    const registration = await Registration.create({
      eventId: id,
      userId,
      lineProfile,
    });

    // 更新活動報名人數
    await Event.findByIdAndUpdate(id, {
      $inc: { currentParticipants: 1 },
    });

    res.status(201).json(registration);
  } catch (error) {
    res.status(500).json({ message: '報名失敗' });
  }
} 