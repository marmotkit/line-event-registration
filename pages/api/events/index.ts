import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import Event from '../../../models/Event';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const events = await Event.find({}).sort({ createdAt: -1 });
        res.status(200).json(events);
      } catch (error) {
        res.status(500).json({ message: '取得活動列表失敗' });
      }
      break;

    case 'POST':
      try {
        const event = await Event.create(req.body);
        res.status(201).json(event);
      } catch (error) {
        res.status(500).json({ message: '建立活動失敗' });
      }
      break;

    default:
      res.status(405).json({ message: '方法不允許' });
      break;
  }
} 