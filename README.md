# Go-Gin 文件服务器

一个基于Go-Gin框架实现的简单文件服务器，支持文件上传、下载、删除和文件夹管理，并集成了用户认证功能。

## 功能特点

- 用户认证（JWT Token）
- 文件上传（支持指定目录）
- 文件下载
- 文件删除
- 文件列表查看（包含文件大小、修改时间等信息）
- 文件夹创建和管理
- cURL支持

## 项目结构

```
.
├── config/
│   └── config.go       # 配置文件
├── handlers/
│   └── handlers.go     # 请求处理器
├── middleware/
│   └── auth.go        # 认证中间件
├── models/            # 数据模型
├── static/           # 静态文件
├── uploads/          # 上传文件存储目录
├── go.mod           # Go模块文件
├── go.sum           # Go模块依赖校验
└── main.go         # 主程序入口
```

## 快速开始

1. **克隆项目**

2. **安装依赖**
```bash
go mod tidy
```

3. **运行服务器**
```bash
go run main.go
```
服务器将在 http://localhost:8080 上启动

## API 使用说明

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

## 配置说明

配置文件位于 `config/config.go`，包含以下配置项：

- JWTSecret: JWT签名密钥
- StoragePath: 文件存储路径
- AdminUsername: 管理员用户名
- AdminPassword: 管理员密码

## 安全建议

在生产环境中使用时，请注意以下几点：

1. 修改默认的JWT密钥
2. 使用更强的管理员密码
3. 考虑使用环境变量存储敏感信息
4. 建议添加：
   - 文件大小限制
   - 文件类型检查
   - 访问日志
   - 文件访问权限控制

## 依赖项

- github.com/gin-gonic/gin v1.9.1
- github.com/golang-jwt/jwt/v5 v5.0.0
- golang.org/x/crypto v0.9.0

## 许可证

MIT

## 贡献

欢迎提交Issues和Pull Requests！
