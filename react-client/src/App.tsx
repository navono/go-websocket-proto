import * as React from 'react';
import './App.css';
import logo from './logo.svg';
import * as WebSocket from 'websocket';
import { Message } from '../proto/message_pb';

class App extends React.Component {
  private conn: WebSocket.w3cwebsocket;

  public render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.tsx</code> and save to reload.
        </p>
        <input type="button" value="connect server" onClick={this.handleConnect} />
        <input type="button" value="send" onClick={this.handleSendMsg} />
      </div>
    );
  }

  private handleConnect = (e: any) => {
      const W3CWebSocket = WebSocket.w3cwebsocket;
      this.conn = new W3CWebSocket("ws://localhost:9999/echo", '', '*');

      this.conn.onopen = () => {
        // tslint:disable-next-line:no-console
        console.log('WebSocket Client Connected');

        const msg = new Message();
        const person = new Message.Person();
        person.setId(1);
        person.setName("ping");
        msg.setId(10);
        msg.setAuthor(person);
        msg.setText("This message come from react");
  
        const data = msg.serializeBinary();
        this.conn.send(data);
      };
      this.conn.onerror = () => {
        // tslint:disable-next-line:no-console
        console.log('Connection Error');
      };
      // tslint:disable-next-line:no-shadowed-variable
      this.conn.onmessage = (e: any) => {
        // tslint:disable-next-line:no-shadowed-variable
        this.blobToBuffer(e.data, (err: Error, buf: Buffer) => {
          if (err !== null) {
            return;
          }

          const msg = Message.deserializeBinary(buf)
          // tslint:disable-next-line:no-console
          console.log("Received: '" + msg.getText() + "'");
        })
     };
  };

  private blobToBuffer = (blob: Blob, cb: any) => {
    if (typeof Blob === 'undefined' || !(blob instanceof Blob)) {
      throw new Error('first argument must be a Blob')
    }
    if (typeof cb !== 'function') {
      throw new Error('second argument must be a function')
    }
  
    const reader = new FileReader()
  
    function onLoadEnd (e: any) {
      reader.removeEventListener('loadend', onLoadEnd, false)
      if (e.error) { cb(e.error) }
      else { cb(null, Buffer.from(reader.result as string)) }
    }
  
    reader.addEventListener('loadend', onLoadEnd, false)
    reader.readAsArrayBuffer(blob)
  }

  private handleSendMsg = (e: any) => {
    if (this.conn) {
      const msg = new Message();
      const person = new Message.Person();
      person.setId(1);
      person.setName("ping");
      msg.setId(10);
      msg.setAuthor(person);
      msg.setText("This message come from react");

      const data = msg.serializeBinary();
      this.conn.send(data);
    }
  };
}

export default App;
