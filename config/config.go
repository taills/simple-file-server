package config

import (
	"encoding/json"
	"fmt"
	"os"
)

type Config struct {
	JWTSecret     string `json:"jwt_secret"`
	StoragePath   string `json:"storage_path"`
	AdminUsername string `json:"admin_username"`
	AdminPassword string `json:"admin_password"`
	ListenAddr    string `json:"listen_addr"`
}

var AppConfig = Config{
	JWTSecret:     "your-secret-key", // 在生产环境中应该使用环境变量
	StoragePath:   "./uploads",
	AdminUsername: "admin",
	AdminPassword: "admin123", // 在生产环境中应该使用更强的密码
	ListenAddr:    ":8080",    // 默认监听端口
}

// LoadConfig 从指定的 JSON 文件中加载配置
func LoadConfig(configPath string) error {
	data, err := os.ReadFile(configPath)
	if err != nil {
		return fmt.Errorf("读取配置文件失败: %v", err)
	}

	if err := json.Unmarshal(data, &AppConfig); err != nil {
		return fmt.Errorf("解析配置文件失败: %v", err)
	}

	return nil
}
