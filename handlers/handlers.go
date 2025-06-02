package handlers

import (
	"file-server/config"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// validatePath 检查路径是否在允许的范围内
func validatePath(basePath string, paths ...string) (string, bool) {
	// 将所有路径合并
	fullPath := filepath.Join(append([]string{basePath}, paths...)...)

	// 规范化路径
	fullPath = filepath.Clean(fullPath)

	// 检查最终路径是否在 basePath 内
	rel, err := filepath.Rel(basePath, fullPath)
	if err != nil {
		return "", false
	}

	// 检查相对路径是否包含 ..
	if strings.Contains(rel, "..") {
		return "", false
	}

	// 确保路径确实以 basePath 开头
	if !strings.HasPrefix(fullPath, basePath) {
		return "", false
	}

	return fullPath, true
}

// 登录处理
func Login(c *gin.Context) {
	// 打印请求头
	c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
	c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
	c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET")

	log.Println("收到登录请求, 内容类型:", c.ContentType())

	// 尝试从JSON中读取
	var loginData struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	// 先尝试绑定JSON
	if err := c.ShouldBindJSON(&loginData); err != nil {
		log.Println("JSON绑定失败:", err)
		// 如果JSON绑定失败，尝试从表单获取
		username := c.PostForm("username")
		password := c.PostForm("password")
		log.Println("表单数据:", username, password)

		if username == "" || password == "" {
			log.Println("缺少凭证")
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing credentials"})
			return
		}

		loginData.Username = username
		loginData.Password = password
	}

	log.Printf("登录尝试: 用户名=%s, 密码=%s\n", loginData.Username, loginData.Password)

	if loginData.Username != config.AppConfig.AdminUsername || loginData.Password != config.AppConfig.AdminPassword {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"username": loginData.Username,
		"exp":      time.Now().Add(time.Hour * 24).Unix(),
	})

	tokenString, err := token.SignedString([]byte(config.AppConfig.JWTSecret))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": tokenString})
}

// 上传文件
func UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	// 获取并验证路径
	path := c.DefaultPostForm("path", "")
	validatedPath, ok := validatePath(config.AppConfig.StoragePath, path)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid path"})
		return
	}

	// 确保目录存在
	if err := os.MkdirAll(validatedPath, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create directory"})
		return
	}

	// 验证文件名和完整路径
	fullPath, ok := validatePath(config.AppConfig.StoragePath, path, file.Filename)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid filename"})
		return
	}

	if err := c.SaveUploadedFile(file, fullPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not save file"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "File uploaded successfully"})
}

// 下载文件
func DownloadFile(c *gin.Context) {
	filename := c.Param("filename")
	path := c.DefaultQuery("path", "")

	// 验证完整路径
	fullPath, ok := validatePath(config.AppConfig.StoragePath, path, filename)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid path or filename"})
		return
	}

	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
		return
	}

	c.File(fullPath)
}

// 删除文件
func DeleteFile(c *gin.Context) {
	filename := c.Param("filename")
	path := c.DefaultQuery("path", "")
	fullPath := filepath.Join(config.AppConfig.StoragePath, path, filename)

	if err := os.Remove(fullPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not delete file"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "File deleted successfully"})
}

// 列出文件
func ListFiles(c *gin.Context) {
	path := c.DefaultQuery("path", "")
	fullPath := filepath.Join(config.AppConfig.StoragePath, path)

	files, err := os.ReadDir(fullPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not read directory"})
		return
	}

	var fileList []map[string]interface{}
	var dirList []map[string]interface{}

	for _, file := range files {
		info, err := file.Info()
		if err != nil {
			continue
		}

		fileData := map[string]interface{}{
			"name":    file.Name(),
			"size":    info.Size(),
			"modTime": info.ModTime(),
		}

		if file.IsDir() {
			dirList = append(dirList, fileData)
		} else {
			fileList = append(fileList, fileData)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"directories": dirList,
		"files":       fileList,
	})
}

// 创建目录
func CreateDirectory(c *gin.Context) {
	var data struct {
		Name string `json:"name"`
		Path string `json:"path"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		// 如果JSON绑定失败，尝试从表单获取
		path := c.PostForm("path")
		name := c.PostForm("name")

		if path == "" || name == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Path and name are required", "details": err.Error()})
			return
		}

		data.Path = path
		data.Name = name
	}

	// 构建完整的目录路径
	dirPath := data.Path
	if dirPath != "" && data.Name != "" {
		dirPath = filepath.Join(dirPath, data.Name)
	} else if data.Name != "" {
		dirPath = data.Name
	}

	fullPath := filepath.Join(config.AppConfig.StoragePath, dirPath)
	if err := os.MkdirAll(fullPath, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create directory", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Directory created successfully"})
}

// 删除目录
func DeleteDirectory(c *gin.Context) {
	dirName := c.Param("dirname")
	path := c.DefaultQuery("path", "")
	fullPath := filepath.Join(config.AppConfig.StoragePath, path, dirName)

	// 检查是否是目录
	info, err := os.Stat(fullPath)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Directory not found"})
		return
	}

	if !info.IsDir() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Not a directory"})
		return
	}

	// 删除目录及其所有内容
	if err := os.RemoveAll(fullPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not delete directory"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Directory deleted successfully"})
}
