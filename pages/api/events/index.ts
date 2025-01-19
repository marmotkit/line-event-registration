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
      return res.status(200).json({
        success: true,
        data: events
      });
    }

    if (req.method === 'POST') {
      const {
        title,
        description,
        startDate,
        endDate,
        registrationDeadline,
        maxParticipants,
        groupId,
        status = 'active',
        createdBy = 'admin'
      } = req.body;

      // 驗證必要欄位
      if (!title || !description || !startDate || !endDate || !registrationDeadline || !maxParticipants || !groupId) {
        return res.status(400).json({
          success: false,
          message: '缺少必要欄位'
        });
      }

      // 轉換日期字串為 Date 物件
      const eventData = {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        registrationDeadline: new Date(registrationDeadline),
        maxParticipants: parseInt(maxParticipants),
        groupId,
        status,
        createdBy,
        currentParticipants: 0,
        participants: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('準備建立活動:', JSON.stringify(eventData, null, 2));

      try {
        // 驗證日期
        if (eventData.endDate <= eventData.startDate) {
          return res.status(400).json({
            success: false,
            message: '結束時間必須晚於開始時間'
          });
        }

        if (eventData.registrationDeadline >= eventData.startDate) {
          return res.status(400).json({
            success: false,
            message: '報名截止時間必須早於活動開始時間'
          });
        }

        // 建立活動
        const event = new Event(eventData);
        const savedEvent = await event.save();
        
        console.log('活動建立成功:', savedEvent);
        return res.status(201).json({
          success: true,
          data: savedEvent
        });
      } catch (saveError: any) {
        console.error('儲存活動時發生錯誤:', {
          error: saveError,
          message: saveError.message,
          name: saveError.name,
          stack: saveError.stack
        });

        if (saveError.name === 'ValidationError') {
          return res.status(400).json({
            success: false,
            message: '資料驗證失敗',
            errors: Object.values(saveError.errors).map((err: any) => err.message)
          });
        }

        throw saveError;
      }
    }

    // 處理 OPTIONS 請求
    if (req.method === 'OPTIONS') {
      res.setHeader('Allow', allowedMethods.join(', '));
      return res.status(200).end();
    }

    return res.status(405).json({
      success: false,
      message: '方法不允許'
    });

  } catch (error: any) {
    console.error('處理請求時發生錯誤:', {
      error: error,
      message: error.message,
      name: error.name,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      message: error.message || '伺服器錯誤',
      error: error.name,
      details: error.errors ? Object.values(error.errors).map((err: any) => err.message) : []
    });
  }
} 