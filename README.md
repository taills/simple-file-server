# Go-Gin File Server | Go-Gin 文件服务器

[English](#english) | [中文](#中文)

## English

A simple file server implemented with Go-Gin framework, supporting file upload, download, deletion, folder management, and user authentication.

## 中文

一个基于Go-Gin框架实现的简单文件服务器，支持文件上传、下载、删除和文件夹管理，并集成了用户认证功能。

## Features | 功能特点

- User authentication (JWT Token) | 用户认证（JWT Token）
- File upload with directory support | 文件上传（支持指定目录）
- File download | 文件下载
- File deletion | 文件删除
- File listing with details (size, modified time) | 文件列表查看（包含文件大小、修改时间等信息）
- Folder creation and management | 文件夹创建和管理
- cURL support | cURL支持
- Modern React frontend | 现代化的React前端界面

## Project Structure | 项目结构

```
.
├── config/
│   └── config.go       # Configuration file | 配置文件
├── handlers/
│   └── handlers.go     # Request handlers | 请求处理器
├── middleware/
│   └── auth.go        # Authentication middleware | 认证中间件
├── models/            # Data models | 数据模型
├── frontend/         # React frontend application | React前端应用
├── static/           # Static files | 静态文件
├── uploads/          # Upload directory | 上传文件存储目录
├── go.mod           # Go module file | Go模块文件
├── config.json      # Configuration file | 配置文件
└── main.go         # Main program entry | 主程序入口
```

## Quick Start | 快速开始

### English

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/file-server.git
cd file-server
```

2. **Install Dependencies**
```bash
# Install backend dependencies
go mod tidy

# Install frontend dependencies
cd frontend
npm install
cd ..
```

3. **Build the Frontend**
```bash
cd frontend
npm run build
cd ..
```

4. **Start the Server**
```bash
go run main.go
```
The server will start at http://localhost:8080

### 中文

1. **克隆项目**
```bash
git clone https://github.com/yourusername/file-server.git
cd file-server
```

2. **安装依赖**
```bash
# 安装后端依赖
go mod tidy

# 安装前端依赖
cd frontend
npm install
cd ..
```

3. **构建前端**
```bash
cd frontend
npm run build
cd ..
```

4. **运行服务器**
```bash
go run main.go
```
服务器将在 http://localhost:8080 上启动

## Download and Installation | 下载与安装

### English

1. **Download the latest release**
   - Go to the [Releases](https://github.com/yourusername/file-server/releases) page
   - Download the package for your operating system:
     - Linux: `file-server-linux.zip`
     - Windows: `file-server-windows.zip`
     - macOS: `file-server-darwin.zip`

2. **Extract the package**
   - Extract the downloaded `.zip` file using your preferred tool
   ```bash
   # Example for Linux/macOS using unzip
   unzip file-server-linux.zip   # or file-server-darwin.zip
   
   # Windows
   # Use Windows Explorer or any zip tool to extract
   ```

3. **Configure the server**
   - Edit `config.json` to set your:
     - JWT secret key
     - Storage path
     - Admin credentials
     - Listen address

4. **Run the server**
   ```bash
   # Linux/macOS
   ./file-server

   # Windows
   file-server.exe
   ```

### 中文

1. **下载最新版本**
   - 访问 [Releases](https://github.com/yourusername/file-server/releases) 页面
   - 下载对应系统的安装包：
     - Linux: `file-server-linux.tar.gz`
     - Windows: `file-server-windows.zip`
     - macOS: `file-server-darwin.tar.gz`

2. **解压安装包**
   ```bash
   # Linux/macOS
   tar xzf file-server-linux.tar.gz   # 或 file-server-darwin.tar.gz
   
   # Windows
   # 使用解压工具解压 file-server-windows.zip
   ```

3. **配置服务器**
   - 编辑 `config.json` 设置：
     - JWT 密钥
     - 存储路径
     - 管理员账号密码
     - 监听地址

4. **运行服务器**
   ```bash
   # Linux/macOS
   ./file-server

   # Windows
   file-server.exe
   ```

## API Documentation | API 使用说明

### English

### 1. Authentication - Get JWT Token

```bash
curl -X POST http://localhost:8080/login \
  -F "username=admin" \
  -F "password=admin123"
```

### 2. File Operations

#### Upload File
To root directory:
```bash
curl -X POST http://localhost:8080/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/your/file.txt"
```

To specific directory:
```bash
curl -X POST http://localhost:8080/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/your/file.txt" \
  -F "path=subdirectory"
```

#### Download File
From root directory:
```bash
curl -O -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/download/file.txt
```

From specific directory:
```bash
curl -O -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8080/api/download/file.txt?path=subdirectory"
```

#### List Files
List root directory:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/list
```

List specific directory:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8080/api/list?path=subdirectory"
```

#### Delete File
From root directory:
```bash
curl -X DELETE -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/delete/file.txt
```

From specific directory:
```bash
curl -X DELETE -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8080/api/delete/file.txt?path=subdirectory"
```

#### Create Directory
```bash
curl -X POST http://localhost:8080/api/mkdir \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "path=new_directory"
```

### 中文

### 1. 登录获取Token

```bash
curl -X POST http://localhost:8080/login \
  -F "username=admin" \
  -F "password=admin123"
```

### 2. 文件上传

上传到根目录：
```bash
curl -X POST http://localhost:8080/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/your/file.txt"
```

上传到指定目录：
```bash
curl -X POST http://localhost:8080/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/your/file.txt" \
  -F "path=subdirectory"
```

### 3. 文件下载

从根目录下载：
```bash
curl -O -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/download/file.txt
```

从指定目录下载：
```bash
curl -O -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8080/api/download/file.txt?path=subdirectory"
```

### 4. 列出文件

列出根目录文件：
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/list
```

列出指定目录文件：
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8080/api/list?path=subdirectory"
```

### 5. 删除文件

删除根目录文件：
```bash
curl -X DELETE -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/delete/file.txt
```

删除指定目录文件：
```bash
curl -X DELETE -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8080/api/delete/file.txt?path=subdirectory"
```

### 6. 创建目录

```bash
curl -X POST http://localhost:8080/api/mkdir \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "path=new_directory"
```

## Configuration | 配置说明

### English

The configuration file `config.json` contains the following settings:

- `jwt_secret`: JWT signing key for authentication
- `storage_path`: Directory path for file storage
- `admin_username`: Administrator username
- `admin_password`: Administrator password
- `listen_addr`: Server listen address (e.g. ":8080")

### 中文

配置文件 `config.json` 包含以下配置项：

- `jwt_secret`: JWT签名密钥
- `storage_path`: 文件存储路径
- `admin_username`: 管理员用户名
- `admin_password`: 管理员密码
- `listen_addr`: 服务器监听地址（如 ":8080"）

## Security Recommendations | 安全建议

### English

When deploying in a production environment, please consider the following:

1. Change the default JWT secret key
2. Use a strong administrator password
3. Consider using environment variables for sensitive information
4. Recommended additions:
   - File size limits
   - File type verification
   - Access logging
   - File access permission control

### 中文

在生产环境中使用时，请注意以下几点：

1. 修改默认的JWT密钥
2. 使用更强的管理员密码
3. 考虑使用环境变量存储敏感信息
4. 建议添加：
   - 文件大小限制
   - 文件类型检查
   - 访问日志
   - 文件访问权限控制

## Dependencies | 依赖项

### Backend | 后端
- github.com/gin-gonic/gin v1.9.1
- github.com/golang-jwt/jwt/v5 v5.0.0
- golang.org/x/crypto v0.9.0

### Frontend | 前端
- react v18.2.0
- @vitejs/plugin-react v4.2.0
- vite v5.0.0

## License | 许可证

MIT License | MIT 开源许可证

## Contributing | 贡献

Contributions are welcome! Feel free to submit Issues and Pull Requests.

欢迎提交 Issues 和 Pull Requests！
