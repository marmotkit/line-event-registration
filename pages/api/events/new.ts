import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import Event from '../../../models/Event';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      message: '方法不允許，此端點只接受 POST 請求' 
    });
  }

  try {
    await dbConnect();
    
    const {
      title,
      description,
      startDate,
      endDate,
      registrationDeadline,
      maxParticipants,
      groupId = 'default',
    } = req.body;

    // 驗證必要欄位
    if (!title || !description || !startDate || !endDate || !registrationDeadline || !maxParticipants) {
      return res.status(400).json({
        success: false,
        message: '缺少必要欄位'
      });
    }

    const event = new Event({
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      registrationDeadline: new Date(registrationDeadline),
      maxParticipants: parseInt(maxParticipants),
      groupId,
      status: 'active',
      currentParticipants: 0,
      participants: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedEvent = await event.save();
    return res.status(201).json({
      success: true,
      data: savedEvent
    });

  } catch (error: any) {
    console.error('建立活動失敗:', error);
    return res.status(500).json({
      success: false,
      message: error.message || '伺服器錯誤'
    });
  }
} 