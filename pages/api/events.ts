import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../utils/db';
import Event from '../../models/Event';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const events = await Event.find({}).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: events });
      } catch (error) {
        return res.status(500).json({ success: false, message: '獲取活動列表失敗' });
      }

    case 'POST':
      try {
        const {
          title,
          description,
          startDate,
          endDate,
          registrationDeadline,
          maxParticipants,
          groupId = 'default',
        } = req.body;

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
        return res.status(201).json({ success: true, data: savedEvent });
      } catch (error) {
        return res.status(500).json({ success: false, message: '建立活動失敗' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ success: false, message: `方法 ${req.method} 不允許` });
  }
} 