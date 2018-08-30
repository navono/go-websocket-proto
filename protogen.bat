@echo off

REM set CLIENT=%CD%\react-client\
REM set SERVER=%CD%\server\

REM set CLIENT_OUT=%CLIENT%proto\
REM set SERVER_OUT=%SERVER%proto\
set PROTO_OUT=proto\

REM mkdir %CLIENT_OUT%
REM mkdir %SERVER_OUT%

if "%GOBIN%"=="" (
  if "%GOPATH%"=="" (
    echo "Required env var GOPATH is not set; aborting with error; see the following documentation which can be invoked via the 'go help gopath' command."
    go help gopath
    exit -1
  )

  echo "Optional env var GOBIN is not set; using default derived from GOPATH as: \"$GOPATH/bin\""
  set GOBIN=%GOPATH%\bin
)

REM echo %GOBIN%

echo "Compiling protobuf definitions"
REM protoc ^
REM   -I %CD%\proto ^
REM   --plugin=protoc-gen-ts=%CLIENT%node_modules\.bin\protoc-gen-ts.cmd ^
REM   --plugin=protoc-gen-go=%GOBIN%\protoc-gen-go.exe ^
REM   --js_out=import_style=commonjs,binary:%CLIENT_OUT% ^
REM   --ts_out=service=true:%CLIENT_OUT% ^
REM   --go_out=%SERVER_OUT% ^
REM    message.proto
protoc ^
  -I "E:\tools\protoc\include" ^
  -I %CD%\proto ^
  --plugin=protoc-gen-go=%GOBIN%\protoc-gen-go.exe ^
  --go_out=%PROTO_OUT% ^
   message.proto