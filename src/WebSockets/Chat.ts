import emitter from "@/eventEmitter";

let self: any;
export default class ChatWebSocket {
  private websocket!: WebSocket;

  constructor() {
    self = this;
  }

  connect() {
    this.websocket = new WebSocket("ws://167.86.116.199:8080");
    this.websocket.onopen = this.onOpen;
    this.websocket.onmessage = this.onMessage;
    this.websocket.onclose = this.onClose;
  }

  send(message: string) {
    if (this.websocket.readyState != this.websocket.OPEN) return;
    this.websocket.send(message);
  }

  onOpen() {
    console.log("Connected to Chat");
    // let url = window.location.search;
    // let urlParams = new URLSearchParams(url);
    // let gskParam = urlParams.get("gsk");
    // let gameName = "duckhunt";
    // this.send(
    //   JSON.stringify({
    //     data: { key: gskParam, game: gameName },
    //     type: "chat.authentication",
    //   })
    // );
  }

  pingPong() {
    self.send(JSON.stringify({ type: "game.ping" }));
  }

  onMessage(message: MessageEvent<any>) {
    let json = JSON.parse(message.data);

    switch (json.type) {
      case "history": {
        emitter.emit("chat-messages", json);
        break;
      }
      case "System": {
        emitter.emit("chat-message", json);
        break;
      }
    }
  }

  sendChatMessage(message: object) {
    this.send(JSON.stringify(message));
  }

  onClose() {}
}
