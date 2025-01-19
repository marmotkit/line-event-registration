import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { TextField, Button, Container, Box, Typography } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { addDays } from 'date-fns';

interface FormData {
  title: string;
  description: string;
  startDate: Date | null;
  endDate: Date | null;
  registrationDeadline: Date | null;
  maxParticipants: string;
  groupId: string;
}

export default function NewEvent() {
  const router = useRouter();
  const now = new Date();
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    startDate: addDays(now, 1),
    endDate: addDays(now, 2),
    registrationDeadline: now,
    maxParticipants: '20',
    groupId: 'default'
  });

  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!formData.startDate || !formData.endDate || !formData.registrationDeadline) {
      setError('請填寫所有日期欄位');
      return;
    }

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          startDate: formData.startDate.toISOString(),
          endDate: formData.endDate.toISOString(),
          registrationDeadline: formData.registrationDeadline.toISOString(),
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '建立活動失敗');
      }

      router.push('/events');
    } catch (error) {
      console.error('錯誤:', error);
      setError(error instanceof Error ? error.message : '建立活動失敗');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          建立新活動
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="活動名稱"
            margin="normal"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          
          <TextField
            fullWidth
            label="活動說明"
            margin="normal"
            multiline
            rows={4}
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <Box sx={{ mt: 2 }}>
            <DateTimePicker
              label="開始時間"
              value={formData.startDate}
              onChange={(date) => setFormData({ ...formData, startDate: date })}
              sx={{ width: '100%' }}
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <DateTimePicker
              label="結束時間"
              value={formData.endDate}
              onChange={(date) => setFormData({ ...formData, endDate: date })}
              sx={{ width: '100%' }}
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <DateTimePicker
              label="報名截止時間"
              value={formData.registrationDeadline}
              onChange={(date) => setFormData({ ...formData, registrationDeadline: date })}
              sx={{ width: '100%' }}
            />
          </Box>

          <TextField
            fullWidth
            label="人數上限"
            type="number"
            margin="normal"
            required
            value={formData.maxParticipants}
            onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
            inputProps={{ min: 1 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            建立活動
          </Button>
        </Box>
      </Box>
    </Container>
  );
} 