/**
 * Simulated Crash-Game Backend
 * ----------------------------
 * Mitt event bus protocol (all rounds are global / identical for every player):
 *
 *   OUTGOING (emitted by the backend):
 *     "game:phase"          { phase: "betting" | "running" | "crashed", duration?, crashPoint?, multiplier? }
 *     "game:timer"          { remaining: number }                // seconds left in betting phase
 *     "game:multiplier"     { value: number }                    // current live multiplier
 *     "game:bet:confirmed"  { id, amount, autoCashoutAt, forNextRound }
 *     "game:bet:cancelled"  { id }
 *     "game:bet:won"        { id, amount, multiplier }           // payout (amount * multiplier)
 *     "game:bet:lost"       { id, amount }
 *     "game:history"        number[]                             // last crash points (first = newest)
 *
 *   Back-compat legacy events (kept so BetBox.vue keeps working):
 *     "started"             -> betting phase begins
 *     "progress"            -> running phase begins
 *     "crash"               { multiplier }
 *     "cashout-success"     { data: { amount, multiplier, id } }
 *     "sceneComplete"       -> round fully finished, ready for next
 *
 *   INCOMING (listened to by the backend):
 *     "game:placeBet"       { id, amount, autoCashoutAt }
 *     "game:cancelBet"      { id }
 *     "game:cashout"        { id }
 */

import emitter from "./eventEmitter";
import store from "./store";

type Phase = "betting" | "running" | "crashed";

interface Bet {
  id: number;
  amount: number;
  autoCashoutAt: number | null;
  cashedOut: boolean;
  cashOutMultiplier?: number;
}

const config = {
  bettingDuration: 5,     // seconds of betting window
  crashDelay: 2,          // seconds of "crashed" state before the next betting phase
  growthRate: 0.09,       // exponential growth rate of the multiplier (per second)
  tickMs: 50,             // update frequency
  /** If not null forces the next crash to this multiplier (useful via lil-gui). */
  forcedCrashPoint: 10 as number | null,
  minCrash: 1.00,
  maxCrash: 50,
  /** When false, bets placed outside the betting window are rejected instead of queued. */
  allowNextRound: true,
};

let phase: Phase = "betting";
let crashPoint = 1;
let phaseStart = 0;
let currentMultiplier = 1;
let timerHandle: number | null = null;
const bets = new Map<number, Bet>();
const pendingBets = new Map<number, Bet>();
const history: number[] = [];

function randomCrash(): number {
  if (config.forcedCrashPoint != null && config.forcedCrashPoint > 0) {
    return Math.max(config.minCrash, Math.min(config.maxCrash, config.forcedCrashPoint));
  }
  // 4% instant bust
  if (Math.random() < 0.04) return 1.00;
  // Heavy-tailed house-edge distribution: 0.99 / (1 - u)
  const u = Math.random() * 0.97;
  const val = 0.99 / (1 - u);
  return Math.max(config.minCrash, Math.min(config.maxCrash, val));
}

function startBetting() {
  phase = "betting";
  phaseStart = performance.now();
  currentMultiplier = 1;
  bets.clear();

  // Roll pending bets (placed during running/crashed) into the new round.
  pendingBets.forEach((bet, id) => {
    bet.cashedOut = false;
    bets.set(id, bet);
    emitter.emit("game:bet:confirmed", {
      id: bet.id,
      amount: bet.amount,
      autoCashoutAt: bet.autoCashoutAt,
      forNextRound: false,
    });
  });
  pendingBets.clear();

  crashPoint = randomCrash();

  emitter.emit("game:phase", { phase: "betting", duration: config.bettingDuration });
  emitter.emit("game:multiplier", { value: 1 });
  emitter.emit("game:timer", { remaining: config.bettingDuration });
  emitter.emit("anim:riscaldamento");
  // Note: we deliberately don't emit "started" here. The legacy BetBox template
  // treats isStarted as "betting window closed" (no PLACE BET allowed), which
  // is the opposite of what we want during the betting phase.
  emitter.emit("sceneComplete");
}

function startRunning() {
  phase = "running";
  phaseStart = performance.now();
  currentMultiplier = 1;

  emitter.emit("game:phase", { phase: "running", crashPoint });
  emitter.emit("anim:palleggio1");
  emitter.emit("progress");
}

function endRound() {
  phase = "crashed";
  currentMultiplier = crashPoint;

  emitter.emit("game:multiplier", { value: crashPoint });
  emitter.emit("game:phase", { phase: "crashed", multiplier: crashPoint });
  emitter.emit("anim:final");
  emitter.emit("crash", { multiplier: crashPoint });

  history.unshift(parseFloat(crashPoint.toFixed(2)));
  if (history.length > 50) history.pop();
  emitter.emit("game:history", [...history]);

  // Remaining bets lost.
  bets.forEach((bet) => {
    if (!bet.cashedOut) {
      emitter.emit("game:bet:lost", { id: bet.id, amount: bet.amount });
    }
  });

  window.setTimeout(() => {
    // startBetting() itself emits "sceneComplete" so the UI resets cleanly.
    startBetting();
  }, config.crashDelay * 1000);
}

function doCashout(id: number) {
  const bet = bets.get(id);
  if (!bet || bet.cashedOut || phase !== "running") return;
  bet.cashedOut = true;
  bet.cashOutMultiplier = currentMultiplier;
  const payout = bet.amount * currentMultiplier;

  // Credit balance centrally.
  try { store.dispatch("increaseBalance", payout); } catch {}

  emitter.emit("game:bet:won", { id, amount: payout, multiplier: currentMultiplier });
  emitter.emit("cashout-success", { data: { amount: payout, multiplier: currentMultiplier, id } });
}

function tick() {
  const now = performance.now();
  const elapsed = (now - phaseStart) / 1000;

  if (phase === "betting") {
    const remaining = Math.max(0, config.bettingDuration - elapsed);
    emitter.emit("game:timer", { remaining });
    if (remaining <= 0) startRunning();
    return;
  }

  if (phase === "running") {
    currentMultiplier = Math.exp(elapsed * config.growthRate);

    // Auto-cashout check (must happen before a possible crash at the same tick).
    bets.forEach((bet) => {
      if (!bet.cashedOut && bet.autoCashoutAt != null && currentMultiplier >= bet.autoCashoutAt) {
        const target = bet.autoCashoutAt;
        const savedMul = currentMultiplier;
        if (target <= crashPoint) {
          currentMultiplier = target;
          doCashout(bet.id);
          currentMultiplier = savedMul;
        }
      }
    });

    if (currentMultiplier >= crashPoint) {
      endRound();
    } else {
      emitter.emit("game:multiplier", { value: currentMultiplier });
    }
  }
}

// ---- Public API ----

export function placeBet({
  id,
  amount,
  autoCashoutAt,
}: {
  id: number;
  amount: number;
  autoCashoutAt: number | null;
}) {
  // Balance check — the backend is the single source of truth.
  try {
    if (store.state.balance < amount) {
      emitter.emit("game:bet:rejected", { id, reason: "balance" });
      return;
    }
  } catch {}

  // Grace window: accept late clicks that happened within 250ms after the
  // betting phase ended as part of the current round (the user saw the bet
  // timer still running when they clicked).
  const nowElapsed = (performance.now() - phaseStart) / 1000;
  const lateGrace = phase === "running" && nowElapsed < 0.25;

  const bet: Bet = { id, amount, autoCashoutAt, cashedOut: false };
  const forNextRound = phase !== "betting" && !lateGrace;

  if (forNextRound && !config.allowNextRound) {
    emitter.emit("game:bet:rejected", { id, reason: "nextRoundDisabled" });
    return;
  }

  // Deduct from balance now (refund happens on cancel).
  try { store.dispatch("decreaseBalance", amount); } catch {}

  if (forNextRound) {
    pendingBets.set(id, bet);
  } else {
    bets.set(id, bet);
  }
  emitter.emit("game:bet:confirmed", { id, amount, autoCashoutAt, forNextRound });
}

export function cancelBet(id: number): boolean {
  let bet: Bet | undefined;
  let wasPending = false;
  if (phase === "betting" && bets.has(id)) {
    bet = bets.get(id);
    bets.delete(id);
  } else if (pendingBets.has(id)) {
    bet = pendingBets.get(id);
    pendingBets.delete(id);
    wasPending = true;
  } else {
    return false;
  }
  if (bet) {
    try { store.dispatch("increaseBalance", bet.amount); } catch {}
  }
  emitter.emit("game:bet:cancelled", { id, wasPending });
  return true;
}

export function cashOut(id: number) {
  doCashout(id);
}

export function getState() {
  const betsArr: Bet[] = [];
  bets.forEach((b) => betsArr.push(b));
  const pendingArr: Bet[] = [];
  pendingBets.forEach((b) => pendingArr.push(b));
  return {
    phase,
    currentMultiplier,
    crashPoint,
    bets: betsArr,
    pendingBets: pendingArr,
    history: [...history],
  };
}

export function getConfig() {
  return config;
}

export function startGame() {
  if (timerHandle != null) return;
  startBetting();
  timerHandle = window.setInterval(tick, config.tickMs);
}

export function stopGame() {
  if (timerHandle != null) {
    window.clearInterval(timerHandle);
    timerHandle = null;
  }
}

/** `?backend=off` (or `?backend=0`) boots the app with the simulated backend detached. */
export function isEnabledByUrl(): boolean {
  const v = new URLSearchParams(window.location.search).get("backend");
  return v !== "off" && v !== "0" && v !== "false";
}

export function isRunning(): boolean {
  return timerHandle != null;
}

/**
 * Detaching the backend parks the scene in the "running" phase so the character
 * animations keep looping and no round overlay is shown.
 */
export function setEnabled(on: boolean) {
  if (on) {
    startGame();
    return;
  }
  stopGame();
  phase = "running";
  currentMultiplier = 1;
  bets.clear();
  pendingBets.clear();
  emitter.emit("game:phase", { phase: "running" });
  emitter.emit("game:multiplier", { value: 1 });
  emitter.emit("anim:palleggio1");
}

// Mitt listeners for UI-driven actions.
emitter.on("game:placeBet", (p: any) => placeBet(p));
emitter.on("game:cancelBet", (p: any) => cancelBet(p.id));
emitter.on("game:cashout", (p: any) => cashOut(p.id));

export default {
  startGame,
  stopGame,
  setEnabled,
  isRunning,
  isEnabledByUrl,
  placeBet,
  cancelBet,
  cashOut,
  getState,
  getConfig,
};
