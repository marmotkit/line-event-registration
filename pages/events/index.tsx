import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { 
  Container, 
  Button, 
  Typography, 
  Box, 
  AppBar, 
  Toolbar,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip
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
  status: string;
}

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error('獲取活動列表失敗');
        }
        const data = await response.json();
        setEvents(data.data || []);
      } catch (err) {
        console.error('錯誤:', err);
        setError(err instanceof Error ? err.message : '獲取活動列表失敗');
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            活動列表
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push('/events/new')}
          >
            建立新活動
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {events.length === 0 ? (
            <Typography variant="body1" color="text.secondary">
              目前沒有活動
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {events.map((event) => (
                <Grid item xs={12} sm={6} md={4} key={event._id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h5" component="div" gutterBottom>
                        {event.title}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        {event.description}
                      </Typography>

                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          開始時間：{formatDate(event.startDate)}
                        </Typography>
                        <Typography variant="body2">
                          結束時間：{formatDate(event.endDate)}
                        </Typography>
                        <Typography variant="body2">
                          報名截止：{formatDate(event.registrationDeadline)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={`${event.currentParticipants}/${event.maxParticipants} 人`}
                          color="primary"
                          size="small"
                        />
                        <Chip 
                          label={event.status === 'active' ? '報名中' : '已結束'}
                          color={event.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        onClick={() => router.push(`/events/${event._id}/register`)}
                      >
                        立即報名
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>
    </>
  );
}