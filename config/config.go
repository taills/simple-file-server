package config

type Config struct {
	JWTSecret     string
	StoragePath   string
	AdminUsername string
	AdminPassword string
}

var AppConfig = Config{
	JWTSecret:     "your-secret-key", // 在生产环境中应该使用环境变量
	StoragePath:   "./uploads",
	AdminUsername: "admin",
	AdminPassword: "admin123", // 在生产环境中应该使用更强的密码
}
