import MyWebSocket from "../components/WebSockets/Services"

export default class WebSocketPlugin extends Phaser.Plugins.BasePlugin{
    webSocket: MyWebSocket;
    
    constructor(pluginManager: Phaser.Plugins.PluginManager){
        super(pluginManager)

        this.webSocket = new MyWebSocket()
        this.webSocket.connect();
    }

    getGameData(){
        return this.webSocket.gameData;
    }
}