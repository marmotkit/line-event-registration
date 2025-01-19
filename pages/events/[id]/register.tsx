import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button
} from '@mui/material';

interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants: number;
}

export default function Register() {
  const router = useRouter();
  const { id } = router.query;
  const [event, setEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    numberOfPeople: '1',
    notes: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${id}`);
      const data = await response.json();
      if (data.success) {
        setEvent(data.data);
      }
    } catch (error) {
      console.error('獲取活動資訊失敗:', error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`/api/events/${id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '報名失敗');
      }

      router.push('/events');
    } catch (error) {
      setError(error instanceof Error ? error.message : '報名失敗');
    }
  };

  if (!event) {
    return (
      <Container>
        <Typography>載入中...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          活動報名
        </Typography>
        
        <Typography variant="h5" gutterBottom>
          {event.title}
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="姓名"
            margin="normal"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <TextField
            fullWidth
            label="報名人數"
            type="number"
            margin="normal"
            required
            value={formData.numberOfPeople}
            onChange={(e) => setFormData({ ...formData, numberOfPeople: e.target.value })}
            inputProps={{ min: 1 }}
          />

          <TextField
            fullWidth
            label="備註"
            margin="normal"
            multiline
            rows={4}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            確認報名
          </Button>
        </Box>
      </Box>
    </Container>
  );
} 