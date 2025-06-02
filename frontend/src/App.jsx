import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { CssBaseline, createTheme, ThemeProvider } from '@mui/material'
import { AuthProvider } from './context/AuthContext'
import Login from './components/Login'
import FileExplorer from './components/FileExplorer'
import PrivateRoute from './components/PrivateRoute'
import LanguageSwitcher from './components/LanguageSwitcher'
import './App.css'

// 创建主题
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <Router>
          <Routes>
            {/* 登录路由 */}
            <Route path="/login" element={<Login />} />
            
            {/* 受保护的路由 */}
            <Route path="/" element={<PrivateRoute />}>
              <Route index element={<FileExplorer />} />
            </Route>
            
            {/* 未匹配路由重定向 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
