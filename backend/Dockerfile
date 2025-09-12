FROM golang:1.24

WORKDIR /cmd/todo-app

# Download Go modules
COPY go.mod go.sum ./
RUN go mod download

COPY . . 

RUN go build -o app ./cmd/todo-app/main.go

EXPOSE 8080

CMD ["./app"]