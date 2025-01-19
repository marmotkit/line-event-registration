import { useEffect, useState } from 'react';
import liff from '@line/liff';

interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants: number;
  status: string;
}

export default function Events() {
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);

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
        fetchEvents();
      } catch (error) {
        console.error('LIFF 初始化失敗:', error);
      } finally {
        setIsLoading(false);
      }
    }

    initializeLiff();
  }, []);

  async function fetchEvents() {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('取得活動列表失敗:', error);
    }
  }

  async function handleRegister(eventId: string) {
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
  }

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
          events.map((event) => (
            <div key={event._id} className="bg-white shadow rounded-lg p-4">
              <h2 className="text-xl font-bold mb-2">{event.title}</h2>
              <p className="text-gray-600 mb-2">{event.description}</p>
              <div className="text-sm text-gray-500">
                <p>開始時間：{new Date(event.startDate).toLocaleString()}</p>
                <p>結束時間：{new Date(event.endDate).toLocaleString()}</p>
                <p>報名人數：{event.currentParticipants}/{event.maxParticipants}</p>
                <p>狀態：{event.status}</p>
              </div>
              <button
                onClick={() => handleRegister(event._id)}
                disabled={event.currentParticipants >= event.maxParticipants || event.status !== 'active'}
                className="mt-4 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
              >
                {event.currentParticipants >= event.maxParticipants ? '已額滿' : '立即報名'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 