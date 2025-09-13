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
