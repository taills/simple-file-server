import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fileAPI } from '../services/api';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Snackbar,
  Breadcrumbs,
  Link,
  CircularProgress,
} from '@mui/material';
import {
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  Delete as DeleteIcon,
  CreateNewFolder as CreateNewFolderIcon,
  CloudUpload as UploadIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

function FileExplorer() {
  const [files, setFiles] = useState([]);
  const [directories, setDirectories] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [newDirName, setNewDirName] = useState('');
  const [isCreateDirDialogOpen, setIsCreateDirDialogOpen] = useState(false);
  const [pathHistory, setPathHistory] = useState([{ name: '根目录', path: '' }]);
  const [isUploading, setIsUploading] = useState(false); // 防止重复上传
  const fileInputRef = useRef(null);

  const { logout } = useAuth();
  const navigate = useNavigate();

  // 加载文件和目录
  const loadFilesAndDirectories = async () => {
    setIsLoading(true);
    try {
      const response = await fileAPI.listFiles(currentPath);
      setDirectories(response.data.directories || []);
      setFiles(response.data.files || []);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        logout();
        navigate('/login');
      } else {
        setError('加载文件失败：' + (err.response?.data?.message || '未知错误'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 当路径变化时重新加载
  useEffect(() => {
    loadFilesAndDirectories();
  }, [currentPath]);

  // 处理目录点击
  const handleDirectoryClick = (dirName) => {
    const newPath = currentPath ? `${currentPath}/${dirName}` : dirName;
    setCurrentPath(newPath);
    setPathHistory([...pathHistory, { name: dirName, path: newPath }]);
  };

  // 返回上一级目录
  const handleGoBack = () => {
    if (currentPath === '') return;
    
    const pathParts = currentPath.split('/');
    pathParts.pop();
    const newPath = pathParts.join('/');
    setCurrentPath(newPath);
    setPathHistory(pathHistory.slice(0, pathHistory.length - 1));
  };

  // 处理面包屑导航点击
  const handleBreadcrumbClick = (path, index) => {
    setCurrentPath(path);
    setPathHistory(pathHistory.slice(0, index + 1));
  };

  // 处理文件下载
  const handleDownload = async (fileName) => {
    try {
      const fullPath = currentPath ? `${currentPath}/${fileName}` : fileName;
      const response = await fileAPI.downloadFile(fullPath);
      
      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSuccessMessage(`文件 ${fileName} 下载成功`);
    } catch (err) {
      setError('下载文件失败：' + (err.response?.data?.message || '未知错误'));
    }
  };

  // 处理文件删除
  const handleDelete = async (fileName) => {
    try {
      await fileAPI.deleteFile(fileName, currentPath);
      setSuccessMessage(`文件 ${fileName} 已删除`);
      loadFilesAndDirectories();
    } catch (err) {
      setError('删除文件失败：' + (err.response?.data?.message || '未知错误'));
    }
  };

  // 处理目录删除
  const handleDeleteDirectory = async (dirName) => {
    try {
      await fileAPI.deleteDirectory(dirName, currentPath);
      setSuccessMessage(`文件夹 ${dirName} 已删除`);
      loadFilesAndDirectories();
    } catch (err) {
      setError('删除文件夹失败：' + (err.response?.data?.message || '未知错误'));
    }
  };

  // 处理文件上传按钮点击
  const handleUploadButtonClick = useCallback(() => {
    console.log('Upload button clicked, fileInputRef.current:', fileInputRef.current);
    if (fileInputRef.current && !isUploading) {
      fileInputRef.current.click();
    }
  }, [isUploading]);

  // 处理文件上传
  const handleFileUpload = async (event) => {
    console.log('文件选择器变化事件触发');
    
    if (isUploading) {
      console.log('正在上传中，忽略此次请求');
      return;
    }
    
    const selectedFile = event.target.files?.[0];
    
    if (!selectedFile) {
      console.log('没有选择文件或文件选择被取消');
      // 清空文件输入的值，以便下次能正确触发 onChange
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
      return;
    }
    
    console.log('已选择文件:', selectedFile.name, '大小:', selectedFile.size, 'bytes', '类型:', selectedFile.type);
    console.log('准备上传文件到路径:', currentPath || '根目录');
    
    setIsLoading(true); // 显示加载指示器
    setIsUploading(true); // 设置上传状态

    try {
      console.log('开始调用API上传文件...');
      const response = await fileAPI.uploadFile(selectedFile, currentPath);
      console.log('上传成功，服务器响应:', response.data);
      setSuccessMessage(`文件 ${selectedFile.name} 上传成功`);
      loadFilesAndDirectories(); // 刷新文件列表
    } catch (err) {
      console.error('上传错误详情:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || '未知错误';
      console.error('错误消息:', errorMessage);
      setError('上传文件失败：' + errorMessage);
    } finally {
      console.log('上传处理完成，重置加载状态');
      setIsLoading(false); // 确保无论如何都会停止加载指示器
      setIsUploading(false); // 重置上传状态
      // 清空文件输入的值，以便下次能正确触发 onChange
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    }
  };

  // 创建新目录
  const handleCreateDirectory = async () => {
    if (!newDirName) {
      setError('请输入目录名');
      return;
    }

    console.log(`准备创建目录: 名称=${newDirName}, 路径=${currentPath}`);
    setIsLoading(true); // 显示加载指示器
    
    try {
      const response = await fileAPI.createDirectory(newDirName, currentPath);
      console.log('创建目录成功:', response.data);
      setSuccessMessage(`目录 ${newDirName} 创建成功`);
      setIsCreateDirDialogOpen(false);
      setNewDirName('');
      loadFilesAndDirectories();
    } catch (err) {
      console.error('创建目录错误:', err);
      const errorDetail = err.response?.data?.details 
        ? ` (${err.response.data.details})`
        : '';
      setError('创建目录失败：' + (err.response?.data?.message || err.message || '未知错误') + errorDetail);
      setIsLoading(false); // 出错时停止加载指示器
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ padding: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1">
              文件浏览器
            </Typography>
            <Button variant="outlined" color="error" onClick={logout}>
              退出登录
            </Button>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* 面包屑导航 */}
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            {pathHistory.map((item, index) => (
              <Link
                key={index}
                color={index === pathHistory.length - 1 ? 'text.primary' : 'inherit'}
                component="button"
                variant="body1"
                onClick={() => handleBreadcrumbClick(item.path, index)}
                sx={{ textDecoration: 'none' }}
              >
                {item.name}
              </Link>
            ))}
          </Breadcrumbs>

          {/* 按钮组 */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {currentPath && (
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleGoBack}
              >
                返回上级
              </Button>
            )}
            {/* 修改上传按钮 */}
            <Button
              variant="contained"
              color="primary"
              startIcon={<UploadIcon />}
              onClick={handleUploadButtonClick}
              disabled={isUploading}
            >
              上传文件
            </Button>
            <input
              id="file-upload"
              type="file"
              accept="*/*"
              ref={fileInputRef} // <--- 关联 ref
              style={{ 
                display: 'none' // 使用 display: 'none' 而不是其他隐藏方法
              }}
              onChange={handleFileUpload}
            />
            <Button
              variant="contained"
              color="secondary"
              startIcon={<CreateNewFolderIcon />}
              onClick={() => setIsCreateDirDialogOpen(true)}
            >
              新建文件夹
            </Button>
            <Button
              variant="outlined"
              onClick={loadFilesAndDirectories}
            >
              刷新
            </Button>
          </Box>

          {/* 错误提示 */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* 内容区域 */}
          <Paper variant="outlined" sx={{ p: 2, minHeight: '300px' }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : directories.length === 0 && files.length === 0 ? (
              <Typography variant="body1" align="center" sx={{ py: 5, color: 'text.secondary' }}>
                此文件夹为空
              </Typography>
            ) : (
              <Box>
                {/* 目录列表 */}
                {directories.length > 0 && (
                  <>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      文件夹
                    </Typography>
                    <List>
                      {directories.map((dir) => (
                        <ListItem
                          key={dir.name}
                          component="div"
                          disablePadding
                          secondaryAction={
                            <IconButton
                              edge="end"
                              color="error"
                              onClick={() => handleDeleteDirectory(dir.name)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          }
                          sx={{ pr: 6 }}
                        >
                          <ListItemButton onClick={() => handleDirectoryClick(dir.name)}>
                            <ListItemIcon>
                              <FolderIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText primary={dir.name} />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                    <Divider sx={{ my: 2 }} />
                  </>
                )}

                {/* 文件列表 */}
                {files.length > 0 && (
                  <>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      文件
                    </Typography>
                    <List>
                      {files.map((file) => (
                        <ListItem
                          key={file.name}
                          component="div"
                          disablePadding
                          secondaryAction={
                            <Box>
                              <IconButton
                                edge="end"
                                onClick={() => handleDownload(file.name)}
                              >
                                <UploadIcon sx={{ transform: 'rotate(180deg)' }} />
                              </IconButton>
                              <IconButton
                                edge="end"
                                color="error"
                                onClick={() => handleDelete(file.name)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          }
                          sx={{ pr: 12 }}
                        >
                          <ListItemButton>
                            <ListItemIcon>
                              <FileIcon />
                            </ListItemIcon>
                            <ListItemText primary={file.name} />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </Box>
            )}
          </Paper>
        </Paper>
      </Box>

      {/* 创建目录对话框 */}
      <Dialog open={isCreateDirDialogOpen} onClose={() => setIsCreateDirDialogOpen(false)}>
        <DialogTitle>新建文件夹</DialogTitle>
        <DialogContent>
          <DialogContentText>
            请输入要创建的文件夹名称:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="文件夹名称"
            type="text"
            fullWidth
            variant="outlined"
            value={newDirName}
            onChange={(e) => setNewDirName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDirDialogOpen(false)}>取消</Button>
          <Button onClick={handleCreateDirectory} variant="contained">创建</Button>
        </DialogActions>
      </Dialog>

      {/* 成功消息提示 */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default FileExplorer;
