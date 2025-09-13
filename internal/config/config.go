package config

import (

	"gopkg.in/yaml.v3"
)

type Config struct {
	DB ConfigDB `yaml:"db"`
}

type ConfigDB struct {
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
	User     string `yaml:"user"`
	Password string `yaml:"password"`
	Database string `yaml:"database"`
}

func New(data []byte) (*Config, error) {

	cfg := &Config{}
	err := yaml.Unmarshal(data, cfg)
	if err != nil {
		return nil, err
	}
	return cfg, nil
}
