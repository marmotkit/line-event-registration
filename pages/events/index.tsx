import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid
} from '@mui/material';

interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxParticipants: number;
  currentParticipants: number;
}

export default function EventList() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (error) {
      console.error('獲取活動列表失敗:', error);
    }
  };

  const handleCreateEvent = () => {
    router.push('/events/create');
  };

  const handleRegister = (eventId: string) => {
    router.push(`/events/${eventId}/register`);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1">
            活動列表
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateEvent}
          >
            建立新活動
          </Button>
        </Box>

        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h2">
                    {event.title}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    開始時間：{new Date(event.startDate).toLocaleString('zh-TW')}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    結束時間：{new Date(event.endDate).toLocaleString('zh-TW')}
                  </Typography>
                  <Typography>
                    報名人數：{event.currentParticipants} / {event.maxParticipants}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => handleRegister(event._id)}
                  >
                    立即報名
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}