# go-websocket-proto
使用基于`protobuf`的`Websocket`通信。

# server
使用`Go`作为`Websocket`服务端，使用`gorilla`的`websocket`、`mux`和`handler`。

# client
客户端包括基于`Go`的`go-client`和基于`js`的`react-client`；`go-client`使用`gorilla`的`websocket`库，`react-client`使用`websocket`库，

# dev
## protobuf编译
- Go: 使用`protoc-gen-go`插件
- TS: 使用`protoc-gen-ts`插件（包名为：`ts-protoc-gen`）

## protoc
确保安装了`protoc`以及相应的`include`。使用`protogen.bat`脚本编译。
