package main

import (
	"flag"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"strings"

	"github.com/golang/protobuf/proto"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"

	"github.com/navono/go-websocket-proto/proto"
)

var addr = flag.String("addr", ":9999", "http service address")

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
} // use default options

var data []byte

func echoHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade:", err)
		return
	}
	defer conn.Close()

	for {
		mt, data, err := conn.ReadMessage()

		recvMsg := message.Message{}
		err = proto.Unmarshal(data, &recvMsg)

		if err != nil {
			log.Println("read:", err)
			break
		}
		log.Printf("recv: %v", recvMsg)

		var b strings.Builder
		fmt.Fprintf(&b, "%s;%s %s", recvMsg.Text, recvMsg.Text, recvMsg.Text)

		respMsg := &message.Message{
			Id:        recvMsg.Id,
			Author:    recvMsg.Author,
			Text:      b.String(),
			StartTime: recvMsg.StartTime,
		}
		respData, _ := proto.Marshal(respMsg)

		err = conn.WriteMessage(mt, respData)
		if err != nil {
			log.Println("write:", err)
			break
		}
	}
}

// func homeHandler(w http.ResponseWriter, r *http.Request) {
// 	homeTemplate.Execute(w, "ws://"+r.Host+"/echo")
// }

func main() {
	flag.Parse()
	log.SetFlags(0)

	r := mux.NewRouter()
	r.HandleFunc("/echo", echoHandler)

	log.Println("server listening on *:9999")
	headersContentType := handlers.AllowedHeaders([]string{"Content-Type", "Access-Control-Allow-Origin"})
	headersContentType = handlers.AllowedOrigins([]string{"*"})
	err := http.ListenAndServe(*addr, handlers.CORS(headersContentType)(r))
	if err != nil {
		log.Fatal(err)
		return
	}
}

var homeTemplate = template.Must(template.New("").Parse(`
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<script>  
window.addEventListener("load", function(evt) {
    var output = document.getElementById("output");
    var input = document.getElementById("input");
    var ws;
    var print = function(message) {
        var d = document.createElement("div");
        d.innerHTML = message;
        output.appendChild(d);
    };
    document.getElementById("open").onclick = function(evt) {
        if (ws) {
            return false;
        }
        ws = new WebSocket("{{.}}");
        ws.onopen = function(evt) {
            print("OPEN");
        }
        ws.onclose = function(evt) {
            print("CLOSE");
            ws = null;
        }
        ws.onmessage = function(evt) {
            print("RESPONSE: " + evt.data);
        }
        ws.onerror = function(evt) {
            print("ERROR: " + evt.data);
        }
        return false;
    };
    document.getElementById("send").onclick = function(evt) {
        if (!ws) {
            return false;
        }
        print("SEND: " + input.value);
        ws.send(input.value);
        return false;
    };
    document.getElementById("close").onclick = function(evt) {
        if (!ws) {
            return false;
        }
        ws.close();
        return false;
    };
});
</script>
</head>
<body>
<table>
<tr><td valign="top" width="50%">
<p>Click "Open" to create a connection to the server, 
"Send" to send a message to the server and "Close" to close the connection. 
You can change the message and send multiple times.
<p>
<form>
<button id="open">Open</button>
<button id="close">Close</button>
<p><input id="input" type="text" value="Hello world!">
<button id="send">Send</button>
</form>
</td><td valign="top" width="50%">
<div id="output"></div>
</td></tr></table>
</body>
</html>
`))
