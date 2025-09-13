package main

import (
	"embed"
	"log"
	"log/slog"
	"os"
	"time"
	"todo-app/internal/config"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

//go:embed config.yaml
var defaultConfig []byte

func main() {
	cnf, err := config.New(defaultConfig)
	if err != nil {
		log.Fatalf("cannot find config file: %v", err)
	}
	jslog := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelDebug,
		ReplaceAttr: func(groups []string, a slog.Attr) slog.Attr {
			// Rename 'msg' to 'message'
			if a.Key == slog.MessageKey {
				return slog.Attr{Key: "message", Value: a.Value}
			}
			// Format time as ISO 8601
			if a.Key == slog.TimeKey {
				if t, ok := a.Value.Any().(time.Time); ok {
					return slog.Attr{Key: "timestamp", Value: slog.StringValue(t.Format(time.RFC3339))}
				}
			}
			return a
		},
	})

	newlog := slog.New(jslog)
	app, err := NewApp(cnf, newlog)
	if err != nil {
		log.Fatalf("cannot create app: %v", err)
	}

	err = wails.Run(&options.App{
		Title:  "todolist",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}