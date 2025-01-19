import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import liff from '@line/liff';

interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxParticipants: number;
  currentParticipants: number;
  status: string;
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [userProfile, setUserProfile] = useState<any>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '獲取活動列表失敗');
      }

      // 確保 data 是陣列
      const eventData = Array.isArray(result.data) ? result.data : [];
      setEvents(eventData);
    } catch (error: any) {
      console.error('獲取活動列表失敗:', error);
      setError(error.message || '獲取活動列表失敗');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    async function initializeLiff() {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });
        if (!liff.isLoggedIn()) {
          liff.login();
        } else {
          const profile = await liff.getProfile();
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('LIFF 初始化失敗:', error);
      }
    }

    initializeLiff();
  }, []);

  const handleRegister = async (eventId: string) => {
    if (!userProfile) {
      alert('請先登入');
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userProfile.userId,
          lineProfile: userProfile,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        alert('報名成功！');
        fetchEvents(); // 重新載入活動列表
      } else {
        alert(data.message || '報名失敗');
      }
    } catch (error) {
      console.error('報名失敗:', error);
      alert('報名失敗，請稍後再試');
    }
  };

  if (loading) {
    return <div className="text-center p-4">載入中...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        錯誤: {error}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center p-4">
        目前沒有活動
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">活動列表</h1>
      <div className="grid gap-4">
        {events.map((event) => (
          <div
            key={event._id}
            className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
            <p className="text-gray-600 mb-2">{event.description}</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
              <div>
                <span className="font-medium">開始時間：</span>
                {new Date(event.startDate).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">結束時間：</span>
                {new Date(event.endDate).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">報名截止：</span>
                {new Date(event.registrationDeadline).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">報名狀況：</span>
                {event.currentParticipants}/{event.maxParticipants}
              </div>
              <div>
                <span className="font-medium">狀態：</span>
                {event.status === 'active' ? '開放報名' : '已結束'}
              </div>
            </div>
            {event.status === 'active' && (
              <button
                onClick={() => handleRegister(event._id)}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                報名參加
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 