import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

// 私有路由组件：只有认证用户才能访问
function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();

  // 显示加载状态
  if (loading) {
    return (
      <Box 
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // 如果没有认证，重定向到登录页
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 渲染子路由
  return <Outlet />;
}

export default PrivateRoute;
