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
  const { method } = req;
  
  await dbConnect();

  // 允許跨域請求
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 處理 OPTIONS 請求
  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  switch (method) {
    case 'GET':
      try {
        const events = await Event.find({}).sort({ createdAt: -1 });
        res.status(200).json(events);
      } catch (error) {
        console.error('取得活動列表失敗:', error);
        res.status(500).json({ message: '取得活動列表失敗' });
      }
      break;

    case 'POST':
      try {
        console.log('收到 POST 請求');
        console.log('請求內容:', req.body);
        
        const event = await Event.create({
          ...req.body,
          currentParticipants: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log('建立的活動:', event);
        res.status(201).json(event);
      } catch (error: any) {
        console.error('建立活動失敗:', error);
        res.status(500).json({ 
          message: '建立活動失敗', 
          error: error.message || '未知錯誤'
        });
      }
      break;

    default:
      res.status(405).json({ message: `不支援的請求方法: ${method}` });
      break;
  }
} 