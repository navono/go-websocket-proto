import * as React from 'react';
import './App.css';
import logo from './logo.svg';
import WebSocketAsPromised from 'websocket-as-promised';
import { Message } from '../proto/message_pb';

class App extends React.Component {
  private conn: WebSocketAsPromised;

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

  private packData = (data: any) => {
    const msg = new Message();
    const person = new Message.Person();
    person.setId(1);
    person.setName("ping");
    msg.setId(data.id);
    msg.setAuthor(person);
    msg.setText(data.msg);

    const buff = msg.serializeBinary();
    return buff.buffer;
  };

  private unpackData = (data: any) => {
    return data;
  };

  private handleMessage =  (cb: any) => async (res: any) => {
    if (cb) {
      const buf = await this.blobToBuffer(res);
      const msg = Message.deserializeBinary(buf as Buffer);
      cb(msg);
    }
  };

  private handleConnect = async (e: any) => {
      this.conn = new WebSocketAsPromised("ws://localhost:9999/echo", {
        packMessage: this.packData,
        unpackMessage: this.unpackData,
     });

      this.conn.onMessage.addListener(this.handleMessage((res: Message) => console.log(res.getText())));

      await this.conn.open();

      const data = "This message come from react";
      this.conn.sendPacked({ msg: data });
  };
  
  private blobToBuffer = (blob: Blob) => {
    if (typeof Blob === 'undefined' || !(blob instanceof Blob)) {
      throw new Error('first argument must be a Blob')
    }

    return new Promise((resolve: any, reject: any) => {
      const reader = new FileReader()
  
      function onLoadEnd (e: any) {
        reader.removeEventListener('loadend', onLoadEnd, false)
        if (e.error) { reject(e.error) }
        else {
          resolve(Buffer.from(reader.result as string))
        }
      }
    
      reader.addEventListener('loadend', onLoadEnd, false)
      reader.readAsArrayBuffer(blob)
    }).then(
      buf => buf
    );
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
