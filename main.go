package main

import (
	"file-server/config"
	"file-server/handlers"
	"file-server/middleware"
	"io/fs"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

func main() {
	// 确保上传目录存在
	if err := os.MkdirAll(config.AppConfig.StoragePath, 0755); err != nil {
		log.Fatal(err)
	}

	r := gin.Default()

	// 添加CORS中间件
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// API 路由组 (需要认证)
	api := r.Group("/api")
	{
		// 登录路由 (不需要认证)
		api.POST("/login", handlers.Login)

		// 需要认证的路由
		authenticated := api.Group("/")
		authenticated.Use(middleware.AuthMiddleware())

		// 文件操作
		authenticated.POST("/upload", handlers.UploadFile)
		authenticated.GET("/download/:filename", handlers.DownloadFile)
		authenticated.DELETE("/delete/:filename", handlers.DeleteFile)
		authenticated.GET("/list", handlers.ListFiles)

		// 目录操作
		authenticated.POST("/mkdir", handlers.CreateDirectory)
		authenticated.DELETE("/rmdir/:dirname", handlers.DeleteDirectory)
	}

	// 提供嵌入式静态文件服务
	staticFS, err := fs.Sub(staticFiles, "static")
	if err != nil {
		log.Fatal(err)
	}

	r.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path
		if strings.HasPrefix(path, "/assets/") {
			c.FileFromFS(path, http.FS(staticFS))
			return
		}

		// 对于所有其他路径，返回 index.html
		data, err := fs.ReadFile(staticFS, "index.html")
		if err != nil {
			c.String(http.StatusNotFound, "File not found")
			return
		}
		c.Data(http.StatusOK, "text/html", data)
	})

	r.Run(":8090")
}
