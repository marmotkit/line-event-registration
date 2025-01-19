import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import Event from '../../../models/Event';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const event = await Event.findById(id);
        if (!event) {
          return res.status(404).json({ message: '活動不存在' });
        }
        res.status(200).json(event);
      } catch (error) {
        res.status(500).json({ message: '取得活動資訊失敗' });
      }
      break;

    case 'PUT':
      try {
        const event = await Event.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!event) {
          return res.status(404).json({ message: '活動不存在' });
        }
        res.status(200).json(event);
      } catch (error) {
        res.status(500).json({ message: '更新活動失敗' });
      }
      break;

    case 'DELETE':
      try {
        const event = await Event.findByIdAndDelete(id);
        if (!event) {
          return res.status(404).json({ message: '活動不存在' });
        }
        res.status(200).json({ message: '活動已刪除' });
      } catch (error) {
        res.status(500).json({ message: '刪除活動失敗' });
      }
      break;

    default:
      res.status(405).json({ message: '方法不允許' });
      break;
  }
} 