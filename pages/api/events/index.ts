import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import Event from '../../../models/Event';

// 明確設定允許的方法
const allowedMethods = ['GET', 'POST', 'OPTIONS'];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 調試日誌
  console.log('收到請求:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  });

  // 檢查請求方法是否允許
  if (!allowedMethods.includes(req.method || '')) {
    return res.status(405).json({ 
      message: '方法不允許',
      allowedMethods 
    });
  }

  // 處理 OPTIONS 請求
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', allowedMethods.join(', '));
    return res.status(200).end();
  }

  try {
    await dbConnect();

    if (req.method === 'GET') {
      const events = await Event.find({}).sort({ createdAt: -1 });
      return res.status(200).json(events);
    }

    if (req.method === 'POST') {
      // 調試日誌
      console.log('開始處理 POST 請求');
      console.log('請求內容:', req.body);

      // 驗證必要欄位
      const requiredFields = ['title', 'description', 'startDate', 'endDate', 'maxParticipants', 'groupId'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          message: '缺少必要欄位',
          missingFields
        });
      }

      const event = await Event.create({
        ...req.body,
        currentParticipants: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // 調試日誌
      console.log('活動建立成功:', event);

      return res.status(201).json(event);
    }
  } catch (error: any) {
    // 詳細的錯誤日誌
    console.error('API 錯誤:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    return res.status(500).json({
      message: '伺服器錯誤',
      error: error.message,
      name: error.name
    });
  }
} 