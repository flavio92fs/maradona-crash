import emitter from "@/eventEmitter";

let self: any;
export default class ChatWebSocket {
  private websocket!: WebSocket;

  constructor() {
    self = this;
  }

  connect() {
    this.websocket = new WebSocket("wss://gs.eldorado-gaming.it:2087/chat");
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
    let url = window.location.search;
    let urlParams = new URLSearchParams(url);
    let gskParam = urlParams.get("gsk");
    let gameName = "duckhunt";
    this.send(
      JSON.stringify({
        data: { key: gskParam, game: gameName },
        type: "chat.authentication",
      })
    );
  }

  pingPong() {
    self.send(JSON.stringify({ type: "game.ping" }));
  }

  onMessage(message: MessageEvent<any>) {
    let json = JSON.parse(message.data);
    console.log(json);

    switch (json.type) {
      case "chat.messages": {
        emitter.emit("chat-messages", json);
        break;
      }
      case "chat.message": {
        emitter.emit("chat-message", json);
        break;
      }
    }
  }

  sendChatMessage(message: string) {
    this.send(JSON.stringify({ type: "chat.message", message: message }));
  }

  onClose() {}
}
