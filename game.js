const STORAGE_KEY = "matchzzang-arena-players";
const DEFAULT_CHARACTER = "thrower";
const GACHA_COST = 50;
const APP_SESSION_KEY = "matchzzang-supabase-session";
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
  currentUserCoins: document.getElementById("currentUserCoins"),
  roomCodeInput: document.getElementById("roomCodeInput"),
  createRoomButton: document.getElementById("createRoomButton"),
  joinRoomButton: document.getElementById("joinRoomButton"),
  leaveRoomButton: document.getElementById("leaveRoomButton"),
  roomCodeText: document.getElementById("roomCodeText"),
  roomCard: document.getElementById("roomCard"),
  roomCardCode: document.getElementById("roomCardCode"),
  roomPlayerList: document.getElementById("roomPlayerList"),
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
  backToLobbyButton: document.getElementById("backToLobbyButton"),
  toBetButton: document.getElementById("toBetButton"),
  againButton: document.getElementById("againButton"),
  betP1Input: document.getElementById("betP1Input"),
  betP2Input: document.getElementById("betP2Input"),
  betP1Name: document.getElementById("betP1Name"),
  betP2Name: document.getElementById("betP2Name"),
  betP1Coins: document.getElementById("betP1Coins"),
  betP2Coins: document.getElementById("betP2Coins"),
  betMessage: document.getElementById("betMessage"),
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
    canGrab: true
  }
};

const gachaPool = ["charger", "grabber"];

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

function normalizePlayer(user) {
  return {
    id: user.id,
    name: user.username ?? user.name,
    coins: user.coins,
    ownedCharacters: [...new Set([DEFAULT_CHARACTER, ...(user.ownedCharacters || user.owned_characters || [])])]
  };
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
}

function setRoomPolling(enabled) {
  if (roomPollId) {
    clearInterval(roomPollId);
    roomPollId = null;
  }
  if (enabled) {
    roomPollId = setInterval(() => {
      const shouldPoll = screens.lobby.classList.contains("is-active") || screens.pvp.classList.contains("is-active");
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
    ui.currentUserName.textContent = currentUser.name;
    ui.currentUserCoins.textContent = currentUser.coins;
  }
  ui.roomCodeText.textContent = currentRoom?.code ?? "없음";
  ui.roomCard.classList.toggle("is-hidden", !currentRoom);
  ui.leaveRoomButton.classList.toggle("is-hidden", !currentRoom);
  ui.roomCardCode.textContent = currentRoom?.code ?? "없음";
  ui.roomPlayerList.innerHTML = "";
  players.forEach(player => {
    const chip = document.createElement("div");
    chip.className = "room-player-chip";
    chip.innerHTML = `<span>${escapeHtml(player.name)}</span><strong>${player.coins}C</strong>`;
    ui.roomPlayerList.appendChild(chip);
  });

  ui.playerList.innerHTML = "";
  if (players.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-list";
    empty.textContent = "방을 만들거나 방 코드로 참가하세요.";
    ui.playerList.appendChild(empty);
  }

  players.forEach(player => {
    const ownedText = player.ownedCharacters.map(kind => characters[kind].name).join(", ");
    const item = document.createElement("div");
    item.className = "player-row";
    item.innerHTML = `
      <span title="${escapeHtml(ownedText)}">${escapeHtml(player.name)}</span>
      <strong>${player.coins}C</strong>
    `;
    ui.playerList.appendChild(item);
  });

  if (!getPlayer(matchPlayers.p1)) matchPlayers.p1 = players[0]?.id ?? "";
  if (!getPlayer(matchPlayers.p2)) matchPlayers.p2 = players.find(player => player.id !== matchPlayers.p1)?.id ?? "";
  renderPlayerOptions(ui.lobbyPlayerOne, matchPlayers.p1);
  renderPlayerOptions(ui.lobbyPlayerTwo, matchPlayers.p2);
  renderPlayerOptions(ui.gachaPlayer, ui.gachaPlayer.value || matchPlayers.p1);
  updateLobbyPreview();
}

function renderPlayerOptions(select, selectedId) {
  select.innerHTML = "";
  players.forEach(player => {
    const option = document.createElement("option");
    option.value = player.id;
    option.textContent = `${player.name} (${player.coins}C)`;
    select.appendChild(option);
  });
  select.value = getPlayer(selectedId) ? selectedId : players[0]?.id ?? "";
  select.disabled = players.length === 0;
}

function updateLobbyPreview() {
  const p1 = getPlayer(matchPlayers.p1);
  const p2 = getPlayer(matchPlayers.p2);

  ui.lobbyP1Name.textContent = p1?.name ?? "PLAYER 1";
  ui.lobbyP2Name.textContent = p2?.name ?? "PLAYER 2";
  ui.lobbyP1Coins.textContent = p1?.coins ?? 0;
  ui.lobbyP2Coins.textContent = p2?.coins ?? 0;

  const notEnoughPlayers = players.length < 2;
  const samePlayer = matchPlayers.p1 === matchPlayers.p2;
  const brokePlayer = (p1?.coins ?? 0) <= 0 || (p2?.coins ?? 0) <= 0;
  ui.lobbyStartButton.disabled = notEnoughPlayers || samePlayer || brokePlayer;
  ui.lobbyMessage.textContent = notEnoughPlayers
    ? "플레이어를 2명 이상 추가하세요."
    : samePlayer
      ? "서로 다른 플레이어를 골라야 합니다."
      : brokePlayer
        ? "코인이 0C인 플레이어는 참가할 수 없습니다."
        : "";
}

function openPvpSetup() {
  selectedMode = "pvp";
  ui.pvpModeButton.classList.add("is-selected");
  ui.pveModeButton.classList.remove("is-selected");
  ui.modeMessage.textContent = "";
  renderPlayerOptions(ui.lobbyPlayerOne, matchPlayers.p1);
  renderPlayerOptions(ui.lobbyPlayerTwo, matchPlayers.p2);
  updateLobbyPreview();
  updateBetFields();
  showScreen("pvp");
}

function selectPveMode() {
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
  matchPlayers.p1 = getPlayer(previousP1) ? previousP1 : players[0]?.id ?? "";
  matchPlayers.p2 = getPlayer(previousP2) && previousP2 !== matchPlayers.p1
    ? previousP2
    : players.find(player => player.id !== matchPlayers.p1)?.id ?? "";
  renderLobby();
  setRoomPolling(true);
  setRoomRealtime(currentRoom.code);
}

async function createRoom() {
  try {
    const room = await rpc("create_room", { session_token: appSessionToken });
    applyRoom(room);
  } catch (error) {
    ui.lobbyMessage.textContent = error.message;
  }
}

async function joinRoom() {
  const code = ui.roomCodeInput.value.trim().toUpperCase();
  if (!code) {
    ui.lobbyMessage.textContent = "방 코드를 입력하세요.";
    return;
  }
  try {
    const room = await rpc("join_room", { session_token: appSessionToken, room_code: code });
    applyRoom(room);
  } catch (error) {
    ui.lobbyMessage.textContent = error.message;
  }
}

async function leaveRoom() {
  if (!currentRoom) return;
  try {
    await rpc("leave_room", { session_token: appSessionToken, room_code: currentRoom.code });
    currentRoom = null;
    players = currentUser ? [currentUser] : [];
    matchPlayers.p1 = currentUser?.id ?? "";
    matchPlayers.p2 = "";
    setRoomRealtime(null);
    setRoomPolling(false);
    renderLobby();
  } catch (error) {
    ui.lobbyMessage.textContent = error.message;
  }
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
      currentRoom = null;
      players = currentUser ? [currentUser] : [];
      matchPlayers.p1 = currentUser?.id ?? "";
      matchPlayers.p2 = "";
      setRoomRealtime(null);
      setRoomPolling(false);
      renderLobby();
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
    ui.gachaReveal.querySelector("span").textContent = picked === "charger" ? "B" : "G";
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
  ui.selectP1Label.textContent = `PLAYER 1 - ${p1.name}`;
  ui.selectP2Label.textContent = `PLAYER 2 - ${p2.name}`;
  updateCharacterCards("p1", p1);
  updateCharacterCards("p2", p2);
  showScreen("select");
}

function updateBetFields() {
  const p1 = getPlayer(matchPlayers.p1);
  const p2 = getPlayer(matchPlayers.p2);
  if (!p1 || !p2) return;

  ui.betP1Name.textContent = p1.name;
  ui.betP2Name.textContent = p2.name;
  ui.betP1Coins.textContent = p1.coins;
  ui.betP2Coins.textContent = p2.coins;
  ui.betP1Input.max = p1.coins;
  ui.betP2Input.max = p2.coins;
  ui.betP1Input.value = clamp(Number(ui.betP1Input.value) || 10, 1, p1.coins);
  ui.betP2Input.value = clamp(Number(ui.betP2Input.value) || 10, 1, p2.coins);
  ui.betMessage.textContent = "각 플레이어가 자기 코인 안에서 따로 베팅합니다.";
}

function randomVelocity(speed) {
  const angle = Math.random() * Math.PI * 2;
  return {
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed
  };
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
    hp: 100,
    maxHp: 100,
    contactDamage: character.contactDamage,
    canThrow: character.canThrow,
    canGrab: character.canGrab,
    throwTimer: character.canThrow ? 180 : Infinity,
    grabTimer: character.canGrab ? 150 : Infinity,
    hitFlash: 0
  };
}

function resetGame() {
  const p1 = getPlayer(matchPlayers.p1);
  const p2 = getPlayer(matchPlayers.p2);
  const p1Bet = clamp(Number(ui.betP1Input.value) || 1, 1, p1.coins);
  const p2Bet = clamp(Number(ui.betP2Input.value) || 1, 1, p2.coins);
  ui.betP1Input.value = p1Bet;
  ui.betP2Input.value = p2Bet;

  game = {
    fighters: [
      makeFighter(selections.p1, "PLAYER 1", p1.id, 120, canvas.height / 2),
      makeFighter(selections.p2, "PLAYER 2", p2.id, canvas.width - 120, canvas.height / 2)
    ],
    balls: [],
    grapples: [],
    damageTexts: [],
    contactLock: false,
    over: false,
    lastTime: performance.now(),
    bets: { p1: p1Bet, p2: p2Bet }
  };

  ui.currentBet.textContent = `${game.bets.p1} / ${game.bets.p2}`;
  ui.hudP1Label.textContent = p1.name;
  ui.hudP2Label.textContent = p2.name;
  ui.playerOneName.textContent = game.fighters[0].name;
  ui.playerTwoName.textContent = game.fighters[1].name;
  ui.resultOverlay.classList.remove("is-active");
  updateHud();
}

function startGame() {
  resetGame();
  setGameSpeed(1);
  showScreen("game");
  if (animationId) cancelAnimationFrame(animationId);
  game.lastTime = performance.now();
  animationId = requestAnimationFrame(loop);
}

function updateHud() {
  const p1Hp = clamp(game.fighters[0].hp, 0, 100);
  const p2Hp = clamp(game.fighters[1].hp, 0, 100);
  ui.playerOneHealthText.textContent = Math.ceil(p1Hp);
  ui.playerTwoHealthText.textContent = Math.ceil(p2Hp);
  ui.playerOneHealthBar.style.width = `${p1Hp}%`;
  ui.playerTwoHealthBar.style.width = `${p2Hp}%`;
}

function damage(fighter, amount) {
  if (amount <= 0 || game.over) return;
  fighter.hp = clamp(fighter.hp - amount, 0, fighter.maxHp);
  fighter.hitFlash = 10;
  addDamageText(fighter.x, fighter.y - fighter.radius, amount);
  updateHud();
  if (fighter.hp <= 0) finishGame(fighter === game.fighters[0] ? game.fighters[1] : game.fighters[0]);
}

function contactDamagePair(a, b) {
  if (game.over) return;
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

function finishGame(winner) {
  if (game.over) return;
  game.over = true;
  const loser = winner === game.fighters[0] ? game.fighters[1] : game.fighters[0];
  const winnerPlayer = getPlayer(winner.ownerId);
  const loserPlayer = getPlayer(loser.ownerId);
  const loserBet = loser === game.fighters[0] ? game.bets.p1 : game.bets.p2;
  ui.resultTitle.textContent = `${winner.ownerName} 승리!`;
  ui.resultText.textContent = `${winner.name} 승. 정산 중...`;
  ui.resultOverlay.classList.add("is-active");
  settleMatch(winnerPlayer, loserPlayer, loserBet);
}

async function settleMatch(winnerPlayer, loserPlayer, loserBet) {
  try {
    const data = await rpc("settle_match", {
      session_token: appSessionToken,
      room_code: currentRoom?.code ?? "",
      winner_id: winnerPlayer.id,
      loser_id: loserPlayer.id,
      loser_bet: loserBet
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
    ui.resultText.textContent = `${characters[game.fighters.find(item => item.ownerId === updatedWinner.id)?.kind || DEFAULT_CHARACTER].name} 승. ${data.amount}C 획득. ${updatedWinner.name} ${updatedWinner.coins}C / ${updatedLoser.name} ${updatedLoser.coins}C`;
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

function moveFighter(fighter, dt) {
  fighter.x += fighter.vx * dt;
  fighter.y += fighter.vy * dt;
  const speed = Math.hypot(fighter.vx, fighter.vy);
  const targetSpeed = fighter.canThrow ? 5.9 : fighter.canGrab ? 6.2 : 6.8;
  if (speed !== 0) {
    fighter.vx = (fighter.vx / speed) * targetSpeed;
    fighter.vy = (fighter.vy / speed) * targetSpeed;
  }
  bounceOnWalls(fighter);

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
    color: owner.accent
  });
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

function updateBalls(dt) {
  game.balls = game.balls.filter(ball => {
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
        ball.vx = -Math.cos(angle) * 10.2;
        ball.vy = -Math.sin(angle) * 10.2;
        target.vx += Math.cos(angle) * 2.0;
        target.vy += Math.sin(angle) * 2.0;
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
  game.balls.forEach(drawBall);
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
  ctx.fillStyle = fighter.color;
  ctx.fill();
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
  ctx.restore();
  drawFighterHealthBar(fighter);
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
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = ball.color;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ball.x - 3, ball.y - 4, 3, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fill();
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
  ctx.fillStyle = "#ff304f";
  ctx.strokeText(`-${text.amount}`, text.x, text.y);
  ctx.fillText(`-${text.amount}`, text.x, text.y);
  ctx.restore();
}

function loop(now) {
  if (!game) return;
  const dt = clamp((now - game.lastTime) / 16.67, 0.4, 2) * gameSpeed;
  game.lastTime = now;
  if (!game.over) {
    game.fighters.forEach(fighter => moveFighter(fighter, dt));
    handleFighterCollision();
    updateBalls(dt);
    updateGrapples(dt);
    updateDamageTexts(dt);
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
  renderLobby();
  ui.resultOverlay.classList.remove("is-active");
  showScreen("lobby");
}

async function logout() {
  if (supabaseClient && appSessionToken) {
    await rpc("logout_user", { session_token: appSessionToken }).catch(() => {});
  }
  appSessionToken = "";
  currentUser = null;
  currentRoom = null;
  players = [];
  matchPlayers = { p1: "", p2: "" };
  localStorage.removeItem(APP_SESSION_KEY);
  setRoomRealtime(null);
  setRoomPolling(false);
  ui.authPassword.value = "";
  ui.authMessage.textContent = "";
  showScreen("auth");
}

ui.loginButton.addEventListener("click", () => authenticate("login"));
ui.logoutButton.addEventListener("click", logout);
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
ui.createRoomButton.addEventListener("click", createRoom);
ui.joinRoomButton.addEventListener("click", joinRoom);
ui.leaveRoomButton.addEventListener("click", leaveRoom);
ui.roomCodeInput.addEventListener("keydown", event => {
  if (event.key === "Enter") joinRoom();
});
ui.lobbyPlayerOne.addEventListener("change", () => {
  matchPlayers.p1 = ui.lobbyPlayerOne.value;
  updateLobbyPreview();
  updateBetFields();
});
ui.lobbyPlayerTwo.addEventListener("change", () => {
  matchPlayers.p2 = ui.lobbyPlayerTwo.value;
  updateLobbyPreview();
  updateBetFields();
});
ui.gachaButton.addEventListener("click", drawCharacter);
ui.openGachaButton.addEventListener("click", openGachaScreen);
ui.backFromGachaButton.addEventListener("click", () => {
  renderLobby();
  showScreen("lobby");
});
ui.pvpModeButton.addEventListener("click", openPvpSetup);
ui.pveModeButton.addEventListener("click", selectPveMode);

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

document.querySelectorAll(".chip-button").forEach(button => {
  button.addEventListener("click", () => {
    const input = button.dataset.betPlayer === "p1" ? ui.betP1Input : ui.betP2Input;
    const maxBet = Number(input.max);
    input.value = clamp(Number(input.value) + Number(button.dataset.chip), 1, maxBet);
  });
});

ui.lobbyStartButton.addEventListener("click", prepareCharacterSelect);
ui.backFromPvpButton.addEventListener("click", () => showScreen("lobby"));
ui.backToLobbyButton.addEventListener("click", () => showScreen("pvp"));
ui.toBetButton.addEventListener("click", startGame);
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

