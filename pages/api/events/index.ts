import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '../../../utils/db';
import Event from '../../../models/Event';

// 明確設定允許的方法
const allowedMethods = ['GET', 'POST', 'OPTIONS'];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('開始處理請求:', req.method);

  try {
    // 1. 連接資料庫
    console.log('嘗試連接資料庫...');
    await dbConnect();
    console.log('資料庫連接狀態:', mongoose.connection.readyState);

    if (req.method === 'GET') {
      const events = await Event.find({}).sort({ createdAt: -1 });
      return res.status(200).json(events);
    }

    if (req.method === 'POST') {
      // 2. 記錄請求資料
      console.log('收到 POST 請求資料:', JSON.stringify(req.body, null, 2));

      // 3. 建立活動文件
      const eventData = {
        ...req.body,
        maxParticipants: parseInt(req.body.maxParticipants),
        currentParticipants: 0,
        participants: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('準備建立活動:', JSON.stringify(eventData, null, 2));

      // 4. 嘗試儲存到資料庫
      try {
        const event = new Event(eventData);
        const savedEvent = await event.save();
        console.log('活動建立成功:', savedEvent);
        return res.status(201).json(savedEvent);
      } catch (saveError: any) {
        console.error('儲存活動時發生錯誤:', {
          error: saveError,
          message: saveError.message,
          stack: saveError.stack
        });
        throw saveError;
      }
    }

    // 處理 OPTIONS 請求
    if (req.method === 'OPTIONS') {
      res.setHeader('Allow', allowedMethods.join(', '));
      return res.status(200).end();
    }

    return res.status(405).json({ message: '方法不允許' });

  } catch (error: any) {
    console.error('處理請求時發生錯誤:', {
      error: error,
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    // 根據錯誤類型返回適當的回應
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: '資料驗證失敗',
        errors: Object.values(error.errors).map((err: any) => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    return res.status(500).json({
      success: false,
      message: '伺服器錯誤',
      error: error.message,
      errorType: error.name
    });
  }
} 