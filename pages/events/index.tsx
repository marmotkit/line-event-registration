import { useEffect, useState } from 'react';
import liff from '@line/liff';

export default function Events() {
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function initializeLiff() {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });
        if (!liff.isLoggedIn()) {
          liff.login();
        }
        setIsLoading(false);
      } catch (error) {
        console.error('LIFF 初始化失敗:', error);
      }
    }

    initializeLiff();
  }, []);

  if (isLoading) {
    return <div className="p-4">載入中...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">活動列表</h1>
      <div className="grid gap-4">
        {events.length === 0 ? (
          <p>目前沒有活動</p>
        ) : (
          events.map((event: any) => (
            <div key={event._id} className="bg-white shadow rounded-lg p-4">
              <h2 className="text-xl font-bold">{event.title}</h2>
              <p className="text-gray-600">{event.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 