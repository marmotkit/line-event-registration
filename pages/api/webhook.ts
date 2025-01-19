import { WebhookRequestBody, MessageEvent } from '@line/bot-sdk';
import { NextApiRequest, NextApiResponse } from 'next';
import LineBotService from '../../services/lineBot';

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
};

export const config = {
  api: {
    bodyParser: false,
  },
};

async function handleMessageEvent(event: MessageEvent) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return;
  }

  // 在這裡處理訊息邏輯
  const { text } = event.message;
  
  // 示例：當使用者輸入特定指令時的處理
  if (text === '!活動清單') {
    // TODO: 實作顯示活動清單邏輯
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    const body: WebhookRequestBody = req.body;
    
    // 處理每個事件
    await Promise.all(
      body.events.map(async (event) => {
        if (event.type === 'message') {
          await handleMessageEvent(event);
        }
      })
    );

    res.status(200).json({ message: 'OK' });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 