const STORAGE_KEY = "matchzzang-arena-players";
const DEFAULT_CHARACTER = "thrower";
const GACHA_COST = 50;
const APP_SESSION_KEY = "matchzzang-supabase-session";
const FIXED_STEP_MS = 1000 / 60;
const SUPABASE_CONFIG = window.MATCHZZANG_SUPABASE || {};
const SUPABASE_READY = Boolean(
  window.supabase
  && SUPABASE_CONFIG.url
  && SUPABASE_CONFIG.anonKey
  && !SUPABASE_CONFIG.url.includes("YOUR_SUPABASE")
  && !SUPABASE_CONFIG.anonKey.includes("YOUR_SUPABASE")
);
const supabaseClient = SUPABASE_READY
  ? window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)
  : null;

const screens = {
  auth: document.getElementById("authScreen"),
  signup: document.getElementById("signupScreen"),
  lobby: document.getElementById("lobbyScreen"),
  gacha: document.getElementById("gachaScreen"),
  pvp: document.getElementById("pvpScreen"),
  select: document.getElementById("selectScreen"),
  game: document.getElementById("gameScreen")
};

const canvas = document.getElementById("arena");
const ctx = canvas.getContext("2d");

const ui = {
  cards: document.querySelectorAll(".fighter-card"),
  authUsername: document.getElementById("authUsername"),
  authPassword: document.getElementById("authPassword"),
  loginButton: document.getElementById("loginButton"),
  openSignupButton: document.getElementById("openSignupButton"),
  signupButton: document.getElementById("signupButton"),
  signupUsername: document.getElementById("signupUsername"),
  signupPassword: document.getElementById("signupPassword"),
  signupMessage: document.getElementById("signupMessage"),
  backToLoginButton: document.getElementById("backToLoginButton"),
  toggleLoginPassword: document.getElementById("toggleLoginPassword"),
  toggleSignupPassword: document.getElementById("toggleSignupPassword"),
  authMessage: document.getElementById("authMessage"),
  logoutButton: document.getElementById("logoutButton"),
  currentUserName: document.getElementById("currentUserName"),
  currentUserTier: document.getElementById("currentUserTier"),
  currentUserCoins: document.getElementById("currentUserCoins"),
  coinBadge: document.getElementById("coinBadge"),
  globalCoinAmount: document.getElementById("globalCoinAmount"),
  matchOverlay: document.getElementById("matchOverlay"),
  matchOverlayText: document.getElementById("matchOverlayText"),
  playerList: document.getElementById("playerList"),
  lobbyPlayerOne: document.getElementById("lobbyPlayerOne"),
  lobbyPlayerTwo: document.getElementById("lobbyPlayerTwo"),
  lobbyP1Name: document.getElementById("lobbyP1Name"),
  lobbyP2Name: document.getElementById("lobbyP2Name"),
  lobbyP1Coins: document.getElementById("lobbyP1Coins"),
  lobbyP2Coins: document.getElementById("lobbyP2Coins"),
  lobbyMessage: document.getElementById("lobbyMessage"),
  lobbyStartButton: document.getElementById("lobbyStartButton"),
  pvpModeButton: document.getElementById("pvpModeButton"),
  cancelMatchButton: document.getElementById("cancelMatchButton"),
  pveModeButton: document.getElementById("pveModeButton"),
  backFromPvpButton: document.getElementById("backFromPvpButton"),
  modeMessage: document.getElementById("modeMessage"),
  openGachaButton: document.getElementById("openGachaButton"),
  gachaPlayer: document.getElementById("gachaPlayer"),
  gachaButton: document.getElementById("gachaButton"),
  gachaMessage: document.getElementById("gachaMessage"),
  gachaReveal: document.getElementById("gachaReveal"),
  gachaResultName: document.getElementById("gachaResultName"),
  backFromGachaButton: document.getElementById("backFromGachaButton"),
  selectP1Label: document.getElementById("selectP1Label"),
  selectP2Label: document.getElementById("selectP2Label"),
  toBetButton: document.getElementById("toBetButton"),
  timerLeftBar: document.getElementById("timerLeftBar"),
  timerRightBar: document.getElementById("timerRightBar"),
  selectTimerText: document.getElementById("selectTimerText"),
  againButton: document.getElementById("againButton"),
  currentBet: document.getElementById("currentBet"),
  speedButtons: document.querySelectorAll(".speed-button"),
  hudP1Label: document.getElementById("hudP1Label"),
  hudP2Label: document.getElementById("hudP2Label"),
  playerOneName: document.getElementById("playerOneName"),
  playerTwoName: document.getElementById("playerTwoName"),
  playerOneHealthBar: document.getElementById("playerOneHealthBar"),
  playerTwoHealthBar: document.getElementById("playerTwoHealthBar"),
  playerOneHealthText: document.getElementById("playerOneHealthText"),
  playerTwoHealthText: document.getElementById("playerTwoHealthText"),
  normalSkillButton: document.getElementById("normalSkillButton"),
  ultimateSkillButton: document.getElementById("ultimateSkillButton"),
  normalSkillName: document.getElementById("normalSkillName"),
  ultimateSkillName: document.getElementById("ultimateSkillName"),
  normalSkillCooldown: document.getElementById("normalSkillCooldown"),
  ultimateSkillCooldown: document.getElementById("ultimateSkillCooldown"),
  resultOverlay: document.getElementById("resultOverlay"),
  resultTitle: document.getElementById("resultTitle"),
  resultText: document.getElementById("resultText")
};

const characters = {
  thrower: {
    name: "공던지는 색히",
    color: "#3dd6d0",
    accent: "#7bd88f",
    contactDamage: 0,
    canThrow: true,
    canGrab: false
  },
  charger: {
    name: "돌진하는 색히",
    color: "#ef476f",
    accent: "#ffd166",
    contactDamage: 10,
    canThrow: false,
    canGrab: false
  },
  grabber: {
    name: "그랩하는 색히",
    color: "#9b7cff",
    accent: "#f2c14e",
    contactDamage: 0,
    canThrow: false,
    canGrab: true,
    canPoker: false,
    canStealth: false
  },
  poker: {
    name: "포커하는 색히",
    color: "#f7f4eb",
    accent: "#ef476f",
    contactDamage: 0,
    canThrow: false,
    canGrab: false,
    canPoker: true,
    canStealth: false
  },
  stealth: {
    name: "은신하는 색히",
    color: "#5b6cff",
    accent: "#3dd6d0",
    contactDamage: 0,
    canThrow: false,
    canGrab: false,
    canPoker: false,
    canStealth: true
  }
};

const gachaPool = ["charger", "grabber", "poker", "stealth"];

const skillNames = {
  thrower: { normal: "룩 온", ultimate: "스타 스트라이크" },
  charger: { normal: "격노", ultimate: "불가항력" },
  grabber: { normal: "그랩", ultimate: "충격파" },
  poker: { normal: "드로우", ultimate: "힐 다이스" },
  stealth: { normal: "암살", ultimate: "하이퍼 히든" }
};

let currentUser = null;
let appSessionToken = localStorage.getItem(APP_SESSION_KEY) || "";
let currentRoom = null;
let players = [];
let matchPlayers = {
  p1: "",
  p2: ""
};
let selections = {
  p1: DEFAULT_CHARACTER,
  p2: DEFAULT_CHARACTER
};
let game = null;
let animationId = null;
let gameSpeed = 1;
let selectedMode = "";
let roomPollId = null;
let roomRealtimeChannel = null;
let matchSelectionTouched = false;
let matchmakingPollId = null;
let selectedCharacterReady = false;
let selectCountdownId = null;
let selectDeadline = 0;
let matchmakingActive = false;
let matchRandomSeed = 1;
let matchStartTimeoutId = null;
let appliedSkillEvents = new Set();
let pendingSkillUse = false;

function normalizePlayer(user) {
  return {
    id: user.id,
    name: user.username ?? user.name,
    coins: user.coins,
    lp: user.lp ?? 1000,
    ownedCharacters: [...new Set([DEFAULT_CHARACTER, ...(user.ownedCharacters || user.owned_characters || [])])]
  };
}

function tierForLp(lp) {
  if (lp >= 1800) return "다이아";
  if (lp >= 1600) return "플레";
  if (lp >= 1400) return "골드";
  if (lp >= 1200) return "실버";
  return "브론즈";
}

function tierClassForLp(lp) {
  return {
    "다이아": "tier-diamond",
    "플레": "tier-platinum",
    "골드": "tier-gold",
    "실버": "tier-silver",
    "브론즈": "tier-bronze"
  }[tierForLp(lp)];
}

function requireSupabase() {
  if (!supabaseClient) {
    throw new Error("supabase-config.js에 Supabase URL과 anon key를 넣어주세요.");
  }
  return supabaseClient;
}

async function rpc(name, args = {}) {
  const client = requireSupabase();
  const { data, error } = await client.rpc(name, args);
  if (error) throw new Error(error.message);
  return data;
}

function savePlayers() {
  // Supabase stores player data online.
}

function getPlayer(id) {
  return players.find(player => player.id === id);
}

function showScreen(name) {
  Object.values(screens).forEach(screen => screen.classList.remove("is-active"));
  screens[name].classList.add("is-active");
  document.body.classList.toggle("is-authenticated", Boolean(currentUser));
}

function switchLobbyTab(tabName) {
  document.querySelectorAll("[data-lobby-panel]").forEach(panel => {
    panel.classList.toggle("is-active", panel.dataset.lobbyPanel === tabName);
  });
  document.querySelectorAll("[data-lobby-tab]").forEach(button => {
    button.classList.toggle("is-active", button.dataset.lobbyTab === tabName);
  });
}

function setRoomPolling(enabled) {
  if (roomPollId) {
    clearInterval(roomPollId);
    roomPollId = null;
  }
  if (enabled) {
    roomPollId = setInterval(() => {
      const shouldPoll = screens.lobby.classList.contains("is-active")
        || screens.pvp.classList.contains("is-active")
        || screens.select.classList.contains("is-active");
      if (currentRoom && shouldPoll) {
        refreshRoom();
      }
    }, 1500);
  }
}

function setRoomRealtime(roomCode) {
  if (roomRealtimeChannel) {
    supabaseClient?.removeChannel(roomRealtimeChannel);
    roomRealtimeChannel = null;
  }
  if (!roomCode || !supabaseClient) return;

  roomRealtimeChannel = supabaseClient
    .channel(`room-${roomCode}`)
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "app_rooms",
      filter: `code=eq.${roomCode}`
    }, () => {
      refreshRoom();
    })
    .subscribe();
}

function setMatchmakingPolling(enabled) {
  if (matchmakingPollId) {
    clearInterval(matchmakingPollId);
    matchmakingPollId = null;
  }
  if (enabled) {
    matchmakingPollId = setInterval(checkMatchmaking, 450);
  }
}

function resetMatchmakingUi(message = "") {
  matchmakingActive = false;
  setMatchmakingPolling(false);
  ui.pvpModeButton.disabled = false;
  ui.pvpModeButton.classList.remove("is-selected");
  ui.cancelMatchButton.classList.add("is-hidden");
  ui.modeMessage.textContent = message;
}

function resetLocalMatchState() {
  if (matchStartTimeoutId) {
    clearTimeout(matchStartTimeoutId);
    matchStartTimeoutId = null;
  }
  currentRoom = null;
  selectedCharacterReady = false;
  stopSelectTimer();
  setRoomRealtime(null);
  setRoomPolling(false);
  players = currentUser ? [currentUser] : [];
  matchPlayers.p1 = currentUser?.id ?? "";
  matchPlayers.p2 = "";
  selections = { p1: DEFAULT_CHARACTER, p2: DEFAULT_CHARACTER };
  document.querySelectorAll(".select-panel").forEach(panel => panel.classList.remove("is-hidden"));
}

function showMatchOverlay(text, active = true) {
  ui.matchOverlayText.textContent = text;
  ui.matchOverlay.classList.toggle("is-active", active);
}

function stopSelectTimer() {
  if (selectCountdownId) {
    clearInterval(selectCountdownId);
    selectCountdownId = null;
  }
}

function startSelectTimer() {
  stopSelectTimer();
  selectDeadline = Date.now() + 30000;
  updateSelectTimer();
  selectCountdownId = setInterval(updateSelectTimer, 100);
}

function updateSelectTimer() {
  const remainingMs = Math.max(0, selectDeadline - Date.now());
  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const progress = remainingMs / 30000;
  ui.selectTimerText.textContent = remainingSeconds;
  ui.timerLeftBar.style.transform = `scaleX(${progress})`;
  ui.timerRightBar.style.transform = `scaleX(${progress})`;
  if (remainingMs <= 0) {
    stopSelectTimer();
    submitCharacterReady();
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[char]);
}

function renderLobby() {
  if (currentUser) {
    const tier = tierForLp(currentUser.lp);
    const tierClass = tierClassForLp(currentUser.lp);
    ui.currentUserName.textContent = currentUser.name;
    ui.currentUserTier.textContent = tier;
    ui.currentUserName.className = `rank-name ${tierClass}`;
    ui.currentUserTier.className = `tier-label ${tierClass}`;
    ui.currentUserCoins.textContent = currentUser.lp;
    ui.globalCoinAmount.textContent = currentUser.coins;
  }

  ui.playerList.innerHTML = "";

  reconcileMatchPlayers();
  renderMatchSelectors();
  renderPlayerOptions(ui.gachaPlayer, ui.gachaPlayer.value || matchPlayers.p1);
  updateLobbyPreview();
}

function renderMatchSelectors(force = false) {
  const pvpActive = screens.pvp.classList.contains("is-active");
  if (pvpActive && matchSelectionTouched && !force) return;
  renderPlayerOptions(ui.lobbyPlayerOne, matchPlayers.p1);
  renderPlayerOptions(ui.lobbyPlayerTwo, matchPlayers.p2);
}

function renderPlayerOptions(select, selectedId) {
  select.innerHTML = "";
  players.forEach(player => {
    const option = document.createElement("option");
    option.value = player.id;
    option.textContent = `${player.name} (${player.lp} LP)`;
    select.appendChild(option);
  });
  select.value = getPlayer(selectedId) ? selectedId : players[0]?.id ?? "";
  select.disabled = players.length === 0;
}

function setMatchPlayer(slot, playerId) {
  matchSelectionTouched = true;
  const otherSlot = slot === "p1" ? "p2" : "p1";
  const previous = matchPlayers[slot];
  matchPlayers[slot] = playerId;
  if (matchPlayers[otherSlot] === playerId) {
    matchPlayers[otherSlot] = getPlayer(previous)
      ? previous
      : players.find(player => player.id !== playerId)?.id ?? "";
  }
  renderMatchSelectors(true);
  updateLobbyPreview();
}

function reconcileMatchPlayers(previousP1 = matchPlayers.p1, previousP2 = matchPlayers.p2) {
  if (matchSelectionTouched && getPlayer(matchPlayers.p1) && getPlayer(matchPlayers.p2)) return;
  matchPlayers.p1 = getPlayer(previousP1) ? previousP1 : players[0]?.id ?? "";
  matchPlayers.p2 = getPlayer(previousP2) && previousP2 !== matchPlayers.p1
    ? previousP2
    : players.find(player => player.id !== matchPlayers.p1)?.id ?? "";
}

function updateLobbyPreview() {
  const p1 = getPlayer(matchPlayers.p1);
  const p2 = getPlayer(matchPlayers.p2);

  ui.lobbyP1Name.textContent = p1?.name ?? "PLAYER 1";
  ui.lobbyP2Name.textContent = p2?.name ?? "PLAYER 2";
  ui.lobbyP1Coins.textContent = p1?.lp ?? 0;
  ui.lobbyP2Coins.textContent = p2?.lp ?? 0;

  const notEnoughPlayers = players.length < 2;
  const samePlayer = matchPlayers.p1 === matchPlayers.p2;
  const brokePlayer = false;
  ui.lobbyStartButton.disabled = notEnoughPlayers || samePlayer;
  ui.lobbyMessage.textContent = notEnoughPlayers
    ? "플레이어를 2명 이상 추가하세요."
    : samePlayer
      ? "서로 다른 플레이어를 골라야 합니다."
      : "";
}

function openPvpSetup() {
  startMatchmaking();
}

async function startMatchmaking() {
  if (!currentUser) return;
  if (matchmakingActive) return;
  selectedMode = "pvp";
  resetLocalMatchState();
  renderLobby();
  matchmakingActive = true;
  ui.pvpModeButton.classList.add("is-selected");
  ui.pveModeButton.classList.remove("is-selected");
  ui.cancelMatchButton.classList.remove("is-hidden");
  ui.modeMessage.textContent = "매칭중...";
  ui.pvpModeButton.disabled = true;
  await checkMatchmaking();
  if (matchmakingActive) setMatchmakingPolling(true);
}

async function checkMatchmaking() {
  if (!matchmakingActive) return;
  try {
    const data = await rpc("find_pvp_match", { session_token: appSessionToken });
    if (!matchmakingActive) return;
    if (!data.matched) {
      ui.modeMessage.textContent = `매칭중... ${data.elapsed ?? 0}초`;
      return;
    }
    resetMatchmakingUi("");
    applyRoom(data.room);
    showMatchOverlay("게임이 시작됩니다", true);
    await wait(2000);
    if (!currentRoom || currentRoom.code !== data.room.code) return;
    showMatchOverlay("", false);
    prepareCharacterSelect();
  } catch (error) {
    resetMatchmakingUi(error.message);
  }
}

async function cancelMatchmaking() {
  try {
    await rpc("cancel_pvp_match", { session_token: appSessionToken });
  } catch (error) {
    ui.modeMessage.textContent = error.message;
  }
  resetLocalMatchState();
  resetMatchmakingUi("매칭이 취소되었습니다.");
  renderLobby();
  showScreen("lobby");
}

function selectPveMode() {
  if (matchmakingActive) {
    cancelMatchmaking();
  }
  selectedMode = "pve";
  ui.pveModeButton.classList.add("is-selected");
  ui.pvpModeButton.classList.remove("is-selected");
  ui.modeMessage.textContent = "PVE는 공사중입니다.";
}
async function authenticate(mode) {
  const username = mode === "signup" ? ui.signupUsername.value.trim() : ui.authUsername.value.trim();
  const password = mode === "signup" ? ui.signupPassword.value : ui.authPassword.value;
  const message = mode === "signup" ? ui.signupMessage : ui.authMessage;
  if (!username || !password) {
    message.textContent = "아이디와 비밀번호를 입력하세요.";
    return;
  }

  try {
    if (mode === "signup") {
      const data = await rpc("signup_user", { user_name: username, raw_password: password });
      appSessionToken = data.token;
      localStorage.setItem(APP_SESSION_KEY, appSessionToken);
      currentUser = normalizePlayer(data.user);
      players = [currentUser];
      matchPlayers.p1 = currentUser.id;
      matchPlayers.p2 = "";
      renderLobby();
      showScreen("lobby");
      return;
    }

    const data = await rpc("login_user", { user_name: username, raw_password: password });
    appSessionToken = data.token;
    localStorage.setItem(APP_SESSION_KEY, appSessionToken);
    await loadCurrentUser();
    showScreen("lobby");
  } catch (error) {
    message.textContent = error.message;
  }
}

async function loadCurrentUser() {
  const data = await rpc("get_me", { session_token: appSessionToken });
  currentUser = normalizePlayer(data);
  if (!currentRoom) {
    players = [currentUser];
    matchPlayers.p1 = currentUser.id;
    matchPlayers.p2 = "";
  }
  renderLobby();
}

function applyRoom(room) {
  const previousP1 = matchPlayers.p1;
  const previousP2 = matchPlayers.p2;
  const roomPlayers = Array.isArray(room.players)
    ? room.players.map(normalizePlayer)
    : currentUser
      ? [currentUser]
      : [];
  currentRoom = { ...room, players: roomPlayers };
  players = roomPlayers;
  const prep = currentRoom.prepState || currentRoom.prep_state || {};
  if (prep.matchPlayers?.p1 && prep.matchPlayers?.p2) {
    matchPlayers.p1 = prep.matchPlayers.p1;
    matchPlayers.p2 = prep.matchPlayers.p2;
  } else {
    reconcileMatchPlayers(previousP1, previousP2);
  }
  renderLobby();
  setRoomPolling(true);
  setRoomRealtime(currentRoom.code);
  processSkillEvents(prep);
  maybeStartReadyMatch();
}

async function refreshRoom() {
  if (!currentRoom) {
    await loadCurrentUser();
    return;
  }
  try {
    const room = await rpc("get_room", { session_token: appSessionToken, room_code: currentRoom.code });
    applyRoom(room);
  } catch (error) {
    if (error.message.includes("room not found")) {
      resetLocalMatchState();
      resetMatchmakingUi("상대가 매치에서 나갔습니다.");
      renderLobby();
      showScreen("lobby");
      return;
    }
    ui.lobbyMessage.textContent = error.message;
  }
}

function togglePassword(input, button) {
  const visible = input.type === "text";
  input.type = visible ? "password" : "text";
  button.textContent = visible ? "보기" : "숨기기";
}

function openGachaScreen() {
  if (!currentUser) return;
  ui.gachaPlayer.innerHTML = "";
  const option = document.createElement("option");
  option.value = currentUser.id;
  option.textContent = `${currentUser.name} (${currentUser.coins}C)`;
  ui.gachaPlayer.appendChild(option);
  ui.gachaPlayer.value = currentUser.id;
  ui.gachaMessage.textContent = "";
  ui.gachaResultName.textContent = "READY";
  ui.gachaReveal.querySelector("span").textContent = "?";
  ui.gachaReveal.classList.remove("is-rolling", "is-hit");
  showScreen("gacha");
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function drawCharacter() {
  const player = getPlayer(ui.gachaPlayer.value);
  if (!player) {
    ui.gachaMessage.textContent = "뽑을 플레이어가 없습니다.";
    return;
  }
  if (player.coins < GACHA_COST) {
    ui.gachaMessage.textContent = "코인이 부족합니다.";
    return;
  }

  ui.gachaButton.disabled = true;
  ui.gachaMessage.textContent = "돌아가는 중...";
  ui.gachaResultName.textContent = "";
  ui.gachaReveal.querySelector("span").textContent = "?";
  ui.gachaReveal.classList.add("is-rolling");
  ui.gachaReveal.classList.remove("is-hit");
  await wait(1300);

  try {
    const data = await rpc("draw_gacha", { session_token: appSessionToken });
    const picked = data.picked;
    currentUser = normalizePlayer(data.user);
    players = players.map(item => item.id === currentUser.id ? currentUser : item);

    ui.gachaReveal.classList.remove("is-rolling");
    ui.gachaReveal.classList.add("is-hit");
    ui.gachaReveal.querySelector("span").textContent = ({ charger: "B", grabber: "G", poker: "P", stealth: "S" })[picked] || "?";
    ui.gachaResultName.textContent = characters[picked].name;
    ui.gachaMessage.textContent = `${currentUser.name}: ${characters[picked].name} 획득!`;
    renderLobby();
  } catch (error) {
    ui.gachaReveal.classList.remove("is-rolling");
    ui.gachaMessage.textContent = error.message;
  } finally {
    ui.gachaButton.disabled = false;
  }
}

async function claimFreeCoins() {
  if (!currentUser) return;
  ui.coinBadge.disabled = true;
  try {
    const data = await rpc("claim_free_coins", { session_token: appSessionToken });
    currentUser = normalizePlayer(data);
    players = players.map(player => player.id === currentUser.id ? currentUser : player);
    renderLobby();
  } catch (error) {
    ui.modeMessage.textContent = error.message;
  } finally {
    ui.coinBadge.disabled = false;
  }
}

function updateCharacterCards(playerKey, player) {
  const owned = player.ownedCharacters;
  if (!owned.includes(selections[playerKey])) selections[playerKey] = owned[0] ?? DEFAULT_CHARACTER;

  document.querySelectorAll(`.fighter-card[data-player="${playerKey}"]`).forEach(card => {
    const isOwned = owned.includes(card.dataset.character);
    const isSelected = selections[playerKey] === card.dataset.character;
    const name = card.querySelector("strong");
    card.disabled = !isOwned;
    card.classList.toggle("is-locked", !isOwned);
    card.classList.toggle("is-selected", isOwned && isSelected);
    if (name) name.textContent = isOwned ? name.dataset.name : "";
  });
}

function prepareCharacterSelect() {
  const p1 = getPlayer(matchPlayers.p1);
  const p2 = getPlayer(matchPlayers.p2);
  const mySlot = currentUser?.id === matchPlayers.p1 ? "p1" : currentUser?.id === matchPlayers.p2 ? "p2" : "p1";
  ui.selectP1Label.textContent = `PLAYER 1 - ${p1.name}`;
  ui.selectP2Label.textContent = `PLAYER 2 - ${p2.name}`;
  updateCharacterCards("p1", p1);
  updateCharacterCards("p2", p2);
  document.querySelectorAll(".select-panel").forEach(panel => {
    const label = panel.querySelector(".player-label");
    const isMine = label?.id === (mySlot === "p1" ? "selectP1Label" : "selectP2Label");
    panel.classList.toggle("is-hidden", !isMine);
  });
  ui.toBetButton.textContent = "준비 완료";
  ui.toBetButton.disabled = false;
  selectedCharacterReady = false;
  showScreen("select");
  startSelectTimer();
}

async function submitCharacterReady() {
  if (!currentRoom || !currentUser) return;
  if (selectedCharacterReady) return;
  const mySlot = currentUser.id === matchPlayers.p1 ? "p1" : currentUser.id === matchPlayers.p2 ? "p2" : "";
  if (!mySlot) return;
  try {
    selectedCharacterReady = true;
    stopSelectTimer();
    ui.toBetButton.disabled = true;
    const room = await rpc("set_character_ready", {
      session_token: appSessionToken,
      room_code: currentRoom.code,
      character_kind: selections[mySlot],
      is_ready: true
    });
    applyRoom(room);
    ui.toBetButton.textContent = "상대 준비 대기중";
  } catch (error) {
    selectedCharacterReady = false;
    startSelectTimer();
    ui.toBetButton.disabled = false;
    ui.toBetButton.textContent = error.message;
  }
}

function maybeStartReadyMatch() {
  if (!currentRoom || !screens.select.classList.contains("is-active") || game) return;
  const prep = currentRoom.prepState || currentRoom.prep_state || {};
  if (!prep.started) return;
  const charSelections = prep.characterSelections || {};
  selections.p1 = charSelections[matchPlayers.p1] || selections.p1;
  selections.p2 = charSelections[matchPlayers.p2] || selections.p2;
  ui.toBetButton.disabled = false;
  stopSelectTimer();
  const startAt = Number(prep.matchStartAt || prep.match_start_at || 0);
  const delay = startAt ? Math.max(0, (startAt * 1000) - Date.now()) : 0;
  if (delay > 40) {
    if (!matchStartTimeoutId) {
      matchStartTimeoutId = setTimeout(() => {
        matchStartTimeoutId = null;
        maybeStartReadyMatch();
      }, delay);
    }
    return;
  }
  startGame();
}

function hashSeed(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0 || 1;
}

function seededRandom() {
  matchRandomSeed = Math.imul(matchRandomSeed, 1664525) + 1013904223;
  return (matchRandomSeed >>> 0) / 4294967296;
}

function randomVelocity(speed) {
  const angle = seededRandom() * Math.PI * 2;
  return {
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed
  };
}

function normalSkillCooldown(kind) {
  return {
    thrower: 720,
    charger: 600,
    grabber: 900,
    poker: 600,
    stealth: 900
  }[kind] ?? Infinity;
}

function ultimateCooldown(kind) {
  return {
    thrower: 1800,
    charger: 1380,
    grabber: 2100,
    poker: 2400,
    stealth: 2400
  }[kind] ?? Infinity;
}

function makeFighter(kind, label, ownerId, x, y) {
  const character = characters[kind];
  const velocity = randomVelocity(6.5);

  return {
    kind,
    label,
    ownerId,
    ownerName: getPlayer(ownerId).name,
    name: character.name,
    color: character.color,
    accent: character.accent,
    x,
    y,
    vx: velocity.vx,
    vy: velocity.vy,
    radius: 32,
    hp: 200,
    maxHp: 200,
    contactDamage: character.contactDamage,
    canThrow: character.canThrow,
    canGrab: character.canGrab,
    canPoker: character.canPoker,
    canStealth: character.canStealth,
    throwTimer: character.canThrow ? 180 : Infinity,
    grabTimer: character.canGrab ? 150 : Infinity,
    pokerTimer: character.canPoker ? 150 : Infinity,
    pokerHand: [],
    pokerReveal: 0,
    pokerLabel: "",
    pokerBoostMultiplier: 1,
    stealthTimer: character.canStealth ? 420 : Infinity,
    stealthTime: 0,
    stealthDamage: 15,
    hyperStealthNext: false,
    stealthDamageCooldown: 0,
    skillTimer: 480,
    ultimateTimer: 480,
    rageTime: 0,
    unstoppableTime: 0,
    unstoppableHit: false,
    stunTime: 0,
    slowTime: 0,
    hasteTime: 0,
    hitFlash: 0
  };
}

function resetGame() {
  const p1 = getPlayer(matchPlayers.p1);
  const p2 = getPlayer(matchPlayers.p2);
  matchRandomSeed = hashSeed([
    currentRoom?.code ?? "local",
    matchPlayers.p1,
    matchPlayers.p2,
    selections.p1,
    selections.p2
  ].join("|"));

  game = {
    fighters: [
      makeFighter(selections.p1, "PLAYER 1", p1.id, 120, canvas.height / 2),
      makeFighter(selections.p2, "PLAYER 2", p2.id, canvas.width - 120, canvas.height / 2)
    ],
    balls: [],
    grapples: [],
    pokerShots: [],
    shockwaves: [],
    damageTexts: [],
    contactLock: false,
    over: false,
    tick: 0,
    lastTime: performance.now(),
    accumulator: 0
  };
  appliedSkillEvents = new Set();
  pendingSkillUse = false;

  ui.currentBet.textContent = "+14 LP";
  ui.hudP1Label.textContent = p1.name;
  ui.hudP2Label.textContent = p2.name;
  ui.playerOneName.textContent = game.fighters[0].name;
  ui.playerTwoName.textContent = game.fighters[1].name;
  ui.resultOverlay.classList.remove("is-active");
  updateHud();
}

function startGame() {
  if (matchStartTimeoutId) {
    clearTimeout(matchStartTimeoutId);
    matchStartTimeoutId = null;
  }
  resetGame();
  gameSpeed = 1;
  showScreen("game");
  if (animationId) cancelAnimationFrame(animationId);
  game.lastTime = performance.now();
  updateSkillHud();
  animationId = requestAnimationFrame(loop);
}

function updateHud() {
  const p1Hp = clamp(game.fighters[0].hp, 0, game.fighters[0].maxHp);
  const p2Hp = clamp(game.fighters[1].hp, 0, game.fighters[1].maxHp);
  ui.playerOneHealthText.textContent = Math.ceil(p1Hp);
  ui.playerTwoHealthText.textContent = Math.ceil(p2Hp);
  ui.playerOneHealthBar.style.width = `${(p1Hp / game.fighters[0].maxHp) * 100}%`;
  ui.playerTwoHealthBar.style.width = `${(p2Hp / game.fighters[1].maxHp) * 100}%`;
}

function damage(fighter, amount) {
  if (amount <= 0 || game.over) return;
  if (fighter.stealthTime > 0) return;
  fighter.hp = clamp(fighter.hp - amount, 0, fighter.maxHp);
  fighter.hitFlash = 10;
  addDamageText(fighter.x, fighter.y - fighter.radius, amount);
  updateHud();
  if (fighter.hp <= 0) finishGame(fighter === game.fighters[0] ? game.fighters[1] : game.fighters[0]);
}

function contactDamagePair(a, b) {
  if (game.over) return;
  if (a.stealthTime > 0 || b.stealthTime > 0) {
    if (a.stealthTime > 0 && a.stealthDamageCooldown <= 0) {
      damage(b, a.stealthDamage);
      a.stealthDamageCooldown = 24;
    }
    if (b.stealthTime > 0 && b.stealthDamageCooldown <= 0) {
      damage(a, b.stealthDamage);
      b.stealthDamageCooldown = 24;
    }
    return;
  }
  const nextA = clamp(a.hp - b.contactDamage, 0, a.maxHp);
  const nextB = clamp(b.hp - a.contactDamage, 0, b.maxHp);
  if (b.contactDamage > 0) {
    a.hitFlash = 10;
    addDamageText(a.x, a.y - a.radius, b.contactDamage);
  }
  if (a.contactDamage > 0) {
    b.hitFlash = 10;
    addDamageText(b.x, b.y - b.radius, a.contactDamage);
  }
  a.hp = nextA;
  b.hp = nextB;
  updateHud();
  if (a.hp <= 0 && b.hp <= 0 && a.kind === "charger" && b.kind === "charger") {
    finishDraw();
    return;
  }
  if (a.hp <= 0) finishGame(b);
  if (b.hp <= 0) finishGame(a);
}

function addDamageText(x, y, amount) {
  game.damageTexts.push({ x, y, amount, life: 45, maxLife: 45, vy: -0.75 });
}

function addFloatingText(x, y, text, color = "#ff304f") {
  game.damageTexts.push({ x, y, text, color, life: 70, maxLife: 70, vy: -0.5 });
}

function finishGame(winner) {
  if (game.over) return;
  game.over = true;
  const loser = winner === game.fighters[0] ? game.fighters[1] : game.fighters[0];
  const winnerPlayer = getPlayer(winner.ownerId);
  const loserPlayer = getPlayer(loser.ownerId);
  ui.resultTitle.textContent = `${winner.ownerName} 승리!`;
  ui.resultText.textContent = `${winner.name} 승. 정산 중...`;
  ui.resultOverlay.classList.add("is-active");
  settleMatch(winnerPlayer, loserPlayer);
}

async function settleMatch(winnerPlayer, loserPlayer) {
  try {
    const data = await rpc("settle_match", {
      session_token: appSessionToken,
      room_code: currentRoom?.code ?? "",
      winner_id: winnerPlayer.id,
      loser_id: loserPlayer.id,
      loser_bet: 0
    });
    const updatedWinner = normalizePlayer(data.winner);
    const updatedLoser = normalizePlayer(data.loser);
    players = players.map(player => {
      if (player.id === updatedWinner.id) return updatedWinner;
      if (player.id === updatedLoser.id) return updatedLoser;
      return player;
    });
    if (currentUser?.id === updatedWinner.id) currentUser = updatedWinner;
    if (currentUser?.id === updatedLoser.id) currentUser = updatedLoser;
    ui.resultText.textContent = `${characters[game.fighters.find(item => item.ownerId === updatedWinner.id)?.kind || DEFAULT_CHARACTER].name} 승. ${data.lpGain ?? 14} LP 획득. ${updatedWinner.name} ${updatedWinner.lp} LP / ${updatedLoser.name} ${updatedLoser.lp} LP`;
  } catch (error) {
    ui.resultText.textContent = `정산 실패: ${error.message}`;
  }
}

function finishDraw() {
  if (game.over) return;
  game.over = true;
  ui.resultTitle.textContent = "무승부!";
  ui.resultText.textContent = "돌진하는 색히끼리 끝까지 맞짱. 코인은 그대로 유지됩니다.";
  ui.resultOverlay.classList.add("is-active");
}

function opponentOf(fighter) {
  return fighter === game.fighters[0] ? game.fighters[1] : game.fighters[0];
}

function startStealth(fighter) {
  const hyper = fighter.hyperStealthNext;
  fighter.stealthTime = hyper ? 240 : 180;
  fighter.stealthDamage = hyper ? 20 : 15;
  fighter.hyperStealthNext = false;
  addFloatingText(fighter.x, fighter.y - fighter.radius - 44, hyper ? "하이퍼 히든!" : "은신", fighter.accent);
}

function heal(fighter, amount) {
  if (amount <= 0 || game.over) return;
  fighter.hp = clamp(fighter.hp + amount, 0, fighter.maxHp);
  addFloatingText(fighter.x, fighter.y - fighter.radius - 28, `+${amount}`, "#7bd88f");
  updateHud();
}

function triggerNormalSkill(fighter) {
  if (fighter.kind === "thrower") {
    const target = opponentOf(fighter);
    let count = 0;
    game.balls.forEach(ball => {
      if (ball.owner === fighter) {
        ball.homing = true;
        ball.homeTarget = target;
        ball.homingTime = 240;
        ball.color = "#ffe28a";
        count += 1;
      }
    });
    addFloatingText(fighter.x, fighter.y - fighter.radius - 44, count ? "룩 온!" : "룩 온", fighter.accent);
    fighter.skillTimer = 720;
    return;
  }

  if (fighter.kind === "charger") {
    fighter.rageTime = 180;
    addFloatingText(fighter.x, fighter.y - fighter.radius - 44, "격노!", fighter.accent);
    fighter.skillTimer = 600;
    return;
  }

  if (fighter.kind === "grabber") {
    throwGrapple(fighter);
    addFloatingText(fighter.x, fighter.y - fighter.radius - 44, "그랩!", fighter.accent);
    fighter.skillTimer = 900;
    return;
  }

  if (fighter.kind === "poker") {
    throwDrawCard(fighter);
    fighter.skillTimer = 600;
    return;
  }

  if (fighter.kind === "stealth") {
    if (fighter.stealthTime <= 0) return;
    assassinate(fighter);
    fighter.skillTimer = 900;
  }
}

function triggerUltimate(fighter) {
  if (fighter.kind === "thrower") {
    fireStarStrike(fighter);
    fighter.ultimateTimer = 1800;
    return;
  }

  if (fighter.kind === "charger") {
    const speed = Math.hypot(fighter.vx, fighter.vy) || 1;
    fighter.vx = (fighter.vx / speed) * 18;
    fighter.vy = (fighter.vy / speed) * 18;
    fighter.unstoppableTime = 55;
    fighter.unstoppableHit = false;
    addFloatingText(fighter.x, fighter.y - fighter.radius - 44, "불가항력!", fighter.accent);
    fighter.ultimateTimer = 1380;
    return;
  }

  if (fighter.kind === "grabber") {
    createShockwave(fighter);
    fighter.ultimateTimer = 2100;
    return;
  }

  if (fighter.kind === "poker") {
    const roll = Math.floor(seededRandom() * 6) + 1;
    heal(fighter, roll * 5);
    addFloatingText(fighter.x, fighter.y - fighter.radius - 54, `힐 다이스 ${roll}`, fighter.accent);
    fighter.ultimateTimer = 2400;
    return;
  }

  if (fighter.kind === "stealth") {
    fighter.hyperStealthNext = true;
    addFloatingText(fighter.x, fighter.y - fighter.radius - 44, "하이퍼 히든!", fighter.accent);
    fighter.ultimateTimer = 2400;
  }
}

function myFighter() {
  if (!game || !currentUser) return null;
  if (currentUser.id === matchPlayers.p2) return game.fighters[1];
  return game.fighters[0];
}

function fighterByOwnerId(ownerId) {
  if (!game) return null;
  return game.fighters.find(fighter => fighter.ownerId === ownerId) || null;
}

function skillAvailable(fighter, type) {
  if (!fighter || game?.over || fighter.stunTime > 0) return false;
  if (type === "normal") {
    if (fighter.skillTimer > 0) return false;
    if (fighter.kind === "stealth" && fighter.stealthTime <= 0) return false;
    return true;
  }
  return fighter.ultimateTimer <= 0;
}

function executeSkill(fighter, type) {
  if (!skillAvailable(fighter, type)) return false;
  if (type === "normal") {
    triggerNormalSkill(fighter);
  } else {
    triggerUltimate(fighter);
  }
  updateSkillHud();
  return true;
}

async function useSkill(type) {
  const fighter = myFighter();
  if (!skillAvailable(fighter, type)) {
    updateSkillHud();
    return;
  }
  if (currentRoom) {
    if (pendingSkillUse) return;
    pendingSkillUse = true;
    try {
      const room = await rpc("use_skill_event", {
        session_token: appSessionToken,
        room_code: currentRoom.code,
        skill_type: type,
        client_tick: game.tick
      });
      applyRoom(room);
    } catch (error) {
      addFloatingText(fighter.x, fighter.y - fighter.radius - 44, error.message, "#ef476f");
    } finally {
      pendingSkillUse = false;
      updateSkillHud();
    }
    return;
  }
  executeSkill(fighter, type);
}

function processSkillEvents(prep) {
  if (!game || !prep) return;
  const events = prep.skillEvents || prep.skill_events || [];
  if (!Array.isArray(events)) return;
  events.forEach(event => {
    const eventId = event.id || `${event.actorId || event.actor_id}-${event.type}-${event.createdAt || event.created_at}`;
    if (!eventId || appliedSkillEvents.has(eventId)) return;
    const applyTick = Number(event.applyTick ?? event.apply_tick ?? 0);
    if (applyTick && game.tick < applyTick) return;
    const actorId = event.actorId || event.actor_id;
    const skillType = event.type;
    const fighter = fighterByOwnerId(actorId);
    if (!fighter) return;
    executeSkill(fighter, skillType);
    appliedSkillEvents.add(eventId);
  });
  updateSkillHud();
}

function cooldownSeconds(ticks) {
  return Math.max(0, Math.ceil(ticks / 60));
}

function updateSkillHud() {
  const fighter = myFighter();
  if (!fighter) return;
  const names = skillNames[fighter.kind] || { normal: "일반스킬", ultimate: "궁극기" };
  const normalCooldown = cooldownSeconds(fighter.skillTimer);
  const ultimateCooldown = cooldownSeconds(fighter.ultimateTimer);
  const normalLocked = fighter.kind === "stealth" && fighter.stealthTime <= 0 && normalCooldown === 0;

  ui.normalSkillName.textContent = names.normal;
  ui.ultimateSkillName.textContent = names.ultimate;
  ui.normalSkillCooldown.textContent = normalCooldown > 0 ? normalCooldown : "";
  ui.ultimateSkillCooldown.textContent = ultimateCooldown > 0 ? ultimateCooldown : "";
  ui.normalSkillButton.classList.toggle("is-cooling", normalCooldown > 0);
  ui.ultimateSkillButton.classList.toggle("is-cooling", ultimateCooldown > 0);
  ui.normalSkillButton.classList.toggle("is-locked", normalLocked);
  ui.ultimateSkillButton.classList.toggle("is-locked", false);
  ui.normalSkillButton.disabled = !skillAvailable(fighter, "normal");
  ui.ultimateSkillButton.disabled = !skillAvailable(fighter, "ultimate");
}

function updateSkills(fighter, dt) {
  if (fighter.skillTimer > 0) fighter.skillTimer -= dt;
  if (fighter.ultimateTimer > 0) fighter.ultimateTimer -= dt;
}

function moveFighter(fighter, dt) {
  if (fighter.stunTime > 0) {
    fighter.stunTime -= dt;
    if (fighter.skillTimer > 0) fighter.skillTimer -= dt;
    if (fighter.ultimateTimer > 0) fighter.ultimateTimer -= dt;
    if (fighter.rageTime > 0) fighter.rageTime -= dt;
    if (fighter.unstoppableTime > 0) fighter.unstoppableTime -= dt;
    if (fighter.slowTime > 0) fighter.slowTime -= dt;
    if (fighter.hasteTime > 0) fighter.hasteTime -= dt;
    if (fighter.stealthTime > 0) fighter.stealthTime -= dt;
    if (fighter.stealthDamageCooldown > 0) fighter.stealthDamageCooldown -= dt;
    fighter.vx *= 0.82;
    fighter.vy *= 0.82;
    if (fighter.hitFlash > 0) fighter.hitFlash -= dt;
    return;
  }
  fighter.x += fighter.vx * dt;
  fighter.y += fighter.vy * dt;
  const speed = Math.hypot(fighter.vx, fighter.vy);
  const baseSpeed = fighter.stealthTime > 0
    ? fighter.stealthDamage >= 20 ? 20.4 : 12.5
    : fighter.canThrow
      ? 5.9
      : fighter.canGrab
        ? 6.2
        : 6.8;
  const targetSpeed = baseSpeed
    * (fighter.rageTime > 0 ? 1.95 : 1)
    * (fighter.hasteTime > 0 ? 1.35 : 1)
    * (fighter.slowTime > 0 ? 0.58 : 1)
    * (fighter.unstoppableTime > 0 ? 1.35 : 1);
  if (speed !== 0) {
    fighter.vx = (fighter.vx / speed) * targetSpeed;
    fighter.vy = (fighter.vy / speed) * targetSpeed;
  } else {
    const velocity = randomVelocity(targetSpeed);
    fighter.vx = velocity.vx;
    fighter.vy = velocity.vy;
  }
  bounceOnWalls(fighter);
  updateSkills(fighter, dt);

  if (fighter.rageTime > 0) fighter.rageTime -= dt;
  if (fighter.unstoppableTime > 0) {
    fighter.unstoppableTime -= dt;
    const target = opponentOf(fighter);
    if (!fighter.unstoppableHit && Math.hypot(target.x - fighter.x, target.y - fighter.y) < target.radius + fighter.radius + 52) {
      damage(target, 40);
      fighter.unstoppableHit = true;
    }
  }
  if (fighter.slowTime > 0) fighter.slowTime -= dt;
  if (fighter.hasteTime > 0) fighter.hasteTime -= dt;

  if (fighter.canThrow) {
    fighter.throwTimer -= dt;
    if (fighter.throwTimer <= 0) {
      throwBall(fighter);
      fighter.throwTimer = 180;
    }
  }
  if (fighter.canGrab) {
    fighter.grabTimer -= dt;
    if (fighter.grabTimer <= 0) {
      throwGrapple(fighter);
      fighter.grabTimer = 150;
    }
  }
  if (fighter.canPoker) {
    fighter.pokerTimer -= dt;
    if (fighter.pokerTimer <= 0) {
      dealPokerAttack(fighter);
      fighter.pokerTimer = 300;
    }
    if (fighter.pokerReveal > 0) fighter.pokerReveal -= dt;
  }
  if (fighter.canStealth) {
    fighter.stealthTimer -= dt;
    if (fighter.stealthTimer <= 0) {
      startStealth(fighter);
      fighter.stealthTimer = 420;
    }
    if (fighter.stealthTime > 0) fighter.stealthTime -= dt;
    if (fighter.stealthDamageCooldown > 0) fighter.stealthDamageCooldown -= dt;
  }
  if (fighter.hitFlash > 0) fighter.hitFlash -= dt;
}

function bounceOnWalls(body) {
  if (body.x - body.radius < 0) {
    body.x = body.radius;
    body.vx = Math.abs(body.vx);
  }
  if (body.x + body.radius > canvas.width) {
    body.x = canvas.width - body.radius;
    body.vx = -Math.abs(body.vx);
  }
  if (body.y - body.radius < 0) {
    body.y = body.radius;
    body.vy = Math.abs(body.vy);
  }
  if (body.y + body.radius > canvas.height) {
    body.y = canvas.height - body.radius;
    body.vy = -Math.abs(body.vy);
  }
}

function handleFighterCollision() {
  const a = game.fighters[0];
  const b = game.fighters[1];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  const minDist = a.radius + b.radius;
  if (dist >= minDist) {
    game.contactLock = false;
    return;
  }

  if (a.stealthTime > 0 || b.stealthTime > 0) {
    contactDamagePair(a, b);
    return;
  }

  const nx = dx / (dist || 1);
  const ny = dy / (dist || 1);
  const overlap = minDist - dist;
  a.x -= nx * overlap * 0.5;
  a.y -= ny * overlap * 0.5;
  b.x += nx * overlap * 0.5;
  b.y += ny * overlap * 0.5;
  const av = a.vx * nx + a.vy * ny;
  const bv = b.vx * nx + b.vy * ny;
  a.vx += (bv - av) * nx - nx * 1.8;
  a.vy += (bv - av) * ny - ny * 1.8;
  b.vx += (av - bv) * nx + nx * 1.8;
  b.vy += (av - bv) * ny + ny * 1.8;
  if (!game.contactLock) {
    contactDamagePair(a, b);
    game.contactLock = true;
  }
}

function throwBall(owner) {
  if (!owner.canThrow || game.over) return;
  const target = owner === game.fighters[0] ? game.fighters[1] : game.fighters[0];
  const angle = Math.atan2(target.y - owner.y, target.x - owner.x);
  game.balls.push({
    owner,
    x: owner.x + Math.cos(angle) * (owner.radius + 18),
    y: owner.y + Math.sin(angle) * (owner.radius + 18),
    vx: Math.cos(angle) * 10.2,
    vy: Math.sin(angle) * 10.2,
    radius: 11,
    life: 420,
    hitCooldown: 0,
    damage: 5,
    speed: 10.2,
    color: owner.accent,
    homing: false,
    star: false
  });
}

function fireStarStrike(owner) {
  if (!owner.canThrow || game.over) return;
  const target = opponentOf(owner);
  const baseAngle = Math.atan2(target.y - owner.y, target.x - owner.x);
  [-0.18, 0.18].forEach(spread => {
    const angle = baseAngle + spread;
    game.balls.push({
      owner,
      x: owner.x + Math.cos(angle) * (owner.radius + 22),
      y: owner.y + Math.sin(angle) * (owner.radius + 22),
      vx: Math.cos(angle) * 11.6,
      vy: Math.sin(angle) * 11.6,
      radius: 14,
      life: 1260,
      hitCooldown: 0,
      damage: 5,
      speed: 11.6,
      color: "#ffe28a",
      homing: false,
      star: true
    });
  });
  addFloatingText(owner.x, owner.y - owner.radius - 44, "스타 스트라이크!", owner.accent);
}

function throwGrapple(owner) {
  if (!owner.canGrab || game.over) return;
  const target = owner === game.fighters[0] ? game.fighters[1] : game.fighters[0];
  const angle = Math.atan2(target.y - owner.y, target.x - owner.x);
  game.grapples.push({
    owner,
    angle,
    length: owner.radius + 8,
    maxLength: 470,
    speed: 11,
    hit: false,
    life: 50
  });
}

function createShockwave(owner) {
  const target = opponentOf(owner);
  const range = 128;
  game.shockwaves.push({
    owner,
    x: owner.x,
    y: owner.y,
    radius: 24,
    maxRadius: range,
    life: 34,
    color: owner.accent
  });
  if (Math.hypot(target.x - owner.x, target.y - owner.y) < target.radius + range) {
    damage(target, 20);
    target.stunTime = Math.max(target.stunTime, 60);
    target.vx *= 0.25;
    target.vy *= 0.25;
  }
  addFloatingText(owner.x, owner.y - owner.radius - 44, "충격파!", owner.accent);
}

function throwDrawCard(owner) {
  const target = opponentOf(owner);
  const cards = ["JOKER", "A", "K", "Q", "J"];
  const type = cards[Math.floor(seededRandom() * cards.length)];
  const angle = Math.atan2(target.y - owner.y, target.x - owner.x);
  const damageByType = {
    JOKER: Math.floor(seededRandom() * 30) + 1,
    A: 5,
    K: 0,
    Q: 5,
    J: 3
  };
  game.pokerShots.push({
    owner,
    target,
    rank: type,
    effect: type,
    x: owner.x + Math.cos(angle) * (owner.radius + 18),
    y: owner.y + Math.sin(angle) * (owner.radius + 18),
    vx: Math.cos(angle) * 16.5,
    vy: Math.sin(angle) * 16.5,
    radius: 10,
    damage: damageByType[type],
    life: 170,
    delay: 0,
    spread: 0,
    launched: true
  });
  addFloatingText(owner.x, owner.y - owner.radius - 44, `드로우 ${type}`, owner.accent);
}

function assassinate(owner) {
  const target = opponentOf(owner);
  const targetSpeed = Math.hypot(target.vx, target.vy);
  const nx = targetSpeed > 0.2 ? target.vx / targetSpeed : (target.x - owner.x) / (Math.hypot(target.x - owner.x, target.y - owner.y) || 1);
  const ny = targetSpeed > 0.2 ? target.vy / targetSpeed : (target.y - owner.y) / (Math.hypot(target.x - owner.x, target.y - owner.y) || 1);
  owner.x = target.x - nx * (target.radius + owner.radius + 10);
  owner.y = target.y - ny * (target.radius + owner.radius + 10);
  owner.vx = nx * 13;
  owner.vy = ny * 13;
  bounceOnWalls(owner);
  addFloatingText(owner.x, owner.y - owner.radius - 44, "암살!", owner.accent);
}

function dealPokerAttack(owner) {
  if (!owner.canPoker || game.over) return;
  const ranks = ["A", "K", "Q", "J", "10", "9"];
  const hand = Array.from({ length: 5 }, () => ranks[Math.floor(seededRandom() * ranks.length)]);
  const counts = Object.values(hand.reduce((acc, rank) => {
    acc[rank] = (acc[rank] || 0) + 1;
    return acc;
  }, {})).sort((a, b) => b - a);
  let multiplier = 1;
  let label = "노페어";
  if (counts[0] === 5) {
    multiplier = 12;
    label = "파이브카드";
  } else if (counts[0] === 4) {
    multiplier = 8;
    label = "포카드";
  } else if (counts[0] === 3 && counts[1] === 2) {
    multiplier = 7;
    label = "풀하우스";
  } else if (counts[0] === 3) {
    multiplier = 3;
    label = "쓰리페어";
  } else if (counts[0] === 2 && counts[1] === 2) {
    multiplier = 5;
    label = "투페어";
  } else if (counts[0] === 2) {
    multiplier = 2;
    label = "원페어";
  }
  multiplier *= owner.pokerBoostMultiplier;
  if (owner.pokerBoostMultiplier > 1) {
    label = `${label} + 킹`;
    owner.pokerBoostMultiplier = 1;
  }

  owner.pokerHand = hand;
  owner.pokerReveal = 95;
  owner.pokerLabel = `${label}! 데미지 x${multiplier}`;

  const target = owner === game.fighters[0] ? game.fighters[1] : game.fighters[0];
  hand.forEach((rank, index) => {
    game.pokerShots.push({
      owner,
      target,
      rank,
      x: owner.x,
      y: owner.y,
      vx: 0,
      vy: 0,
      radius: 10,
      damage: 1.5 * multiplier,
      life: 190,
      delay: index * 9,
      spread: (index - 2) * 0.1,
      launched: false
    });
  });
  addFloatingText(owner.x, owner.y - owner.radius - 28, owner.pokerLabel, "#f7f4eb");
}

function updateBalls(dt) {
  game.balls = game.balls.filter(ball => {
    if (ball.homingTime > 0) {
      ball.homingTime -= dt;
      if (ball.homingTime <= 0) {
        ball.homing = false;
        ball.homeTarget = null;
        ball.color = ball.owner.accent;
      }
    }
    if (ball.homing && ball.homeTarget && !game.over) {
      const angle = Math.atan2(ball.homeTarget.y - ball.y, ball.homeTarget.x - ball.x);
      const speed = ball.speed || Math.hypot(ball.vx, ball.vy) || 10.2;
      ball.vx = ball.vx * 0.88 + Math.cos(angle) * speed * 0.12;
      ball.vy = ball.vy * 0.88 + Math.sin(angle) * speed * 0.12;
      const currentSpeed = Math.hypot(ball.vx, ball.vy) || speed;
      ball.vx = (ball.vx / currentSpeed) * speed;
      ball.vy = (ball.vy / currentSpeed) * speed;
    }
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
    ball.life -= dt;
    if (ball.hitCooldown > 0) ball.hitCooldown -= dt;
    bounceOnWalls(ball);

    for (const target of game.fighters) {
      const dx = target.x - ball.x;
      const dy = target.y - ball.y;
      if (Math.hypot(dx, dy) < target.radius + ball.radius && ball.hitCooldown <= 0) {
        if (target !== ball.owner) damage(target, ball.damage);
        const angle = Math.atan2(dy, dx);
        const speed = ball.speed || 10.2;
        ball.vx = -Math.cos(angle) * speed;
        ball.vy = -Math.sin(angle) * speed;
        if (target.stealthTime <= 0) {
          target.vx += Math.cos(angle) * 2.0;
          target.vy += Math.sin(angle) * 2.0;
        }
        ball.hitCooldown = 18;
        break;
      }
    }
    return ball.life > 0;
  });
}

function updateGrapples(dt) {
  game.grapples = game.grapples.filter(grapple => {
    grapple.length += grapple.speed * dt;
    grapple.life -= dt;
    const target = grapple.owner === game.fighters[0] ? game.fighters[1] : game.fighters[0];
    const endX = grapple.owner.x + Math.cos(grapple.angle) * grapple.length;
    const endY = grapple.owner.y + Math.sin(grapple.angle) * grapple.length;
    const hit = Math.hypot(target.x - endX, target.y - endY) < target.radius + 14;

    if (hit && !grapple.hit) {
      if (target.stealthTime > 0) return false;
      grapple.hit = true;
      const pullAngle = Math.atan2(grapple.owner.y - target.y, grapple.owner.x - target.x);
      target.x += Math.cos(pullAngle) * 70;
      target.y += Math.sin(pullAngle) * 70;
      target.vx = Math.cos(pullAngle) * 5.2;
      target.vy = Math.sin(pullAngle) * 5.2;
      bounceOnWalls(target);
      damage(target, 20);
      return false;
    }
    return grapple.length < grapple.maxLength && grapple.life > 0;
  });
}

function updatePokerShots(dt) {
  game.pokerShots = game.pokerShots.filter(card => {
    card.delay -= dt;
    if (card.delay > 0) return true;
    if (!card.launched) {
      const angle = Math.atan2(card.target.y - card.owner.y, card.target.x - card.owner.x) + card.spread;
      card.x = card.owner.x + Math.cos(angle) * (card.owner.radius + 18);
      card.y = card.owner.y + Math.sin(angle) * (card.owner.radius + 18);
      card.vx = Math.cos(angle) * 15.8;
      card.vy = Math.sin(angle) * 15.8;
      card.launched = true;
    }
    card.life -= dt;
    card.x += card.vx * dt;
    card.y += card.vy * dt;
    if (Math.hypot(card.target.x - card.x, card.target.y - card.y) < card.target.radius + card.radius) {
      applyPokerCardHit(card);
      return false;
    }
    return card.life > 0
      && card.x > -40
      && card.x < canvas.width + 40
      && card.y > -40
      && card.y < canvas.height + 40;
  });
}

function applyPokerCardHit(card) {
  if (card.effect === "K") {
    card.owner.pokerBoostMultiplier = 2;
    addFloatingText(card.owner.x, card.owner.y - card.owner.radius - 44, "킹 x2 준비", card.owner.accent);
    return;
  }
  damage(card.target, card.damage);
  if (card.effect === "A") {
    card.target.slowTime = Math.max(card.target.slowTime, 180);
  }
  if (card.effect === "Q") {
    card.owner.hasteTime = Math.max(card.owner.hasteTime, 180);
  }
}

function updateShockwaves(dt) {
  game.shockwaves = game.shockwaves.filter(wave => {
    wave.life -= dt;
    wave.radius = Math.min(wave.maxRadius, wave.radius + 7.2 * dt);
    return wave.life > 0;
  });
}

function updateDamageTexts(dt) {
  game.damageTexts = game.damageTexts.filter(text => {
    text.y += text.vy * dt;
    text.life -= dt;
    return text.life > 0;
  });
}

function drawArena() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#0d1118";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;
  for (let x = 40; x < canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 40; y < canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  game.grapples.forEach(drawGrapple);
  game.shockwaves.forEach(drawShockwave);
  game.balls.forEach(drawBall);
  game.pokerShots.forEach(drawPokerShot);
  game.fighters.forEach(drawFighter);
  game.damageTexts.forEach(drawDamageText);
}

function drawFighter(fighter) {
  ctx.save();
  ctx.translate(fighter.x, fighter.y);
  ctx.beginPath();
  ctx.arc(0, 0, fighter.radius + 7, 0, Math.PI * 2);
  ctx.fillStyle = fighter.hitFlash > 0 ? "rgba(255,255,255,0.42)" : "rgba(255,255,255,0.08)";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, fighter.radius, 0, Math.PI * 2);
  ctx.globalAlpha = fighter.stealthTime > 0 ? 0.42 : 1;
  ctx.fillStyle = fighter.color;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(7, -7, 6, 0, Math.PI * 2);
  ctx.fillStyle = "#101319";
  ctx.fill();
  if (fighter.canThrow) {
    ctx.beginPath();
    ctx.arc(-12, 12, 8, 0, Math.PI * 2);
    ctx.fillStyle = fighter.accent;
    ctx.fill();
  }
  if (fighter.canGrab) {
    ctx.strokeStyle = fighter.accent;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(-9, 11, 9, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (fighter.canPoker) {
    ctx.fillStyle = fighter.accent;
    ctx.fillRect(-15, 8, 22, 16);
    ctx.fillStyle = "#101319";
    ctx.font = "900 11px Segoe UI, Arial";
    ctx.fillText("P", -9, 20);
  }
  if (fighter.unstoppableTime > 0) {
    ctx.strokeStyle = "rgba(239, 71, 111, 0.9)";
    ctx.fillStyle = "rgba(239, 71, 111, 0.13)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, fighter.radius + 52, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  if (fighter.stealthTime > 0) {
    ctx.strokeStyle = fighter.accent;
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(0, 0, fighter.radius + 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();
  drawFighterName(fighter);
  drawFighterHealthBar(fighter);
  drawPokerHand(fighter);
}

function drawFighterName(fighter) {
  const text = fighter.ownerName;
  const y = Math.max(18, fighter.y - fighter.radius - 18);
  ctx.save();
  ctx.font = "900 14px Segoe UI, Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const textWidth = Math.min(ctx.measureText(text).width, 112);
  const boxWidth = textWidth + 20;
  const boxHeight = 24;
  const x = clamp(fighter.x - boxWidth / 2, 8, canvas.width - boxWidth - 8);
  ctx.fillStyle = "rgba(5, 8, 14, 0.78)";
  ctx.strokeStyle = fighter.accent;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y - boxHeight / 2, boxWidth, boxHeight, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#f7f4eb";
  ctx.fillText(text, x + boxWidth / 2, y, boxWidth - 12);
  ctx.restore();
}

function drawFighterHealthBar(fighter) {
  const width = 64;
  const height = 8;
  const x = fighter.x - width / 2;
  const y = fighter.y + fighter.radius + 16;
  const hpRate = clamp(fighter.hp / fighter.maxHp, 0, 1);
  ctx.fillStyle = "rgba(5, 8, 14, 0.78)";
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = hpRate > 0.5 ? "#7bd88f" : hpRate > 0.25 ? "#f2c14e" : "#ef476f";
  ctx.fillRect(x, y, width * hpRate, height);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.42)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, height);
}

function drawBall(ball) {
  if (ball.star) {
    ctx.save();
    ctx.translate(ball.x, ball.y);
    ctx.rotate(Math.atan2(ball.vy, ball.vx));
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    for (let index = 0; index < 10; index += 1) {
      const radius = index % 2 === 0 ? ball.radius + 5 : ball.radius * 0.48;
      const angle = -Math.PI / 2 + index * Math.PI / 5;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    return;
  }
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = ball.color;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ball.x - 3, ball.y - 4, 3, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fill();
}

function drawShockwave(wave) {
  ctx.save();
  ctx.strokeStyle = wave.color;
  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  ctx.globalAlpha = clamp(wave.life / 34, 0, 1);
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawPokerShot(card) {
  if (card.delay > 0) return;
  ctx.save();
  ctx.translate(card.x, card.y);
  ctx.rotate(Math.atan2(card.vy, card.vx));
  ctx.fillStyle = "#f7f4eb";
  ctx.fillRect(-12, -8, 24, 16);
  ctx.strokeStyle = "#ef476f";
  ctx.strokeRect(-12, -8, 24, 16);
  ctx.fillStyle = "#101319";
  ctx.font = "900 10px Segoe UI, Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(card.rank, 0, 0);
  ctx.restore();
}

function drawPokerHand(fighter) {
  if (!fighter.canPoker || fighter.pokerHand.length === 0) return;
  const startX = fighter.x - 47;
  const y = fighter.y + fighter.radius + 30;
  fighter.pokerHand.forEach((rank, index) => {
    const revealed = fighter.pokerReveal < 90 - index * 12;
    const x = startX + index * 19;
    ctx.fillStyle = revealed ? "#f7f4eb" : "#252a34";
    ctx.fillRect(x, y, 16, 22);
    ctx.strokeStyle = revealed ? fighter.accent : "#3b4352";
    ctx.strokeRect(x, y, 16, 22);
    ctx.fillStyle = revealed ? "#101319" : "#aeb6c6";
    ctx.font = "900 8px Segoe UI, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(revealed ? rank : "?", x + 8, y + 11);
  });
}

function drawGrapple(grapple) {
  const startX = grapple.owner.x;
  const startY = grapple.owner.y;
  const endX = startX + Math.cos(grapple.angle) * grapple.length;
  const endY = startY + Math.sin(grapple.angle) * grapple.length;
  ctx.strokeStyle = grapple.owner.accent;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(endX, endY, 10, 0, Math.PI * 2);
  ctx.fillStyle = grapple.owner.accent;
  ctx.fill();
}

function drawDamageText(text) {
  const alpha = clamp(text.life / text.maxLife, 0, 1);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = "900 22px Segoe UI, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(0, 0, 0, 0.78)";
  ctx.fillStyle = text.color || "#ff304f";
  const label = text.text || `-${text.amount}`;
  ctx.strokeText(label, text.x, text.y);
  ctx.fillText(label, text.x, text.y);
  ctx.restore();
}

function stepGame(dt) {
  if (!game.over) {
    game.tick += 1;
    const prep = currentRoom?.prepState || currentRoom?.prep_state || {};
    processSkillEvents(prep);
    game.fighters.forEach(fighter => moveFighter(fighter, dt));
    handleFighterCollision();
    updateBalls(dt);
    updateGrapples(dt);
    updatePokerShots(dt);
    updateShockwaves(dt);
    updateDamageTexts(dt);
    updateSkillHud();
  }
}

function loop(now) {
  if (!game) return;
  const elapsed = clamp(now - game.lastTime, 0, 120);
  game.lastTime = now;
  game.accumulator += elapsed;

  let steps = 0;
  while (game.accumulator >= FIXED_STEP_MS && steps < 8) {
    stepGame(gameSpeed);
    game.accumulator -= FIXED_STEP_MS;
    steps += 1;
  }

  if (steps >= 8) {
    game.accumulator = 0;
  }

  drawArena();
  animationId = requestAnimationFrame(loop);
}

function setGameSpeed(speed) {
  gameSpeed = speed;
  ui.speedButtons.forEach(button => {
    button.classList.toggle("is-active", Number(button.dataset.speed) === speed);
  });
}

function stopGame() {
  if (animationId) cancelAnimationFrame(animationId);
  animationId = null;
  game = null;
}

function returnToLobby() {
  stopGame();
  stopSelectTimer();
  ui.resultOverlay.classList.remove("is-active");
  resetLocalMatchState();
  renderLobby();
  showScreen("lobby");
}

async function logout() {
  if (appSessionToken) {
    await rpc("cancel_pvp_match", { session_token: appSessionToken }).catch(() => {});
  }
  if (supabaseClient && appSessionToken) {
    await rpc("logout_user", { session_token: appSessionToken }).catch(() => {});
  }
  appSessionToken = "";
  currentUser = null;
  currentRoom = null;
  players = [];
  matchPlayers = { p1: "", p2: "" };
  localStorage.removeItem(APP_SESSION_KEY);
  stopSelectTimer();
  resetLocalMatchState();
  setMatchmakingPolling(false);
  resetMatchmakingUi("");
  setRoomRealtime(null);
  setRoomPolling(false);
  ui.authPassword.value = "";
  ui.authMessage.textContent = "";
  showScreen("auth");
}

ui.loginButton.addEventListener("click", () => authenticate("login"));
ui.logoutButton.addEventListener("click", logout);
ui.coinBadge.addEventListener("click", claimFreeCoins);
ui.signupButton.addEventListener("click", () => authenticate("signup"));
ui.openSignupButton.addEventListener("click", () => showScreen("signup"));
ui.backToLoginButton.addEventListener("click", () => showScreen("auth"));
ui.toggleLoginPassword.addEventListener("click", () => togglePassword(ui.authPassword, ui.toggleLoginPassword));
ui.toggleSignupPassword.addEventListener("click", () => togglePassword(ui.signupPassword, ui.toggleSignupPassword));
ui.authPassword.addEventListener("keydown", event => {
  if (event.key === "Enter") authenticate("login");
});
ui.signupPassword.addEventListener("keydown", event => {
  if (event.key === "Enter") authenticate("signup");
});
ui.lobbyPlayerOne.addEventListener("change", () => {
  setMatchPlayer("p1", ui.lobbyPlayerOne.value);
});
ui.lobbyPlayerTwo.addEventListener("change", () => {
  setMatchPlayer("p2", ui.lobbyPlayerTwo.value);
});
ui.gachaButton.addEventListener("click", drawCharacter);
ui.openGachaButton.addEventListener("click", openGachaScreen);
ui.backFromGachaButton.addEventListener("click", () => {
  renderLobby();
  showScreen("lobby");
});
ui.pvpModeButton.addEventListener("click", openPvpSetup);
ui.cancelMatchButton.addEventListener("click", cancelMatchmaking);
ui.pveModeButton.addEventListener("click", selectPveMode);
document.querySelectorAll("[data-lobby-tab]").forEach(button => {
  button.addEventListener("click", () => switchLobbyTab(button.dataset.lobbyTab));
});
ui.normalSkillButton.addEventListener("click", () => useSkill("normal"));
ui.ultimateSkillButton.addEventListener("click", () => useSkill("ultimate"));
document.addEventListener("keydown", event => {
  if (!game || screens.auth.classList.contains("is-active") || screens.signup.classList.contains("is-active")) return;
  if (event.key === "1") {
    event.preventDefault();
    useSkill("normal");
  }
  if (event.key === "2") {
    event.preventDefault();
    useSkill("ultimate");
  }
});

ui.cards.forEach(card => {
  card.addEventListener("click", () => {
    if (card.disabled) return;
    const player = card.dataset.player;
    document.querySelectorAll(`.fighter-card[data-player="${player}"]`).forEach(item => {
      item.classList.remove("is-selected");
    });
    card.classList.add("is-selected");
    selections[player] = card.dataset.character;
  });
});

ui.speedButtons.forEach(button => {
  button.addEventListener("click", () => setGameSpeed(Number(button.dataset.speed)));
});

ui.lobbyStartButton.addEventListener("click", prepareCharacterSelect);
ui.backFromPvpButton.addEventListener("click", () => showScreen("lobby"));
ui.toBetButton.addEventListener("click", submitCharacterReady);
ui.againButton.addEventListener("click", returnToLobby);

async function boot() {
  if (!supabaseClient) {
    ui.authMessage.textContent = "supabase-config.js 설정을 먼저 넣어주세요.";
    showScreen("auth");
    return;
  }

  if (!appSessionToken) {
    showScreen("auth");
    return;
  }

  try {
    await loadCurrentUser();
    showScreen("lobby");
  } catch {
    appSessionToken = "";
    localStorage.removeItem(APP_SESSION_KEY);
    showScreen("auth");
  }
}

boot();

