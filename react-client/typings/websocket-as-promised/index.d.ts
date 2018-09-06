declare module 'websocket-as-promised' {
  class FakeWebSocket {
    constructor(url: string);
  }

  interface Options {
    createWebSocket?: (url: string) => FakeWebSocket;
    packMessage?: (data: any) => String | ArrayBuffer | Blob;
    unpackMessage?: (msg: String | ArrayBuffer | Blob) => any;
    attachRequestId?: (data: any, requestId: String | Number) => any ;
    extractRequestId?: (data: any) => String | Number | undefined;
    timeout?: number;
    connectionTimeout?: number;
  }
  
  export default class WebSocketAsPromised {
    ws: FakeWebSocket;
    isOpening: boolean;
    isOpened: boolean;
    isClosing: boolean;
    isClosed: boolean;

    onOpen: any;
    onSend: any;
    onMessage: any;
    onUnpackedMessage: any;
    onResponse: any;
    onClose: any;
    onError: any;

    constructor(url: string, options?: Options)

    open(): Promise<any>;
    sendRequest(data: any, options?: object): Promise<any>;
    sendPacked(data: any): void;
    send(data: any): void;
    close(): Promise<any>;
  }
}