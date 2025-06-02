import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError(t('common.validation.requiredFields'));
      return;
    }

    console.log('提交登录表单，用户名:', username);
    try {
      const result = await login(username, password);
      console.log('登录结果:', result);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(t('common.validation.loginFailed'));
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Box
            sx={{
              backgroundColor: 'primary.main',
              borderRadius: '50%',
              padding: 1,
              marginBottom: 1,
            }}
          >
            <LockOutlinedIcon sx={{ color: 'white' }} />
          </Box>
          <Typography component="h1" variant="h5">
            {t('common.login')}
          </Typography>
          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {error}
            </Alert>
          )}
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1, width: '100%' }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label={t('common.username')}
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label={t('common.password')}
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              {t('common.login')}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;
