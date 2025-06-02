import { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

// 创建Auth上下文
const AuthContext = createContext();

// Auth提供者组件
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查本地存储中是否有token
    const token = localStorage.getItem('token');
    if (token) {
      // 在实际应用中，还应该验证token的有效性
      setIsAuthenticated(true);
      setUser({ username: localStorage.getItem('username') });
    }
    setLoading(false);
  }, []);

  // 登录
  const login = async (username, password) => {
    try {
      console.log('AuthContext: 尝试登录', username);
      const response = await authAPI.login(username, password);
      console.log('AuthContext: 登录响应', response.data);
      
      if (response.data && response.data.token) {
        const { token } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        
        setIsAuthenticated(true);
        setUser({ username });
        
        return { success: true };
      } else {
        console.error('AuthContext: 响应中没有token', response.data);
        return {
          success: false,
          message: '登录响应格式不正确'
        };
      }
    } catch (error) {
      console.error('AuthContext: 登录错误', error);
      return {
        success: false,
        message: error.response?.data?.error || '登录失败，请检查用户名和密码'
      };
    }
  };

  // 登出
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 创建一个钩子以便更容易访问上下文
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
