import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants: number;
  status: 'active' | 'closed' | 'cancelled';
}

export default function EventManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
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

  async function handleDelete(id: string) {
    if (!confirm('確定要刪除此活動？')) return;

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchEvents();
      } else {
        alert('刪除失敗');
      }
    } catch (error) {
      console.error('刪除活動失敗:', error);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">活動管理</h1>
        <button
          onClick={() => router.push('/admin/events/new')}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          新增活動
        </button>
      </div>

      <div className="grid gap-4">
        {events.map((event) => (
          <div key={event._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold mb-2">{event.title}</h2>
                <p className="text-gray-600 mb-2">{event.description}</p>
                <p>開始時間：{new Date(event.startDate).toLocaleString()}</p>
                <p>結束時間：{new Date(event.endDate).toLocaleString()}</p>
                <p>報名人數：{event.currentParticipants}/{event.maxParticipants}</p>
                <p>狀態：{event.status}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => router.push(`/admin/events/${event._id}/edit`)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  編輯
                </button>
                <button
                  onClick={() => handleDelete(event._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  刪除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 