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


FOR ME:
Tair@DESKTOP-VB7T311 MINGW64 /d/helloworld (main)
$ # Connect to the database with the correct username
docker exec -it db psql -U admin -d todolist
psql (15.14)
Type "help" for help.

todolist=# \dt
             List of relations
 Schema |       Name        | Type  | Owner
--------+-------------------+-------+-------
 public | schema_migrations | table | admin
 public | tasks             | table | admin
(2 rows)

todolist=# SELECT * FROM tasks LIMIT 5;
                  id                  | title | body | done |         created_at         |   status    | priority |      deadline       
--------------------------------------+-------+------+------+----------------------------+-------------+----------+---------------------
 3632df8d-a6db-47e2-b2c1-dde62982b841 | aas   |      | f    | 2025-09-13 09:22:22.832898 | not_started |        2 |
 58739e9f-df5f-4973-86da-e25529de4ff2 | aas   |      | f    | 2025-09-13 09:22:50.539467 | not_started |        2 |
 8f881536-7135-4494-b50f-2b17e311774c | aas   |      | f    | 2025-09-13 09:29:57.666115 | not_started |        2 | 2025-09-15 09:29:00
(3 rows)