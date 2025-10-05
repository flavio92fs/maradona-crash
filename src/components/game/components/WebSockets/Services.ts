import emitter from "@/eventEmitter";

let self: any;
export default class MyWebSocket {
  private websocket!: WebSocket;
  gameData!: any;

  constructor() {
    self = this;
  }

  connect() {
    this.websocket = new WebSocket("wss://gs.eldorado-gaming.it:2083/");
    this.websocket.onopen = this.onOpen;
    this.websocket.onmessage = this.onMessage;
    this.websocket.onclose = this.onClose;
    this.websocket.onerror = this.onError;
  }

  send(message: string) {
    if (this.websocket.readyState != this.websocket.OPEN) return;
    this.websocket.send(message);
  }

  onError(e) {}

  onOpen() {
    let url = window.location.search;
    let urlParams = new URLSearchParams(url);
    let gskParam = urlParams.get("gsk");
    let gameName = "duckhunt";
    this.send(
      JSON.stringify({
        data: { key: gskParam, game: gameName },
        type: "game.authentication",
      })
    );
  }

  pingPong() {
    self.send(JSON.stringify({ type: "game.ping" }));
  }

  onMessage(message: MessageEvent<any>) {
    let json = JSON.parse(message.data);
    this.gameData = json;

    switch (json.type) {
      case "game.play": {
        switch (json.state) {
          case "starting": {
            emitter.emit("starting", { gameData: this.gameData });
            emitter.emit("startingPhaser", { gameData: this.gameData });
            break;
          }
          case "started": {
            emitter.emit("started");
            emitter.emit("startedPhaser");
            break;
          }
          case "progress": {
            emitter.emit("progress", { gameData: this.gameData });
            emitter.emit("progressPhaser", { gameData: this.gameData });
            break;
          }
          case "crash": {
            this.send(JSON.stringify({ type: "game.transactions-history" }));
            emitter.emit("crash", json);
            emitter.emit("crashPhaser");
            break;
          }
        }
        break;
      }

      case "game.transactions-history": {
        emitter.emit("transactions-history", json);
        break;
      }

      case "game.disconnect": {
        // errore authentication
        break;
      }
      case "game.authentication": {
        emitter.emit("authentication", json);
        this.send(
          JSON.stringify({
            type: "game.history",
          })
        );
        this.send(JSON.stringify({ type: "game.transactions-history" }));
        break;
      }
      case "game.bets": {
        emitter.emit("bets", json);
        break;
      }
      case "game.history": {
        emitter.emit("history", json);
        break;
      }
      case "game.leaderboard": {
        emitter.emit("leaderboard", json);
        break;
      }

      case "game.pong": {
        emitter.emit("custom");
        break;
      }
      case "game.bet-response": {
        if (json.data.status == "success") {
          emitter.emit("success", json);
        }
        if (json.data.status == "rejected") {
          emitter.emit("rejected");
        }
        break;
      }
      case "game.cashout-response": {
        if (json.data.status == "success") {
          this.send(JSON.stringify({ type: "game.transactions-history" }));
          emitter.emit("cashout-success", json);
        }
        if (json.data.status == "rejected") {
          emitter.emit("cashout-rejected");
        }
        break;
      }
    }

    // console.log(json);

    // console.log(
    //   "Received message from server:" + JSON.stringify(this.gameData)
    // );
  }

  onClose(e) {
    console.log("disconnected");
    emitter.emit("disconnection");
  }

  getSlotData() {
    //gsk: gskParam, game: gameName, action:"auth"
    return this.gameData;
  }
}
