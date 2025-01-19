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
    // 連接資料庫
    await dbConnect();
    console.log('資料庫連接成功');

    if (req.method === 'GET') {
      const events = await Event.find({}).sort({ createdAt: -1 });
      return res.status(200).json(events);
    }

    if (req.method === 'POST') {
      console.log('收到的資料:', req.body);

      // 轉換數字型別
      const formData = {
        ...req.body,
        maxParticipants: Number(req.body.maxParticipants)
      };

      // 建立活動
      const event = await Event.create(formData);
      console.log('建立的活動:', event);

      return res.status(201).json(event);
    }

    return res.status(405).json({ message: '方法不允許' });

  } catch (error: any) {
    console.error('API 錯誤:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    // 回傳詳細錯誤訊息
    return res.status(500).json({
      message: '伺服器錯誤',
      error: error.message,
      details: error.errors ? Object.values(error.errors).map((err: any) => err.message) : []
    });
  }
} 