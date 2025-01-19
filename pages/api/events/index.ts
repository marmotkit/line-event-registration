import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import Event from '../../../models/Event';

// 設定 API 配置
export const config = {
  api: {
    bodyParser: true, // 確保可以解析 POST 請求的內容
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  await dbConnect();

  try {
    switch (req.method) {
      case 'GET':
        const events = await Event.find({}).sort({ createdAt: -1 });
        return res.status(200).json(events);

      case 'POST':
        console.log('收到的資料:', req.body);
        const event = await Event.create({
          ...req.body,
          currentParticipants: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        return res.status(201).json(event);

      default:
        return res.status(405).json({ message: '方法不允許' });
    }
  } catch (error: any) {
    console.error('API 錯誤:', error);
    return res.status(500).json({ 
      message: error.message || '伺服器錯誤'
    });
  }
} 