import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import liff from '@line/liff';

interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants: number;
}

export default function EventDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    async function initializeLiff() {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });
        if (liff.isLoggedIn()) {
          const profile = await liff.getProfile();
          setUserProfile(profile);
        } else {
          await liff.login();
        }
      } catch (error) {
        console.error('LIFF 初始化失敗:', error);
      }
    }

    initializeLiff();
  }, []);

  useEffect(() => {
    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  async function fetchEventDetails() {
    try {
      const response = await fetch(`/api/events/${id}`);
      const data = await response.json();
      setEvent(data);
    } catch (error) {
      console.error('取得活動詳情失敗:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegister() {
    if (!userProfile) {
      alert('請先登入');
      return;
    }

    try {
      const response = await fetch(`/api/events/${id}/register`, {
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
        await fetchEventDetails();
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

  if (!event) {
    return <div className="p-4">找不到活動</div>;
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{event.title}</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="mb-4">{event.description}</p>
        <div className="mb-4">
          <p>開始時間：{new Date(event.startDate).toLocaleString()}</p>
          <p>結束時間：{new Date(event.endDate).toLocaleString()}</p>
          <p>報名人數：{event.currentParticipants}/{event.maxParticipants}</p>
        </div>
        <button
          onClick={handleRegister}
          disabled={event.currentParticipants >= event.maxParticipants}
          className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
        >
          {event.currentParticipants >= event.maxParticipants ? '已額滿' : '立即報名'}
        </button>
      </div>
    </div>
  );
} 