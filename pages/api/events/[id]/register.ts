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

    const { id } = req.query;
    const { name, numberOfPeople, notes } = req.body;

    // 找到活動並更新
    const event = await Event.findById(id);
    
    if (!event) {
      return res.status(404).json({ message: '找不到活動' });
    }

    // 添加報名資料
    event.registrations.push({
      name,
      numberOfPeople,
      notes,
      registeredAt: new Date()
    });

    // 更新報名人數
    event.currentParticipants += Number(numberOfPeople);
    
    // 保存更改
    await event.save();

    return res.status(200).json({
      success: true,
      message: '報名成功'
    });

  } catch (error: any) {
    console.error('報名失敗:', error);
    return res.status(500).json({
      success: false,
      message: '報名失敗',
      error: error.message
    });
  }
} 