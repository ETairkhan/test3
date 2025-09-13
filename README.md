# README

## How to run?
### Clone repository
```bash
    git clone git@github.com:barcek2281/todolist.git
    cd todolist
```

### Docker should run Postgres

```bash
docker-compose up --build -d
```
Это запустить докер в фоновом режиме, а порт постргесс будет 5433

### Copy config file

Linux, Mingw64
```bash
cp config.example.yaml config.yaml
```

### Running App

```bash
wails dev
```

## About

This is the official Wails Vanilla template.

You can configure the project by editing `wails.json`. More information about the project settings can be found
here: https://wails.io/docs/reference/project-config

## Live Development

To run in live development mode, run `wails dev` in the project directory. This will run a Vite development
server that will provide very fast hot reload of your frontend changes. If you want to develop in a browser
and have access to your Go methods, there is also a dev server that runs on http://localhost:34115. Connect
to this in your browser, and you can call your Go code from devtools.

## Building

To build a redistributable, production mode package, use `wails build`.
