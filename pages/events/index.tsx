import { useRouter } from 'next/router';
import { Container, Button, Typography, Box, AppBar, Toolbar } from '@mui/material';

export default function EventsPage() {
  const router = useRouter();

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
          <Typography variant="body1" color="text.secondary">
            目前沒有活動
          </Typography>
        </Box>
      </Container>
    </>
  );
}
