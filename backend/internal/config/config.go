package config

import (
	"os"
)


type Postgres struct {
	Host     string 
	Port     string
	User     string 
	Password string
	Database string 
}

func LoadDotEnv() *Postgres {
	

	return &Postgres{
			Host:     getEnv("POSTGRES_HOST", "localhost"),
			Port:     getEnv("POSTGRES_PORT", "5432"),
			User:     getEnv("POSTGRES_USER", "admin"),
			Password: getEnv("POSTGRES_PASSWORD", "admin"),
			Database: getEnv("POSTGRES_DBNAME", "restaurant_db"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
