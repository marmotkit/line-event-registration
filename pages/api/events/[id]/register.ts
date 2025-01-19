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

    // 使用 Promise 處理資料庫操作
    const event = await new Promise(async (resolve, reject) => {
      try {
        const result = await Event.findByIdAndUpdate(
          id,
          {
            $push: {
              participants: {
                name,
                numberOfPeople: Number(numberOfPeople),
                notes,
                registeredAt: new Date()
              }
            },
            $inc: { currentParticipants: Number(numberOfPeople) }
          },
          { new: true }
        );
        resolve(result);
      } catch (error) {
        console.error('5. 資料庫操作錯誤:', error);
        reject(error);
      }
    });

    console.log('6. 資料庫操作結果:', event);

    if (!event) {
      console.log('7. 找不到活動');
      return res.status(404).json({ 
        success: false,
        message: '找不到活動' 
      });
    }

    console.log('8. 報名成功');
    return res.status(200).json({
      success: true,
      message: '報名成功'
    });

  } catch (error: any) {
    console.error('9. 發生錯誤:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      message: '報名失敗',
      error: error.message
    });
  }
}