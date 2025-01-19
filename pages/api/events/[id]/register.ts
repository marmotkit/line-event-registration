import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '../../../../utils/db';
import Event from '../../../../models/Event';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允許' });
  }

  try {
    // 1. 連接資料庫
    await dbConnect();
    console.log('資料庫連接成功');

    // 2. 獲取並驗證輸入
    const { id } = req.query;
    const { name, numberOfPeople, notes } = req.body;
    console.log('收到報名資料:', { id, name, numberOfPeople, notes });

    // 3. 基本驗證
    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ message: '無效的活動 ID' });
    }

    // 4. 檢查活動是否存在
    const event = await Event.findById(id);
    console.log('找到活動:', event ? '是' : '否');
    
    if (!event) {
      return res.status(404).json({ message: '找不到活動' });
    }

    // 5. 建立報名資料
    const registration = {
      name: name,
      numberOfPeople: Number(numberOfPeople),
      notes: notes || '',
      registeredAt: new Date()
    };

    // 6. 直接修改並保存
    event.registrations = event.registrations || [];
    event.registrations.push(registration);
    event.currentParticipants = (event.currentParticipants || 0) + Number(numberOfPeople);
    event.updatedAt = new Date();

    // 7. 保存更改
    await event.save();
    console.log('保存成功');

    // 8. 返回成功
    return res.status(200).json({
      success: true,
      message: '報名成功'
    });

  } catch (error: any) {
    // 詳細記錄錯誤
    console.error('報名錯誤:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });

    // 返回錯誤
    return res.status(500).json({
      success: false,
      message: '報名失敗',
      error: error.message
    });
  }
} 