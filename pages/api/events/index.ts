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
        return res.status(200).json({ 
          success: true, 
          data: events 
        });
      } catch (error) {
        return res.status(500).json({ 
          success: false, 
          message: '獲取活動列表失敗' 
        });
      }

    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ 
        success: false, 
        message: `方法 ${req.method} 不允許` 
      });
  }
} 