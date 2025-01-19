import { useRouter } from 'next/router';
import { Container, Button, Typography, Box } from '@mui/material';

export default function EventsPage() {
  const router = useRouter();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          活動列表
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => router.push('/events/new')}
        >
          建立新活動
        </Button>
      </Box>
    </Container>
  );
}