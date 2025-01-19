import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../utils/db';
import Event from '../../../../models/Event';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('1. 開始處理報名請求');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允許' });
  }

  try {
    console.log('2. 連接資料庫前');
    await dbConnect();
    console.log('3. 資料庫已連接');

    const { id } = req.query;
    const { name, numberOfPeople, notes } = req.body;
    
    console.log('4. 收到的資料:', {
      id,
      name,
      numberOfPeople,
      notes
    });

    // 先找到活動
    const event = await Event.findById(id);
    console.log('5. 找到活動:', event ? '是' : '否');

    if (!event) {
      return res.status(404).json({ message: '找不到活動' });
    }

    // 添加參與者
    event.participants.push({
      name,
      numberOfPeople: Number(numberOfPeople),
      notes: notes || '',
      registeredAt: new Date()
    });

    // 更新總人數
    event.currentParticipants += Number(numberOfPeople);

    // 保存更改
    await event.save();
    console.log('6. 保存成功');

    return res.status(200).json({
      success: true,
      message: '報名成功'
    });

  } catch (error: any) {
    console.error('錯誤:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      message: error.message || '報名失敗'
    });
  }
}