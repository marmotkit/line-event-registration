import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import Event from '../../../models/Event';

// 明確設定允許的方法
const allowedMethods = ['GET', 'POST', 'OPTIONS'];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. 記錄請求資訊
  console.log('API 請求開始', {
    method: req.method,
    body: req.body,
    headers: req.headers
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
    // 2. 嘗試連接資料庫
    console.log('開始連接資料庫...');
    const conn = await dbConnect();
    console.log('資料庫連接成功', {
      readyState: conn?.connection?.readyState
    });

    if (req.method === 'GET') {
      const events = await Event.find({}).sort({ createdAt: -1 });
      return res.status(200).json(events);
    }

    if (req.method === 'POST') {
      // 3. 驗證請求資料
      const requiredFields = [
        'title',
        'description',
        'startDate',
        'endDate',
        'registrationDeadline',
        'maxParticipants',
        'groupId'
      ];

      const missingFields = requiredFields.filter(field => !req.body[field]);
      if (missingFields.length > 0) {
        console.log('缺少必要欄位', { missingFields });
        return res.status(400).json({
          message: '缺少必要欄位',
          missingFields
        });
      }

      // 4. 準備資料
      const formData = {
        ...req.body,
        maxParticipants: Number(req.body.maxParticipants),
        currentParticipants: 0,
        participants: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('準備建立活動', formData);

      // 5. 建立活動
      try {
        const event = await Event.create(formData);
        console.log('活動建立成功', event);
        return res.status(201).json(event);
      } catch (createError: any) {
        console.error('建立活動失敗', {
          error: createError,
          message: createError.message,
          name: createError.name,
          stack: createError.stack,
          errors: createError.errors
        });
        throw createError;
      }
    }

    return res.status(405).json({ message: '方法不允許' });

  } catch (error: any) {
    console.error('API 錯誤', {
      error,
      message: error.message,
      name: error.name,
      stack: error.stack,
      errors: error.errors
    });

    // 根據錯誤類型返回適當的錯誤訊息
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: '資料驗證失敗',
        errors: Object.values(error.errors).map((err: any) => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return res.status(500).json({
        message: '資料庫錯誤',
        error: error.message
      });
    }

    return res.status(500).json({
      message: '伺服器錯誤',
      error: error.message,
      details: error.errors ? Object.values(error.errors).map((err: any) => err.message) : [],
      name: error.name
    });
  }
} 