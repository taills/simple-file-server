import axios from 'axios';

// 创建axios实例
const api = axios.create();

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('API响应成功:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('API响应错误:', 
      error.config?.url, 
      error.response?.status, 
      error.response?.data || error.message
    );
    
    if (error.response && error.response.status === 401) {
      // Token过期或无效
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 认证相关API
export const authAPI = {
  login: async (username, password) => {
    try {
      console.log('发送登录请求，用户名:', username);
      // 尝试使用JSON格式
      const response = await api.post('/api/login', { username, password });
      console.log('登录响应:', response.data);
      return response;
    } catch (error) {
      console.error('登录失败:', error.response ? error.response.data : error.message);
      throw error;
    }
  },
};

// 文件相关API
export const fileAPI = {
  // 上传文件
  uploadFile: (file, path = '') => {
    console.log('API - 准备上传文件:', file.name, '路径:', path);
    const formData = new FormData();
    formData.append('file', file);
    if (path) {
      console.log('API - 添加路径:', path);
      formData.append('path', path);
    }
    
    // 检查formData内容
    console.log('API - FormData内容检查:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + (pair[0] === 'file' ? pair[1].name : pair[1]));
    }
    
    return api.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log('API - 上传进度:', percentCompleted + '%');
      }
    });
  },

  // 下载文件
  downloadFile: (filename) => {
    return api.get(`/api/download/${encodeURIComponent(filename)}`, {
      responseType: 'blob',
    });
  },

  // 删除文件
  deleteFile: (filename, path = '') => {
    const params = path ? { path } : {};
    return api.delete(`/api/delete/${encodeURIComponent(filename)}`, { params });
  },

  // 列出文件
  listFiles: (path = '') => {
    return api.get('/api/list', { params: { path } });
  },

  // 创建目录
  createDirectory: (name, path = '') => {
    console.log('API调用 - 创建目录:', { name, path });
    return api.post('/api/mkdir', { name, path });
  },

  // 删除目录
  deleteDirectory: (dirname, path = '') => {
    const params = path ? { path } : {};
    return api.delete(`/api/rmdir/${encodeURIComponent(dirname)}`, { params });
  },
};

export default api;
