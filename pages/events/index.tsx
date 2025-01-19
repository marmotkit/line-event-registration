import { useRouter } from 'next/router';
import { Container, Button, Typography, Box, AppBar, Toolbar } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

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
            startIcon={<AddIcon />}
            onClick={() => router.push('/events/new')}
          >
            建立新活動
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          {/* 這裡是活動列表的內容 */}
          <Typography variant="body1" color="text.secondary">
            目前沒有活動
          </Typography>
        </Box>
      </Container>
    </>
  );
}