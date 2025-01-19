import type { NextApiRequest, NextApiResponse } from 'next';
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

    // 2. 先嘗試查詢活動
    const { id } = req.query;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: '找不到活動' 
      });
    }

    // 3. 如果找到活動，返回成功
    return res.status(200).json({
      success: true,
      message: '找到活動',
      event: event
    });

  } catch (error: any) {
    console.error('操作失敗:', {
      error: error,
      message: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      message: '操作失敗',
      error: error.message
    });
  }
}