import { Client, FlexMessage } from '@line/bot-sdk';

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
};

export class LineBotService {
  private client: Client;

  constructor() {
    this.client = new Client(config);
  }

  async pushEventMessage(groupId: string, event: any) {
    const message: FlexMessage = {
      type: "flex",
      altText: '新活動通知',
      contents: {
        type: 'bubble',
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: event.title,
              weight: 'bold',
              size: 'xl'
            },
            {
              type: 'text',
              text: event.description,
              wrap: true,
              margin: 'md'
            },
            {
              type: 'button',
              style: 'primary',
              action: {
                type: 'uri',
                label: '立即報名',
                uri: `${process.env.NEXT_PUBLIC_LIFF_URL}/event/${event.id}`
              },
              margin: 'md'
            }
          ]
        }
      }
    };

    return this.client.pushMessage(groupId, message);
  }
}

export default new LineBotService(); 