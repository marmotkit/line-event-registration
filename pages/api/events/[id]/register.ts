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

    // 找到活動並更新
    const event = await Event.findByIdAndUpdate(
      id,
      {
        $push: {
          participants: {  // 改用 participants 而不是 registrations
            name,
            numberOfPeople: Number(numberOfPeople),
            notes,
            registeredAt: new Date()
          }
        },
        $inc: { currentParticipants: Number(numberOfPeople) },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: '找不到活動' });
    }

    return res.status(200).json({
      success: true,
      message: '報名成功',
      data: event
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