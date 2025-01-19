import { useState } from 'react';
import { useRouter } from 'next/router';

interface EventForm {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxParticipants: number;
  groupId: string;
}

export default function Admin() {
  const router = useRouter();
  const [formData, setFormData] = useState<EventForm>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    maxParticipants: 0,
    groupId: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          createdBy: 'admin',
          status: 'active'
        }),
      });

      if (response.ok) {
        alert('活動建立成功！');
        router.push('/events');
      } else {
        throw new Error('活動建立失敗');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('活動建立失敗，請稍後再試');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">建立新活動</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">活動名稱</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1">活動說明</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block mb-1">開始時間</label>
          <input
            type="datetime-local"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1">結束時間</label>
          <input
            type="datetime-local"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1">報名截止時間</label>
          <input
            type="datetime-local"
            name="registrationDeadline"
            value={formData.registrationDeadline}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1">人數上限</label>
          <input
            type="number"
            name="maxParticipants"
            value={formData.maxParticipants}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            min="1"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Line 群組 ID</label>
          <input
            type="text"
            name="groupId"
            value={formData.groupId}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          建立活動
        </button>
      </form>
    </div>
  );
} 