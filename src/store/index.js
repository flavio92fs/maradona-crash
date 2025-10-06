import { createStore } from "vuex";

export default createStore({
  state: {
    balance: 0.0,
    currency: {},
    coins: [],
    player: {},
    chatMessages: [],
    isFullscreen: false,
  },
  mutations: {
    setBalance(state, balance) {
      state.balance = balance;
    },
    setCurrency(state, currency) {
      state.currency = currency;
    },
    setCoins(state, coins) {
      state.coins = coins;
    },
    setPlayer(state, player) {
      state.player = player;
    },
    setFullscreen(state, isFullscreen) {
      state.isFullscreen = isFullscreen;
    },
    setChatMessages(state, chatMessages) {
      state.chatMessages = chatMessages;
    },
    addChatMessage(state, message) {
      state.chatMessages.push(message);
    },
    increaseBalance(state, amount) {
      state.balance += amount;
    },
    decreaseBalance(state, amount) {
      state.balance -= amount;
    },
  },
  actions: {
    setBalance({ commit }, balance) {
      commit("setBalance", balance);
    },
    setCurrency({ commit }, currency) {
      commit("setCurrency", currency);
    },
    setCoins({ commit }, coins) {
      commit("setCoins", coins);
    },
    setPlayer({ commit }, player) {
      commit("setPlayer", player);
    },
    setFullscreen({ commit }, isFullscreen) {
      commit("setFullscreen", isFullscreen);
    },
    setChatMessages({ commit }, chatMessages) {
      commit("setChatMessages", chatMessages);
    },
    addChatMessage({ commit }, chatMessages) {
      commit("addChatMessage", chatMessages);
    },
    increaseBalance({ commit }, balance) {
      commit("increaseBalance", balance);
    },
    decreaseBalance({ commit }, balance) {
      commit("decreaseBalance", balance);
    },
  },
});
