package main

import (
	"flag"
	"log"
	"net/url"
	"os"
	"os/signal"
	"time"

	"github.com/golang/protobuf/proto"
	ptypes "github.com/golang/protobuf/ptypes"
	"github.com/gorilla/websocket"
	"github.com/navono/go-websocket/proto"
)

var addr = flag.String("addr", "localhost:9999", "http service address")

func main() {
	flag.Parse()
	log.SetFlags(0)

	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)

	u := url.URL{Scheme: "ws", Host: *addr, Path: "/echo"}
	log.Printf("connecting to %s", u.String())

	conn, resp, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		log.Fatal("Error connecting: ", err, resp)
		return
	}
	defer conn.Close()

	done := make(chan struct{})

	go func() {
		defer close(done)
		for {
			_, data, err := conn.ReadMessage()
			if err != nil {
				log.Println("read:", err)
				return
			}

			recvMsg := message.Message{}
			err = proto.Unmarshal(data, &recvMsg)
			if err != nil {
				log.Println("read:", err)
				break
			}

			log.Printf("recv: %v", recvMsg)
		}
	}()

	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-done:
			return
		case t := <-ticker.C:
			timestamp, _ := ptypes.TimestampProto(t)
			msg := &message.Message{
				Id: *proto.Int32(17),
				Author: &message.Message_Person{
					Id:   *proto.Int32(1),
					Name: *proto.String("ping"),
				},
				Text:      *proto.String("Hi, this is message."),
				StartTime: timestamp,
			}

			data, _ := proto.Marshal(msg)

			if conn != nil {
				conn.WriteMessage(websocket.BinaryMessage, data)
			}
		case <-interrupt:
			log.Println("interrupt")

			// Cleanly close the connection by sending a close message and then
			// waiting (with timeout) for the server to close the connection.
			err := conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
			if err != nil {
				log.Println("write close:", err)
				return
			}
			select {
			case <-done:
			case <-time.After(time.Second):
			}
			return
		}
	}
}
