const STORAGE_KEY = "matchzzang-arena-players";
const DEFAULT_CHARACTER = "thrower";
const GACHA_COST = 50;
const APP_SESSION_KEY = "matchzzang-supabase-session";
const FIXED_STEP_MS = 1000 / 60;
const NETWORK_BUFFER_TICKS = 18;
const SIMULATION_VERSION = "20260607l";
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
  pve: document.getElementById("pveScreen"),
  pveCharacter: document.getElementById("pveCharacterScreen"),
  pveBattle: document.getElementById("pveBattleScreen"),
  pvp: document.getElementById("pvpScreen"),
  select: document.getElementById("selectScreen"),
  game: document.getElementById("gameScreen")
};

const canvas = document.getElementById("arena");
const ctx = canvas.getContext("2d");
const pveCanvas = document.getElementById("pveArena");
const pveCtx = pveCanvas.getContext("2d");

const ui = {
  cards: document.querySelectorAll(".fighter-card"),
  authUsername: document.getElementById("authUsername"),
  authPassword: document.getElementById("authPassword"),
  loginButton: document.getElementById("loginButton"),
  patchNoteButton: document.getElementById("patchNoteButton"),
  patchNoteModal: document.getElementById("patchNoteModal"),
  patchNoteCloseButton: document.getElementById("patchNoteCloseButton"),
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
  inventoryGrid: document.getElementById("inventoryGrid"),
  codexCharacterList: document.getElementById("codexCharacterList"),
  codexOwnedCount: document.getElementById("codexOwnedCount"),
  codexDetail: document.getElementById("codexDetail"),
  codexPreview: document.getElementById("codexPreview"),
  codexPreviewInitial: document.getElementById("codexPreviewInitial"),
  codexOwnership: document.getElementById("codexOwnership"),
  codexCharacterName: document.getElementById("codexCharacterName"),
  codexSkillList: document.getElementById("codexSkillList"),
  rankingPodium: document.getElementById("rankingPodium"),
  rankingList: document.getElementById("rankingList"),
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
  backFromPveButton: document.getElementById("backFromPveButton"),
  pveStageButtons: document.querySelectorAll("[data-pve-stage]"),
  pveSelectedStageLabel: document.getElementById("pveSelectedStageLabel"),
  pveCharacterGrid: document.getElementById("pveCharacterGrid"),
  pveCharacterMessage: document.getElementById("pveCharacterMessage"),
  backToPveStagesButton: document.getElementById("backToPveStagesButton"),
  startPveBattleButton: document.getElementById("startPveBattleButton"),
  pvePlayerLabel: document.getElementById("pvePlayerLabel"),
  pvePlayerCharacter: document.getElementById("pvePlayerCharacter"),
  pvePlayerHealthBar: document.getElementById("pvePlayerHealthBar"),
  pvePlayerHealthText: document.getElementById("pvePlayerHealthText"),
  pveStageLabel: document.getElementById("pveStageLabel"),
  pveEnemyCount: document.getElementById("pveEnemyCount"),
  pveEnemyHealthBar: document.getElementById("pveEnemyHealthBar"),
  pveResultOverlay: document.getElementById("pveResultOverlay"),
  pveResultTitle: document.getElementById("pveResultTitle"),
  pveResultText: document.getElementById("pveResultText"),
  pveResultButton: document.getElementById("pveResultButton"),
  pveNormalSkillButton: document.getElementById("pveNormalSkillButton"),
  pveUltimateSkillButton: document.getElementById("pveUltimateSkillButton"),
  pveNormalSkillName: document.getElementById("pveNormalSkillName"),
  pveUltimateSkillName: document.getElementById("pveUltimateSkillName"),
  pveNormalSkillCooldown: document.getElementById("pveNormalSkillCooldown"),
  pveUltimateSkillCooldown: document.getElementById("pveUltimateSkillCooldown"),
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
  },
  enhancer: {
    name: "강화하는 색히",
    color: "#ff9f43",
    accent: "#ffe28a",
    contactDamage: 0
  },
  tank: {
    name: "개쳐맞는 색히",
    color: "#75808f",
    accent: "#d5dde8",
    contactDamage: 5
  },
  beamer: {
    name: "빔쏘는 색히",
    color: "#42a5ff",
    accent: "#a7efff",
    contactDamage: 0
  },
  wild: {
    name: "야생의힘쓰는 색히",
    color: "#78c850",
    accent: "#d8ff75",
    contactDamage: 0
  },
  vampire: {
    name: "피흡하는 색히",
    color: "#9c1647",
    accent: "#ff5f87",
    contactDamage: 0
  },
  brawler: {
    name: "맨몸격투하는 색히",
    color: "#d9823b",
    accent: "#ffd08a",
    contactDamage: 0
  }
};

const gachaPool = ["charger", "grabber", "poker", "stealth", "enhancer", "tank", "beamer", "wild", "vampire", "brawler"];

const skillNames = {
  thrower: { normal: "룩 온", ultimate: "스타 스트라이크" },
  charger: { normal: "격노", ultimate: "불가항력" },
  grabber: { normal: "그랩", ultimate: "충격파" },
  poker: { normal: "드로우", ultimate: "힐 다이스" },
  stealth: { normal: "암살", ultimate: "하이퍼 히든" },
  enhancer: { normal: "용광로", ultimate: "갓 웨폰" },
  tank: { normal: "도발", ultimate: "야수의 방패" },
  beamer: { normal: "슬로우 빔", ultimate: "절멸자" },
  wild: { normal: "추격", ultimate: "야생의 본능" },
  vampire: { normal: "흡혈", ultimate: "핏빛 서곡" },
  brawler: { normal: "투지", ultimate: "야수성" }
};

const characterGuide = {
  thrower: {
    attack: ["공 투척", "3초", "5의 피해를 주는 공을 발사합니다. 공은 벽과 캐릭터에 튕기며 지속시간 동안 남습니다."],
    normal: ["룩 온", "12초", "현재 맵에 있는 자신의 모든 공이 4초 동안 유도탄으로 변경됩니다."],
    ultimate: ["스타 스트라이크", "30초", "지속시간이 3배 긴 별의 탄환 2개를 발사합니다."]
  },
  charger: {
    attack: ["몸통 박치기", "접촉", "적에게 충돌하면 10의 피해를 주고 서로 튕겨납니다."],
    normal: ["격노", "10초", "3초 동안 이동속도가 크게 증가하고 몸의 색이 진해집니다."],
    ultimate: ["불가항력", "23초", "잠시 멈춰 힘을 모은 뒤 바라보는 방향으로 폭발적으로 돌진합니다. 캐릭터와 오오라에 닿은 적에게 40의 피해를 줍니다."]
  },
  grabber: {
    attack: ["그랩", "자동", "선을 발사해 적을 끌어당기고 20의 피해와 0.5초 기절을 줍니다."],
    normal: ["강화 그랩", "15초", "일반 그랩보다 사거리가 2배 길고 더 빠른 강화 그랩을 즉시 발사합니다."],
    ultimate: ["충격파", "28초", "주변 넓은 범위에 30의 피해를 주고 적을 1초 동안 기절시킵니다."]
  },
  poker: {
    attack: ["포커 핸드", "자동", "카드 5장을 공개하고 패의 배율이 적용된 비유도 카드 탄환을 발사합니다."],
    normal: ["드로우", "10초", "조커, 에이스, 킹, 퀸, 잭 중 카드 한 장을 던져 카드별 효과를 적용합니다."],
    ultimate: ["힐 다이스", "40초", "주사위를 굴려 나온 눈의 5배만큼 체력을 회복합니다."]
  },
  stealth: {
    attack: ["은신 돌파", "7초", "3초 동안 은신해 피해와 충돌을 무시하고 적을 관통할 때 15의 피해를 줍니다."],
    normal: ["암살", "15초", "은신 상태에서만 사용할 수 있으며 즉시 적의 뒤로 이동합니다."],
    ultimate: ["하이퍼 히든", "45초", "다음 은신이 1초 길어지고 이동속도가 크게 증가하며 관통 피해가 10으로 변경됩니다."]
  },
  enhancer: {
    attack: ["강화 타격", "2초당 강화", "적과 닿지 않은 동안 2초마다 공격력이 1 증가합니다. 충돌 시 현재 공격력만큼 피해를 줍니다. 최대 40."],
    normal: ["용광로", "10초", "다음 2번의 자연 강화에서 공격력이 총 2씩 증가합니다."],
    ultimate: ["갓 웨폰", "5초", "현재 공격력을 가진 무기를 추가 소환하고 공격력을 0으로 초기화합니다. 각 무기는 5초마다 공격합니다."]
  },
  tank: {
    attack: ["중장갑 충돌", "접촉", "충돌 시 5의 피해를 주며 받는 모든 피해가 20% 감소합니다."],
    normal: ["도발", "12초", "10의 피해를 주고 적의 이동 궤적을 자신에게 향하게 하며 2초 동안 스킬을 막습니다."],
    ultimate: ["야수의 방패", "40초", "3초 동안 움직이지 못하지만 피해가 90% 감소합니다. 종료 시 넓은 범위에 50의 피해와 3초 기절을 줍니다."]
  },
  beamer: {
    attack: ["천공 레이저", "3초", "적의 위치에 예고 후 세로 레이저를 포격해 45의 피해를 줍니다."],
    normal: ["슬로우 빔", "12초", "넓은 직선 빔으로 5의 피해를 주고 적을 3초 동안 느리게 만듭니다."],
    ultimate: ["절멸자", "60초", "3초 동안 천공 레이저의 공격 주기가 0.2초로 변경됩니다."]
  },
  wild: {
    attack: ["할퀴기", "3초", "맵의 무작위 위치 3곳을 할퀴어 범위 안의 적에게 20의 피해를 줍니다. 적과 충돌해도 발동합니다."],
    normal: ["추격", "18초", "5초 동안 속도가 3배가 되고 이동 방향이 계속 적을 향합니다."],
    ultimate: ["야생의 본능", "패시브", "상대 체력이 50% 이하가 되면 이동속도가 3.5배 증가합니다."]
  },
  vampire: {
    attack: ["피의 탄환", "3초", "벽에 튕기지 않는 빠른 피의 탄환을 발사합니다. 체력이 낮을수록 피해와 탄속이 증가합니다. 최대 피해 35."],
    normal: ["흡혈", "패시브", "자신이 입힌 피해의 30%만큼 체력을 회복합니다."],
    ultimate: ["핏빛 서곡", "50초", "현재 체력의 50%를 소모하고 3초 동안 공격속도 3배, 이동속도 2배를 얻습니다."]
  },
  brawler: {
    attack: ["맨몸 격투", "1초", "적이 가까이 들어오면 주먹을 날려 7의 피해를 줍니다."],
    normal: ["투지", "패시브", "체력이 50% 이하가 될 때 경기당 한 번 체력을 30% 회복하고 기본 공격력이 8 증가합니다."],
    ultimate: ["야수성", "패시브", "공격하지 못한 시간 동안 이동속도가 매초 6%씩 증가합니다."]
  }
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
let roomRefreshPending = false;
let roomRealtimeChannel = null;
let roomRealtimeCode = "";
let matchSelectionTouched = false;
let matchmakingPollId = null;
let selectedCharacterReady = false;
let selectCountdownId = null;
let selectDeadline = 0;
let matchmakingActive = false;
let matchmakingGeneration = 0;
let matchmakingRequestPending = false;
let matchTransitionRoomCode = "";
let matchTransitionTimeoutId = null;
let completedMatchTransitionRoomCode = "";
let matchRandomSeed = 1;
let matchStartTimeoutId = null;
let appliedSkillEvents = new Set();
let pendingSkillUse = false;
let resimulatingGame = false;
let settlementRequestedWinnerId = "";
let settlementTimeoutId = null;
let serverClockOffsetMs = 0;
let pveGame = null;
let pveAnimationId = null;
let pendingPveStage = "";
let selectedPveCharacter = DEFAULT_CHARACTER;

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

function serverNowMs() {
  return Date.now() + serverClockOffsetMs;
}

async function syncServerClock(sampleCount = 1) {
  if (!appSessionToken) return;
  let bestSample = null;
  for (let index = 0; index < sampleCount; index += 1) {
    const requestedAt = Date.now();
    const serverSeconds = Number(await rpc("get_server_time", { session_token: appSessionToken }));
    const receivedAt = Date.now();
    const roundTrip = receivedAt - requestedAt;
    const midpoint = requestedAt + roundTrip / 2;
    if (!bestSample || roundTrip < bestSample.roundTrip) {
      bestSample = {
        roundTrip,
        offset: serverSeconds * 1000 - midpoint
      };
    }
  }
  if (bestSample) serverClockOffsetMs = bestSample.offset;
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
  if (tabName === "inventory") renderInventory();
  if (tabName === "codex") renderCodex();
  if (tabName === "ranking") loadRankings();
}

function setPatchNotesOpen(open) {
  ui.patchNoteModal.classList.toggle("is-active", open);
  ui.patchNoteModal.setAttribute("aria-hidden", open ? "false" : "true");
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
        || screens.select.classList.contains("is-active")
        || screens.game.classList.contains("is-active");
      if (currentRoom && shouldPoll) {
        refreshRoom();
      }
    }, 250);
  }
}

function setRoomRealtime(roomCode) {
  if (roomRealtimeChannel && roomRealtimeCode === roomCode) return;
  if (roomRealtimeChannel) {
    supabaseClient?.removeChannel(roomRealtimeChannel);
    roomRealtimeChannel = null;
    roomRealtimeCode = "";
  }
  if (!roomCode || !supabaseClient) return;

  roomRealtimeCode = roomCode;
  roomRealtimeChannel = supabaseClient
    .channel(`room-${roomCode}`)
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "app_rooms",
      filter: `code=eq.${roomCode}`
    }, payload => {
      const row = payload?.new;
      if (!row?.prep_state || !currentRoom || currentRoom.code !== roomCode) {
        refreshRoom();
        return;
      }
      currentRoom = {
        ...currentRoom,
        ...row,
        prepState: row.prep_state
      };
      processSkillEvents(row.prep_state);
      if (row.prep_state.matchmaking && !row.prep_state.started && !game) {
        beginMatchedRoomTransition(roomCode, matchmakingGeneration);
      }
      maybeStartReadyMatch();
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
  ui.pvpModeButton.disabled = Boolean(matchTransitionRoomCode);
  ui.pvpModeButton.classList.remove("is-selected");
  ui.cancelMatchButton.classList.add("is-hidden");
  ui.modeMessage.textContent = message;
}

function resetLocalMatchState() {
  matchmakingGeneration += 1;
  matchmakingRequestPending = false;
  roomRefreshPending = false;
  matchTransitionRoomCode = "";
  completedMatchTransitionRoomCode = "";
  if (matchTransitionTimeoutId) {
    clearTimeout(matchTransitionTimeoutId);
    matchTransitionTimeoutId = null;
  }
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
  ui.pvpModeButton.disabled = false;
  ui.pvpModeButton.classList.remove("is-selected");
  ui.cancelMatchButton.classList.add("is-hidden");
  document.querySelectorAll(".select-panel").forEach(panel => panel.classList.remove("is-hidden"));
  showMatchOverlay("", false);
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
  renderInventory();
  renderCodex();
  updateLobbyPreview();
}

function characterInitial(kind) {
  return ({
    thrower: "T", charger: "B", grabber: "G", poker: "P", stealth: "S",
    enhancer: "E", tank: "D", beamer: "L", wild: "W", vampire: "V", brawler: "F"
  })[kind] || "?";
}

function renderInventory() {
  if (!ui.inventoryGrid || !currentUser) return;
  const owned = currentUser.ownedCharacters || [];
  ui.inventoryGrid.innerHTML = "";

  Object.entries(characters).forEach(([kind, character]) => {
    const unlocked = owned.includes(kind);
    const card = document.createElement("article");
    card.className = `inventory-card ${unlocked ? "is-owned" : "is-locked"}`;
    card.innerHTML = `
      <div class="inventory-orb" style="--char-color:${character.color}; --char-accent:${character.accent};">${unlocked ? characterInitial(kind) : "?"}</div>
      <div>
        <strong>${unlocked ? character.name : "미보유 캐릭터"}</strong>
        <span>${unlocked ? "보유중" : "상점에서 획득 가능"}</span>
      </div>
    `;
    ui.inventoryGrid.appendChild(card);
  });
}

function renderCodex(selectedKind = null) {
  if (!ui.codexCharacterList || !currentUser) return;
  const owned = currentUser.ownedCharacters || [];
  const activeKind = selectedKind
    || ui.codexCharacterList.querySelector(".is-active")?.dataset.character
    || DEFAULT_CHARACTER;

  ui.codexOwnedCount.textContent = `${owned.length} / ${Object.keys(characters).length} 보유`;
  ui.codexCharacterList.innerHTML = Object.entries(characters).map(([kind, character]) => {
    const unlocked = owned.includes(kind);
    return `
      <button class="codex-character-button ${kind === activeKind ? "is-active" : ""} ${unlocked ? "" : "is-locked"}"
        type="button" data-character="${kind}"
        style="--char-color:${character.color}; --char-accent:${character.accent};">
        <span class="codex-list-orb">${characterInitial(kind)}</span>
        <strong>${character.name}</strong>
        <em>${unlocked ? "보유" : "미보유"}</em>
      </button>
    `;
  }).join("");

  ui.codexCharacterList.querySelectorAll(".codex-character-button").forEach(button => {
    button.addEventListener("click", () => renderCodex(button.dataset.character));
  });
  renderCodexDetail(activeKind);
}

function renderCodexDetail(kind) {
  const character = characters[kind] || characters[DEFAULT_CHARACTER];
  const guide = characterGuide[kind] || characterGuide[DEFAULT_CHARACTER];
  const unlocked = currentUser?.ownedCharacters?.includes(kind);
  ui.codexDetail.style.setProperty("--char-color", character.color);
  ui.codexDetail.style.setProperty("--char-accent", character.accent);
  ui.codexPreview.style.setProperty("--char-color", character.color);
  ui.codexPreview.style.setProperty("--char-accent", character.accent);
  ui.codexPreviewInitial.textContent = characterInitial(kind);
  ui.codexCharacterName.textContent = character.name;
  ui.codexOwnership.textContent = unlocked ? "보유중" : "미보유";
  ui.codexOwnership.classList.toggle("is-locked", !unlocked);

  const skillTypes = [
    ["일반 공격", guide.attack],
    ["일반 스킬", guide.normal],
    ["궁극기", guide.ultimate]
  ];
  ui.codexSkillList.innerHTML = skillTypes.map(([type, skill]) => `
    <section class="codex-skill">
      <span>${type}</span>
      <h4>${skill[0]}</h4>
      <em>${skill[1]}</em>
      <p>${skill[2]}</p>
    </section>
  `).join("");
}

async function loadRankings() {
  if (!ui.rankingList || !currentUser) return;
  if (ui.rankingPodium) ui.rankingPodium.innerHTML = `<div class="ranking-podium-empty">TOP 3 집계 중...</div>`;
  ui.rankingList.innerHTML = `<div class="ranking-empty">랭킹을 불러오는 중...</div>`;

  try {
    const rankings = await rpc("get_rankings", { session_token: appSessionToken });
    renderRankings(Array.isArray(rankings) ? rankings : []);
  } catch (error) {
    if (ui.rankingPodium) ui.rankingPodium.innerHTML = "";
    ui.rankingList.innerHTML = `<div class="ranking-empty">${escapeHtml(error.message)}</div>`;
  }
}

function renderRankings(rankings) {
  if (!ui.rankingList) return;
  if (!rankings.length) {
    if (ui.rankingPodium) ui.rankingPodium.innerHTML = `<div class="ranking-podium-empty">아직 TOP 3가 없습니다.</div>`;
    ui.rankingList.innerHTML = `<div class="ranking-empty">아직 랭킹 데이터가 없습니다.</div>`;
    return;
  }

  renderRankingPodium(rankings.slice(0, 3));
  ui.rankingList.innerHTML = rankings.map((player, index) => {
    const lp = Number(player.lp ?? 1000);
    const tier = player.tier || tierForLp(lp);
    const tierClass = tierClassForLp(lp);
    const isMe = currentUser && player.id === currentUser.id;
    const podiumClass = index === 0 ? "is-first" : index === 1 ? "is-second" : index === 2 ? "is-third" : "";
    const rankMark = index === 0 ? "♛ 1" : index === 1 ? "◆ 2" : index === 2 ? "◆ 3" : index + 1;
    return `
      <article class="ranking-row ${podiumClass} ${isMe ? "is-me" : ""}">
        <b>${rankMark}</b>
        <div>
          <strong class="${tierClass}">${escapeHtml(player.name || player.username || "unknown")}</strong>
          <span class="${tierClass}">${tier}</span>
        </div>
        <em>${lp} LP</em>
      </article>
    `;
  }).join("");
}

function renderRankingPodium(topPlayers) {
  if (!ui.rankingPodium) return;
  const podiumOrder = [
    { rank: 2, player: topPlayers[1], className: "second" },
    { rank: 1, player: topPlayers[0], className: "first" },
    { rank: 3, player: topPlayers[2], className: "third" }
  ];
  ui.rankingPodium.innerHTML = `
    <div class="podium-light"></div>
    <div class="podium-sparks" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
    <div class="podium-stage">
      ${podiumOrder.map(slot => {
        if (!slot.player) {
          return `<article class="podium-slot ${slot.className} is-empty"><div class="podium-player">-</div><div class="podium-block"><b>${slot.rank}</b></div></article>`;
        }
        const lp = Number(slot.player.lp ?? 1000);
        const tier = slot.player.tier || tierForLp(lp);
        const tierClass = tierClassForLp(lp);
        return `
          <article class="podium-slot ${slot.className}">
            <div class="podium-player">
              <span>${slot.rank === 1 ? "♛" : "◆"}</span>
              <strong class="${tierClass}">${escapeHtml(slot.player.name || slot.player.username || "unknown")}</strong>
              <em>${lp} LP</em>
            </div>
            <div class="podium-block">
              <b>${slot.rank}</b>
              <small class="${tierClass}">${tier}</small>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;
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
  const generation = matchmakingGeneration;
  renderLobby();
  matchmakingActive = true;
  ui.pvpModeButton.classList.add("is-selected");
  ui.pveModeButton.classList.remove("is-selected");
  ui.cancelMatchButton.classList.remove("is-hidden");
  ui.modeMessage.textContent = "매칭중...";
  ui.pvpModeButton.disabled = true;
  await checkMatchmaking(generation);
  if (matchmakingActive && generation === matchmakingGeneration) setMatchmakingPolling(true);
}

async function checkMatchmaking(expectedGeneration = matchmakingGeneration) {
  if (!matchmakingActive || matchmakingRequestPending || expectedGeneration !== matchmakingGeneration) return;
  matchmakingRequestPending = true;
  try {
    const data = await rpc("find_pvp_match", { session_token: appSessionToken });
    if (!matchmakingActive || expectedGeneration !== matchmakingGeneration) return;
    if (!data.matched) {
      ui.modeMessage.textContent = `매칭중... ${data.elapsed ?? 0}초`;
      return;
    }
    resetMatchmakingUi("");
    applyRoom(data.room);
    syncServerClock(3).catch(() => {});
    beginMatchedRoomTransition(data.room.code, expectedGeneration);
  } catch (error) {
    if (expectedGeneration === matchmakingGeneration) {
      showMatchOverlay("", false);
      resetMatchmakingUi(error.message);
    }
  } finally {
    if (expectedGeneration === matchmakingGeneration) matchmakingRequestPending = false;
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
  ui.modeMessage.textContent = "";
  renderPveCharacterOptions();
  showScreen("pve");
}

function renderPveCharacterOptions() {
  if (!currentUser) return;
  if (!currentUser.ownedCharacters.includes(selectedPveCharacter)) {
    selectedPveCharacter = currentUser.ownedCharacters[0] || DEFAULT_CHARACTER;
  }
  ui.pveCharacterGrid.innerHTML = currentUser.ownedCharacters.map(kind => `
    <button class="fighter-card ${kind === selectedPveCharacter ? "is-selected" : ""}"
      type="button" data-pve-character="${kind}">
      <span class="fighter-icon" style="background:${characters[kind]?.color}; color:#071016">${characterInitial(kind)}</span>
      <strong>${characters[kind]?.name || kind}</strong>
    </button>
  `).join("");
  ui.pveCharacterGrid.querySelectorAll("[data-pve-character]").forEach(button => {
    button.addEventListener("click", () => {
      selectedPveCharacter = button.dataset.pveCharacter;
      renderPveCharacterOptions();
    });
  });
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
  await syncServerClock().catch(() => {});
  if (!currentRoom) {
    players = [currentUser];
    matchPlayers.p1 = currentUser.id;
    matchPlayers.p2 = "";
  }
  renderLobby();
}

function applyRoom(room) {
  const previousRoomCode = currentRoom?.code || "";
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
  if (previousRoomCode !== currentRoom.code) renderLobby();
  setRoomPolling(true);
  setRoomRealtime(currentRoom.code);
  processSkillEvents(prep);
  if (prep.matchmaking && !prep.started && !game) {
    beginMatchedRoomTransition(currentRoom.code, matchmakingGeneration);
  }
  maybeStartReadyMatch();
}

function beginMatchedRoomTransition(roomCode, expectedGeneration = matchmakingGeneration) {
  if (!roomCode || expectedGeneration !== matchmakingGeneration) return;
  if (screens.select.classList.contains("is-active") || screens.game.classList.contains("is-active")) return;
  if (completedMatchTransitionRoomCode === roomCode) return;
  if (matchTransitionRoomCode === roomCode) return;

  matchTransitionRoomCode = roomCode;
  if (matchTransitionTimeoutId) clearTimeout(matchTransitionTimeoutId);
  resetMatchmakingUi("");
  ui.pvpModeButton.disabled = true;
  showMatchOverlay("게임이 시작됩니다", true);

  matchTransitionTimeoutId = setTimeout(async () => {
    matchTransitionTimeoutId = null;
    if (expectedGeneration !== matchmakingGeneration
      || !currentRoom
      || currentRoom.code !== roomCode) {
      if (matchTransitionRoomCode === roomCode) {
        matchTransitionRoomCode = "";
        showMatchOverlay("", false);
      }
      return;
    }

    const entered = await enterCharacterSelectWhenReady(roomCode, expectedGeneration);
    if (!entered && expectedGeneration === matchmakingGeneration) {
      matchTransitionRoomCode = "";
      showMatchOverlay("", false);
      ui.pvpModeButton.disabled = false;
      ui.modeMessage.textContent = "매칭 정보를 불러오지 못했습니다. 다시 시도해주세요.";
    }
  }, 2000);
}

async function enterCharacterSelectWhenReady(roomCode, expectedGeneration) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    if (expectedGeneration !== matchmakingGeneration
      || !currentRoom
      || currentRoom.code !== roomCode) return false;

    if (prepareCharacterSelect()) {
      completedMatchTransitionRoomCode = roomCode;
      matchTransitionRoomCode = roomCode;
      showMatchOverlay("", false);
      return true;
    }

    try {
      const room = await rpc("get_room", {
        session_token: appSessionToken,
        room_code: roomCode
      });
      if (expectedGeneration !== matchmakingGeneration) return false;
      applyRoom(room);
    } catch {
      // The room may still be finishing its initial transaction. Retry briefly.
    }
    await wait(250);
  }
  return false;
}

async function refreshRoom() {
  if (roomRefreshPending) return;
  if (!currentRoom) {
    await loadCurrentUser();
    return;
  }
  const requestedRoomCode = currentRoom.code;
  roomRefreshPending = true;
  try {
    const room = await rpc("get_room", { session_token: appSessionToken, room_code: requestedRoomCode });
    if (!currentRoom || currentRoom.code !== requestedRoomCode) return;
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
  } finally {
    roomRefreshPending = false;
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
    ui.gachaReveal.querySelector("span").textContent = characterInitial(picked);
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
  if (selections[playerKey] !== "random" && !owned.includes(selections[playerKey])) {
    selections[playerKey] = owned[0] ?? DEFAULT_CHARACTER;
  }

  document.querySelectorAll(`.fighter-card[data-player="${playerKey}"]`).forEach(card => {
    const isRandom = card.dataset.character === "random";
    const isOwned = isRandom || owned.includes(card.dataset.character);
    const isSelected = selections[playerKey] === card.dataset.character;
    const name = card.querySelector("strong");
    card.disabled = !isOwned;
    card.classList.toggle("is-locked", !isOwned);
    card.classList.toggle("is-selected", isOwned && isSelected);
    if (name) name.textContent = isOwned ? name.dataset.name : "";
  });
}

function resolveRandomCharacter(player) {
  const owned = player?.ownedCharacters?.filter(kind => characters[kind]) || [DEFAULT_CHARACTER];
  if (!owned.length) return DEFAULT_CHARACTER;
  const seed = hashSeed(`${currentRoom?.code || "match"}|${player.id}|random-pick`);
  return owned[seed % owned.length];
}

function prepareCharacterSelect() {
  const p1 = getPlayer(matchPlayers.p1);
  const p2 = getPlayer(matchPlayers.p2);
  const mySlot = currentUser?.id === matchPlayers.p1 ? "p1" : currentUser?.id === matchPlayers.p2 ? "p2" : "";
  if (!currentRoom || !p1 || !p2 || !mySlot) return false;
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
  syncServerClock(3).catch(() => {});
  showScreen("select");
  startSelectTimer();
  return true;
}

async function submitCharacterReady() {
  if (!currentRoom || !currentUser) return;
  if (selectedCharacterReady) return;
  const mySlot = currentUser.id === matchPlayers.p1 ? "p1" : currentUser.id === matchPlayers.p2 ? "p2" : "";
  if (!mySlot) return;
  try {
    const selectedKind = selections[mySlot] === "random"
      ? resolveRandomCharacter(getPlayer(matchPlayers[mySlot]))
      : selections[mySlot];
    selections[mySlot] = selectedKind;
    updateCharacterCards(mySlot, getPlayer(matchPlayers[mySlot]));
    selectedCharacterReady = true;
    stopSelectTimer();
    ui.toBetButton.disabled = true;
    const room = await rpc("set_character_ready", {
      session_token: appSessionToken,
      room_code: currentRoom.code,
      character_kind: selectedKind,
      is_ready: true,
      simulation_version: SIMULATION_VERSION
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
  const delay = startAt ? Math.max(0, (startAt * 1000) - serverNowMs()) : 0;
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
    stealth: 900,
    enhancer: 600,
    tank: 720,
    beamer: 720,
    wild: 1080,
    vampire: 0,
    brawler: 0
  }[kind] ?? Infinity;
}

function ultimateCooldown(kind) {
  return {
    thrower: 1800,
    charger: 1380,
    grabber: 1680,
    poker: 2400,
    stealth: 2700,
    enhancer: 300,
    tank: 2400,
    beamer: 3600,
    wild: 0,
    vampire: 3000,
    brawler: 0
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
    hyperStealthActive: false,
    hyperStealthNext: false,
    stealthDamageCooldown: 0,
    skillTimer: kind === "vampire" || kind === "brawler" ? 0 : 480,
    ultimateTimer: kind === "wild" || kind === "brawler" ? 0 : 480,
    rageTime: 0,
    unstoppableWindup: 0,
    unstoppableDirectionX: 0,
    unstoppableDirectionY: 0,
    unstoppableTime: 0,
    unstoppableHit: false,
    stunTime: 0,
    slowTime: 0,
    hasteTime: 0,
    hitFlash: 0,
    lockOnTime: 0,
    lockOnPulse: 0,
    attackPower: kind === "enhancer" ? 1 : character.contactDamage,
    enhanceTimer: 120,
    furnaceCharges: 0,
    godWeapons: [],
    damageReduction: kind === "tank" ? 0.2 : 0,
    shieldTime: 0,
    shieldBlastPending: false,
    silenceTime: 0,
    beamTimer: kind === "beamer" ? 180 : Infinity,
    annihilatorTime: 0,
    annihilatorTimer: Infinity,
    wildTimer: kind === "wild" ? 180 : Infinity,
    chaseTime: 0,
    chaseBounceTime: 0,
    bloodTimer: kind === "vampire" ? 180 : Infinity,
    bloodPreludeTime: 0,
    punchTimer: 0,
    gritUsed: false,
    gritActive: false,
    idleAttackTime: 0
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
    areaAttacks: [],
    beams: [],
    weapons: [],
    damageTexts: [],
    visualEffects: [],
    contactLock: false,
    over: false,
    tick: 0,
    startTimeMs: Number((currentRoom?.prepState || currentRoom?.prep_state || {}).matchStartAt || 0) * 1000 || serverNowMs()
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
  settlementRequestedWinnerId = "";
  if (settlementTimeoutId) {
    clearTimeout(settlementTimeoutId);
    settlementTimeoutId = null;
  }
  gameSpeed = 1;
  showScreen("game");
  if (animationId) cancelAnimationFrame(animationId);
  updateSkillHud();
  animationId = requestAnimationFrame(loop);
}

function updateHud() {
  if (resimulatingGame) return;
  const p1Hp = clamp(game.fighters[0].hp, 0, game.fighters[0].maxHp);
  const p2Hp = clamp(game.fighters[1].hp, 0, game.fighters[1].maxHp);
  ui.playerOneHealthText.textContent = Math.ceil(p1Hp);
  ui.playerTwoHealthText.textContent = Math.ceil(p2Hp);
  ui.playerOneHealthBar.style.width = `${(p1Hp / game.fighters[0].maxHp) * 100}%`;
  ui.playerTwoHealthBar.style.width = `${(p2Hp / game.fighters[1].maxHp) * 100}%`;
}

function damage(fighter, amount, attacker = null) {
  if (amount <= 0 || game.over) return;
  if (fighter.stealthTime > 0) return;
  let finalAmount = amount;
  const reduction = fighter.shieldTime > 0 ? 0.9 : fighter.damageReduction;
  finalAmount *= 1 - reduction;
  finalAmount = Math.max(0, finalAmount);
  fighter.hp = clamp(fighter.hp - finalAmount, 0, fighter.maxHp);
  fighter.hitFlash = 10;
  addDamageText(fighter.x, fighter.y - fighter.radius, Math.round(finalAmount * 10) / 10);
  if (attacker?.kind === "vampire") {
    heal(attacker, finalAmount * 0.3);
  }
  if (fighter.kind === "brawler" && !fighter.gritUsed && fighter.hp <= fighter.maxHp * 0.5 && fighter.hp > 0) {
    fighter.gritUsed = true;
    fighter.gritActive = true;
    heal(fighter, fighter.maxHp * 0.3);
    addFloatingText(fighter.x, fighter.y - fighter.radius - 44, "투지!", fighter.accent);
  }
  updateHud();
  if (fighter.hp <= 0) finishGame(fighter === game.fighters[0] ? game.fighters[1] : game.fighters[0]);
}

function contactDamagePair(a, b) {
  if (game.over) return;
  if (a.stealthTime > 0 || b.stealthTime > 0) {
    if (a.stealthTime > 0 && a.stealthDamageCooldown <= 0) {
      damage(b, a.stealthDamage, a);
      a.stealthDamageCooldown = 24;
    }
    if (b.stealthTime > 0 && b.stealthDamageCooldown <= 0) {
      damage(a, b.stealthDamage, b);
      b.stealthDamageCooldown = 24;
    }
    return;
  }
  if (a.kind === "wild") createWildSlashes(a);
  if (b.kind === "wild") createWildSlashes(b);
  if (a.kind === "wild" && a.chaseTime > 0) {
    const angle = Math.atan2(a.y - b.y, a.x - b.x);
    a.vx = Math.cos(angle) * 10;
    a.vy = Math.sin(angle) * 10;
    a.slowTime = Math.max(a.slowTime, 45);
    a.chaseBounceTime = 30;
  }
  if (b.kind === "wild" && b.chaseTime > 0) {
    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    b.vx = Math.cos(angle) * 10;
    b.vy = Math.sin(angle) * 10;
    b.slowTime = Math.max(b.slowTime, 45);
    b.chaseBounceTime = 30;
  }
  const aDamage = a.kind === "enhancer" ? a.attackPower : a.contactDamage;
  const bDamage = b.kind === "enhancer" ? b.attackPower : b.contactDamage;
  if (a.kind === "charger" && b.kind === "charger" && a.hp <= bDamage && b.hp <= aDamage) {
    a.hp = 0;
    b.hp = 0;
    addDamageText(a.x, a.y - a.radius, bDamage);
    addDamageText(b.x, b.y - b.radius, aDamage);
    updateHud();
    finishDraw();
    return;
  }
  if (bDamage > 0) damage(a, bDamage, b);
  if (aDamage > 0 && !game.over) damage(b, aDamage, a);
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

function addVisualEffect(effect) {
  if (!game) return;
  game.visualEffects.push({
    ...effect,
    maxLife: effect.maxLife || effect.life || 30
  });
}

function finishGame(winner) {
  if (game.over) return;
  game.over = true;
  game.winner = winner;
  if (resimulatingGame) return;
  presentGameWinner(winner);
}

function presentGameWinner(winner) {
  const loser = winner === game.fighters[0] ? game.fighters[1] : game.fighters[0];
  const winnerPlayer = getPlayer(winner.ownerId);
  const loserPlayer = getPlayer(loser.ownerId);
  ui.resultTitle.textContent = `${winner.ownerName} 승리!`;
  ui.resultText.textContent = `${winner.name} 승. 정산 중...`;
  ui.resultOverlay.classList.add("is-active");
  if (settlementRequestedWinnerId !== winner.ownerId) {
    if (settlementTimeoutId) clearTimeout(settlementTimeoutId);
    settlementRequestedWinnerId = winner.ownerId;
    settlementTimeoutId = setTimeout(() => {
      settlementTimeoutId = null;
      settleMatch(winnerPlayer, loserPlayer);
    }, 700);
  }
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
  game.draw = true;
  if (resimulatingGame) return;
  presentGameDraw();
}

function presentGameDraw() {
  if (settlementTimeoutId) {
    clearTimeout(settlementTimeoutId);
    settlementTimeoutId = null;
    settlementRequestedWinnerId = "";
  }
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
  fighter.stealthDamage = hyper ? 10 : 15;
  fighter.hyperStealthActive = hyper;
  fighter.hyperStealthNext = false;
  addVisualEffect({
    type: hyper ? "hyper-stealth" : "stealth",
    fighter,
    life: hyper ? 58 : 42,
    maxLife: hyper ? 58 : 42,
    color: fighter.accent
  });
  addFloatingText(fighter.x, fighter.y - fighter.radius - 44, hyper ? "하이퍼 히든!" : "은신", fighter.accent);
}

function heal(fighter, amount) {
  if (amount <= 0 || game.over) return;
  fighter.hp = clamp(fighter.hp + amount, 0, fighter.maxHp);
  const shownAmount = Math.round(amount * 10) / 10;
  addFloatingText(fighter.x, fighter.y - fighter.radius - 28, `+${shownAmount}`, "#7bd88f");
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
    target.lockOnTime = 90;
    target.lockOnPulse = 0;
    addFloatingText(fighter.x, fighter.y - fighter.radius - 44, count ? "룩 온!" : "룩 온", fighter.accent);
    fighter.skillTimer = 720;
    return;
  }

  if (fighter.kind === "charger") {
    fighter.rageTime = 180;
    addVisualEffect({
      type: "rage-burst",
      fighter,
      life: 34,
      maxLife: 34,
      color: fighter.color
    });
    addFloatingText(fighter.x, fighter.y - fighter.radius - 44, "격노!", fighter.accent);
    fighter.skillTimer = 600;
    return;
  }

  if (fighter.kind === "grabber") {
    throwGrapple(fighter, true);
    addFloatingText(fighter.x, fighter.y - fighter.radius - 44, "강화 그랩!", fighter.accent);
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
    return;
  }

  if (fighter.kind === "enhancer") {
    fighter.furnaceCharges = 2;
    addFloatingText(fighter.x, fighter.y - fighter.radius - 44, "용광로!", fighter.accent);
    fighter.skillTimer = 600;
    return;
  }

  if (fighter.kind === "tank") {
    const target = opponentOf(fighter);
    damage(target, 10, fighter);
    const angle = Math.atan2(fighter.y - target.y, fighter.x - target.x);
    const speed = Math.hypot(target.vx, target.vy) || 6.8;
    target.vx = Math.cos(angle) * speed;
    target.vy = Math.sin(angle) * speed;
    target.silenceTime = Math.max(target.silenceTime, 120);
    addFloatingText(fighter.x, fighter.y - fighter.radius - 44, "도발!", fighter.accent);
    fighter.skillTimer = 720;
    return;
  }

  if (fighter.kind === "beamer") {
    fireSlowBeam(fighter);
    fighter.stunTime = Math.max(fighter.stunTime, 18);
    fighter.skillTimer = 720;
    return;
  }

  if (fighter.kind === "wild") {
    fighter.chaseTime = 300;
    addFloatingText(fighter.x, fighter.y - fighter.radius - 44, "추격!", fighter.accent);
    fighter.skillTimer = 1080;
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
    fighter.unstoppableDirectionX = fighter.vx / speed;
    fighter.unstoppableDirectionY = fighter.vy / speed;
    fighter.vx = 0;
    fighter.vy = 0;
    fighter.unstoppableWindup = 24;
    fighter.unstoppableTime = 0;
    fighter.unstoppableHit = false;
    addFloatingText(fighter.x, fighter.y - fighter.radius - 44, "집중...", fighter.accent);
    fighter.ultimateTimer = 1380;
    return;
  }

  if (fighter.kind === "grabber") {
    createShockwave(fighter);
    fighter.ultimateTimer = 1680;
    return;
  }

  if (fighter.kind === "poker") {
    const roll = Math.floor(seededRandom() * 6) + 1;
    heal(fighter, roll * 5);
    addFloatingText(fighter.x, fighter.y - fighter.radius - 62, `${roll}`, fighter.accent);
    addFloatingText(fighter.x, fighter.y - fighter.radius - 42, "힐 다이스", "#7bd88f");
    fighter.ultimateTimer = 2400;
    return;
  }

  if (fighter.kind === "stealth") {
    fighter.hyperStealthNext = true;
    addFloatingText(fighter.x, fighter.y - fighter.radius - 44, "하이퍼 히든!", fighter.accent);
    fighter.ultimateTimer = 2700;
    return;
  }

  if (fighter.kind === "enhancer") {
    fighter.godWeapons.push({
      power: fighter.attackPower,
      timer: 1
    });
    fighter.attackPower = 0;
    addFloatingText(fighter.x, fighter.y - fighter.radius - 44, "갓 웨폰!", fighter.accent);
    fighter.ultimateTimer = 300;
    return;
  }

  if (fighter.kind === "tank") {
    fighter.shieldTime = 180;
    fighter.shieldBlastPending = true;
    addFloatingText(fighter.x, fighter.y - fighter.radius - 44, "야수의 방패!", fighter.accent);
    fighter.ultimateTimer = 2400;
    return;
  }

  if (fighter.kind === "beamer") {
    fighter.annihilatorTime = 180;
    fighter.beamTimer = 1;
    addFloatingText(fighter.x, fighter.y - fighter.radius - 44, "절멸자!", fighter.accent);
    fighter.ultimateTimer = 3600;
    return;
  }

  if (fighter.kind === "vampire") {
    fighter.hp = Math.max(1, fighter.hp * 0.5);
    fighter.bloodPreludeTime = 180;
    fighter.bloodTimer = Math.min(fighter.bloodTimer, 60);
    addFloatingText(fighter.x, fighter.y - fighter.radius - 44, "핏빛 서곡!", fighter.accent);
    updateHud();
    fighter.ultimateTimer = 3000;
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
  if (!fighter || game?.over || fighter.stunTime > 0 || fighter.silenceTime > 0) return false;
  if (type === "normal") {
    if (fighter.kind === "vampire" || fighter.kind === "brawler") return false;
    if (fighter.skillTimer > 0) return false;
    if (fighter.kind === "stealth" && fighter.stealthTime <= 0) return false;
    return true;
  }
  if (fighter.kind === "wild" || fighter.kind === "brawler") return false;
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
  const hasLateEvent = !resimulatingGame && events.some(event => {
    const eventId = event.id || `${event.actorId || event.actor_id}-${event.type}-${event.createdAt || event.created_at}`;
    const applyTick = Number(event.applyTick ?? event.apply_tick ?? 0);
    return eventId && !appliedSkillEvents.has(eventId) && applyTick > 0 && applyTick < game.tick;
  });
  if (hasLateEvent) {
    resimulateGameToTick(game.tick);
    return;
  }
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
  if (resimulatingGame) return;
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
  if (fighter.lockOnTime > 0) {
    fighter.lockOnTime -= dt;
    fighter.lockOnPulse += dt;
  }
}

function moveFighter(fighter, dt) {
  if (fighter.silenceTime > 0) fighter.silenceTime -= dt;
  if (fighter.stunTime > 0) {
    fighter.stunTime -= dt;
    if (fighter.skillTimer > 0) fighter.skillTimer -= dt;
    if (fighter.ultimateTimer > 0) fighter.ultimateTimer -= dt;
    if (fighter.rageTime > 0) fighter.rageTime -= dt;
    if (fighter.unstoppableTime > 0) fighter.unstoppableTime -= dt;
    if (fighter.slowTime > 0) fighter.slowTime -= dt;
    if (fighter.hasteTime > 0) fighter.hasteTime -= dt;
    if (fighter.stealthTime > 0) fighter.stealthTime -= dt;
    if (fighter.stealthTime <= 0) fighter.hyperStealthActive = false;
    if (fighter.stealthDamageCooldown > 0) fighter.stealthDamageCooldown -= dt;
    if (fighter.lockOnTime > 0) {
      fighter.lockOnTime -= dt;
      fighter.lockOnPulse += dt;
    }
    fighter.vx *= 0.82;
    fighter.vy *= 0.82;
    if (fighter.hitFlash > 0) fighter.hitFlash -= dt;
    return;
  }
  if (fighter.unstoppableWindup > 0) {
    fighter.unstoppableWindup -= dt;
    fighter.vx = 0;
    fighter.vy = 0;
    updateSkills(fighter, dt);
    if (fighter.unstoppableWindup <= 0) {
      fighter.vx = fighter.unstoppableDirectionX * 6.8;
      fighter.vy = fighter.unstoppableDirectionY * 6.8;
      fighter.unstoppableTime = 55;
      addVisualEffect({
        type: "unstoppable-burst",
        fighter,
        life: 42,
        maxLife: 42,
        color: fighter.color
      });
      addFloatingText(fighter.x, fighter.y - fighter.radius - 44, "불가항력!", fighter.accent);
    }
    return;
  }
  if (fighter.shieldTime <= 0) {
    fighter.x += fighter.vx * dt;
    fighter.y += fighter.vy * dt;
  }
  const speed = Math.hypot(fighter.vx, fighter.vy);
  const baseSpeed = fighter.stealthTime > 0
    ? fighter.hyperStealthActive ? 125 : 12.5
    : fighter.canThrow
      ? 5.9
      : fighter.canGrab
        ? 6.2
        : fighter.kind === "tank"
          ? 5.7
          : fighter.kind === "brawler"
            ? 7.1
            : 6.8;
  const target = opponentOf(fighter);
  if (fighter.chaseTime > 0 && fighter.chaseBounceTime <= 0) {
    const angle = Math.atan2(target.y - fighter.y, target.x - fighter.x);
    fighter.vx = Math.cos(angle) * Math.max(baseSpeed * 3, speed);
    fighter.vy = Math.sin(angle) * Math.max(baseSpeed * 3, speed);
  }
  const wildInstinct = fighter.kind === "wild" && target.hp <= target.maxHp * 0.5 ? 3.5 : 1;
  const brawlerRamp = fighter.kind === "brawler" ? 1 + fighter.idleAttackTime / 60 * 0.06 : 1;
  const targetSpeed = baseSpeed
    * (fighter.rageTime > 0 ? 1.55 : 1)
    * (fighter.hasteTime > 0 ? 1.35 : 1)
    * (fighter.slowTime > 0 ? 0.58 : 1)
    * (fighter.unstoppableTime > 0 ? 3.525 : 1)
    * (fighter.chaseTime > 0 ? 3 : 1)
    * (fighter.bloodPreludeTime > 0 ? 2 : 1)
    * wildInstinct
    * brawlerRamp;
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
      damage(target, 40, fighter);
      fighter.unstoppableHit = true;
    }
  }
  if (fighter.slowTime > 0) fighter.slowTime -= dt;
  if (fighter.hasteTime > 0) fighter.hasteTime -= dt;
  if (fighter.chaseTime > 0) fighter.chaseTime -= dt;
  if (fighter.chaseBounceTime > 0) fighter.chaseBounceTime -= dt;
  if (fighter.bloodPreludeTime > 0) fighter.bloodPreludeTime -= dt;

  if (fighter.kind === "enhancer") {
    fighter.enhanceTimer -= dt;
    if (fighter.enhanceTimer <= 0) {
      fighter.attackPower = Math.min(40, fighter.attackPower + (fighter.furnaceCharges > 0 ? 2 : 1));
      if (fighter.furnaceCharges > 0) fighter.furnaceCharges -= 1;
      fighter.enhanceTimer = 120;
    }
    fighter.godWeapons.forEach(weapon => {
      weapon.timer -= dt;
      if (weapon.timer <= 0) {
        launchGodWeapon(fighter, weapon.power);
        weapon.timer = 300;
      }
    });
  }

  if (fighter.kind === "tank" && fighter.shieldTime > 0) {
    fighter.shieldTime -= dt;
    fighter.vx = 0;
    fighter.vy = 0;
    if (fighter.shieldTime <= 0 && fighter.shieldBlastPending) {
      fighter.shieldBlastPending = false;
      createTankBlast(fighter);
    }
  }

  if (fighter.kind === "beamer") {
    fighter.beamTimer -= dt;
    if (fighter.beamTimer <= 0) {
      createSkyLaser(fighter);
      fighter.beamTimer = fighter.annihilatorTime > 0 ? 12 : 180;
    }
    if (fighter.annihilatorTime > 0) fighter.annihilatorTime -= dt;
  }

  if (fighter.kind === "wild") {
    fighter.wildTimer -= dt;
    if (fighter.wildTimer <= 0) {
      createWildSlashes(fighter);
      fighter.wildTimer = 180;
    }
  }

  if (fighter.kind === "vampire") {
    fighter.bloodTimer -= dt;
    if (fighter.bloodTimer <= 0) {
      fireBloodBullet(fighter);
      fighter.bloodTimer = fighter.bloodPreludeTime > 0 ? 60 : 180;
    }
  }

  if (fighter.kind === "brawler") {
    if (fighter.punchTimer > 0) fighter.punchTimer -= dt;
    fighter.idleAttackTime += dt;
    const distance = Math.hypot(target.x - fighter.x, target.y - fighter.y);
    if (distance < fighter.radius + target.radius + 52 && fighter.punchTimer <= 0) {
      punchTarget(fighter, target);
    }
  }

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
    if (fighter.stealthTime <= 0) fighter.hyperStealthActive = false;
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
    vx: Math.cos(angle) * 12.4,
    vy: Math.sin(angle) * 12.4,
    radius: 11,
    life: 420,
    hitCooldown: 0,
    damage: 5,
    speed: 12.4,
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

function throwGrapple(owner, enhanced = false) {
  if (!owner.canGrab || game.over) return;
  const target = owner === game.fighters[0] ? game.fighters[1] : game.fighters[0];
  const angle = Math.atan2(target.y - owner.y, target.x - owner.x);
  game.grapples.push({
    owner,
    angle,
    length: owner.radius + 8,
    maxLength: enhanced ? 940 : 470,
    speed: enhanced ? 19 : 11,
    enhanced,
    hit: false,
    life: 50
  });
}

function createShockwave(owner) {
  const target = opponentOf(owner);
  const range = 192;
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
    damage(target, 30, owner);
    target.stunTime = Math.max(target.stunTime, 60);
    target.vx *= 0.25;
    target.vy *= 0.25;
  }
  addFloatingText(owner.x, owner.y - owner.radius - 44, "충격파!", owner.accent);
}

function fireSlowBeam(owner) {
  const target = opponentOf(owner);
  const angle = Math.atan2(target.y - owner.y, target.x - owner.x);
  game.beams.push({
    type: "slow",
    owner,
    x1: owner.x,
    y1: owner.y,
    x2: owner.x + Math.cos(angle) * 760,
    y2: owner.y + Math.sin(angle) * 760,
    life: 36,
    maxLife: 36,
    delay: 18,
    hit: false,
    color: owner.accent
  });
}

function createSkyLaser(owner) {
  const target = opponentOf(owner);
  game.areaAttacks.push({
    type: "laser",
    owner,
    x: target.x,
    y: target.y,
    radius: 62,
    delay: 60,
    life: 84,
    hit: false,
    damage: 45,
    color: owner.accent
  });
}

function createWildSlashes(owner, x = null, y = null) {
  for (let index = 0; index < 3; index += 1) {
    game.areaAttacks.push({
      type: "slash",
      owner,
      x: x ?? 70 + seededRandom() * (canvas.width - 140),
      y: y ?? 70 + seededRandom() * (canvas.height - 140),
      radius: 58,
      delay: 28 + index * 8,
      life: 55 + index * 8,
      hit: false,
      damage: 20,
      color: owner.accent,
      angle: seededRandom() * Math.PI
    });
  }
}

function fireBloodBullet(owner) {
  const target = opponentOf(owner);
  const hpMissing = 1 - owner.hp / owner.maxHp;
  const damageAmount = 10 + hpMissing * 25;
  const speed = 12.5 + hpMissing * 9.5;
  const angle = Math.atan2(target.y - owner.y, target.x - owner.x);
  game.balls.push({
    owner,
    x: owner.x + Math.cos(angle) * (owner.radius + 18),
    y: owner.y + Math.sin(angle) * (owner.radius + 18),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: 12,
    life: 300,
    hitCooldown: 0,
    damage: damageAmount,
    speed,
    color: "#ff174f",
    homing: false,
    star: false,
    blood: true
  });
}

function launchGodWeapon(owner, power) {
  const target = opponentOf(owner);
  const angle = Math.atan2(target.y - owner.y, target.x - owner.x);
  game.weapons.push({
    owner,
    target,
    x: owner.x,
    y: owner.y,
    vx: Math.cos(angle) * 13,
    vy: Math.sin(angle) * 13,
    damage: power,
    returning: false,
    hit: false,
    life: 150,
    color: owner.accent
  });
}

function createTankBlast(owner) {
  const target = opponentOf(owner);
  const range = 261;
  game.shockwaves.push({
    owner,
    x: owner.x,
    y: owner.y,
    radius: 28,
    maxRadius: range,
    life: 42,
    color: "#d5dde8"
  });
  if (Math.hypot(target.x - owner.x, target.y - owner.y) < target.radius + range) {
    damage(target, 50, owner);
    target.stunTime = Math.max(target.stunTime, 180);
  }
}

function punchTarget(owner, target) {
  const damageAmount = 7 + (owner.gritActive ? 8 : 0);
  damage(target, damageAmount, owner);
  owner.punchTimer = 60;
  owner.idleAttackTime = 0;
  addVisualEffect({
    type: "rage-burst",
    fighter: target,
    life: 18,
    maxLife: 18,
    color: owner.accent
  });
}

function throwDrawCard(owner) {
  const target = opponentOf(owner);
  const cards = ["JOKER", "A", "K", "Q", "J"];
  const type = cards[Math.floor(seededRandom() * cards.length)];
  const angle = Math.atan2(target.y - owner.y, target.x - owner.x);
  const damageByType = {
    JOKER: Math.floor(seededRandom() * 45) + 1,
    A: 7.5,
    K: 0,
    Q: 7.5,
    J: 4.5
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
  const startX = owner.x;
  const startY = owner.y;
  const targetSpeed = Math.hypot(target.vx, target.vy);
  const nx = targetSpeed > 0.2 ? target.vx / targetSpeed : (target.x - owner.x) / (Math.hypot(target.x - owner.x, target.y - owner.y) || 1);
  const ny = targetSpeed > 0.2 ? target.vy / targetSpeed : (target.y - owner.y) / (Math.hypot(target.x - owner.x, target.y - owner.y) || 1);
  owner.x = target.x - nx * (target.radius + owner.radius + 10);
  owner.y = target.y - ny * (target.radius + owner.radius + 10);
  owner.vx = nx * 13;
  owner.vy = ny * 13;
  bounceOnWalls(owner);
  addVisualEffect({
    type: "assassinate-slash",
    x1: startX,
    y1: startY,
    x2: owner.x,
    y2: owner.y,
    color: owner.accent,
    life: 24,
    maxLife: 24
  });
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
      damage: 2.25 * multiplier,
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
    if (!ball.blood) bounceOnWalls(ball);

    for (const target of game.fighters) {
      const dx = target.x - ball.x;
      const dy = target.y - ball.y;
      if (Math.hypot(dx, dy) < target.radius + ball.radius && ball.hitCooldown <= 0) {
        if (target !== ball.owner) {
          damage(target, ball.damage, ball.owner);
          if (ball.slow) target.slowTime = Math.max(target.slowTime, 180);
          if (ball.blood) return false;
        }
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
    return ball.life > 0
      && (ball.blood
        ? ball.x > -40 && ball.x < canvas.width + 40 && ball.y > -40 && ball.y < canvas.height + 40
        : true);
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
      damage(target, 20, grapple.owner);
      target.stunTime = Math.max(target.stunTime, 30);
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
  damage(card.target, card.damage, card.owner);
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

function updateAreaAttacks(dt) {
  game.areaAttacks = game.areaAttacks.filter(attack => {
    attack.delay -= dt;
    attack.life -= dt;
    if (attack.delay <= 0 && !attack.hit) {
      attack.hit = true;
      const target = opponentOf(attack.owner);
      const hitsImpactArea = Math.hypot(target.x - attack.x, target.y - attack.y) < target.radius + attack.radius;
      const hitsLaserColumn = attack.type === "laser"
        && Math.abs(target.x - attack.x) < target.radius + 18;
      if (hitsImpactArea || hitsLaserColumn) {
        damage(target, attack.damage, attack.owner);
      }
    }
    return attack.life > 0;
  });
}

function updateBeams(dt) {
  game.beams = game.beams.filter(beam => {
    beam.delay -= dt;
    beam.life -= dt;
    if (beam.delay <= 0 && !beam.hit) {
      beam.hit = true;
      const target = opponentOf(beam.owner);
      const lineDx = beam.x2 - beam.x1;
      const lineDy = beam.y2 - beam.y1;
      const lengthSquared = lineDx * lineDx + lineDy * lineDy || 1;
      const t = clamp(((target.x - beam.x1) * lineDx + (target.y - beam.y1) * lineDy) / lengthSquared, 0, 1);
      const closestX = beam.x1 + lineDx * t;
      const closestY = beam.y1 + lineDy * t;
      if (Math.hypot(target.x - closestX, target.y - closestY) < target.radius + 42) {
        damage(target, 5, beam.owner);
        target.slowTime = Math.max(target.slowTime, 180);
      }
    }
    return beam.life > 0;
  });
}

function updateWeapons(dt) {
  game.weapons = game.weapons.filter(weapon => {
    weapon.life -= dt;
    const destination = weapon.returning ? weapon.owner : weapon.target;
    const angle = Math.atan2(destination.y - weapon.y, destination.x - weapon.x);
    weapon.vx = Math.cos(angle) * 13;
    weapon.vy = Math.sin(angle) * 13;
    weapon.x += weapon.vx * dt;
    weapon.y += weapon.vy * dt;
    if (!weapon.returning && Math.hypot(weapon.target.x - weapon.x, weapon.target.y - weapon.y) < weapon.target.radius + 18) {
      if (!weapon.hit) damage(weapon.target, weapon.damage, weapon.owner);
      weapon.hit = true;
      weapon.returning = true;
    }
    if (weapon.returning && Math.hypot(weapon.owner.x - weapon.x, weapon.owner.y - weapon.y) < weapon.owner.radius + 14) {
      return false;
    }
    return weapon.life > 0;
  });
}

function updateDamageTexts(dt) {
  game.damageTexts = game.damageTexts.filter(text => {
    text.y += text.vy * dt;
    text.life -= dt;
    return text.life > 0;
  });
}

function updateVisualEffects(dt) {
  game.visualEffects = game.visualEffects.filter(effect => {
    effect.life -= dt;
    return effect.life > 0;
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
  game.areaAttacks.forEach(drawAreaAttack);
  game.beams.forEach(drawBeam);
  game.weapons.forEach(drawWeapon);
  game.balls.forEach(drawBall);
  game.pokerShots.forEach(drawPokerShot);
  game.visualEffects.filter(effect => effect.type !== "assassinate-slash").forEach(drawVisualEffect);
  game.fighters.forEach(drawFighter);
  game.visualEffects.filter(effect => effect.type === "assassinate-slash").forEach(drawVisualEffect);
  game.damageTexts.forEach(drawDamageText);
}

function drawVisualEffect(effect) {
  if (effect.type === "assassinate-slash") {
    drawAssassinateSlash(effect);
    return;
  }
  if (effect.type === "unstoppable-burst") {
    drawExpandingBurst(effect, 74, 142, 8);
    return;
  }
  if (effect.type === "rage-burst") {
    drawExpandingBurst(effect, 42, 82, 5);
    return;
  }
  if (effect.type === "hyper-stealth" || effect.type === "stealth") {
    drawStealthBurst(effect);
  }
}

function drawAssassinateSlash(effect) {
  const alpha = clamp(effect.life / effect.maxLife, 0, 1);
  const angle = Math.atan2(effect.y2 - effect.y1, effect.x2 - effect.x1);
  const offsetX = Math.cos(angle + Math.PI / 2);
  const offsetY = Math.sin(angle + Math.PI / 2);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.lineCap = "round";
  ctx.shadowColor = effect.color;
  ctx.shadowBlur = 22;
  ctx.strokeStyle = effect.color;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(effect.x1, effect.y1);
  ctx.lineTo(effect.x2, effect.y2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(247, 244, 235, 0.92)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(effect.x1 + offsetX * 7, effect.y1 + offsetY * 7);
  ctx.lineTo(effect.x2 + offsetX * 7, effect.y2 + offsetY * 7);
  ctx.stroke();
  ctx.strokeStyle = "rgba(91, 108, 255, 0.55)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(effect.x1 - offsetX * 9, effect.y1 - offsetY * 9);
  ctx.lineTo(effect.x2 - offsetX * 9, effect.y2 - offsetY * 9);
  ctx.stroke();
  ctx.restore();
}

function drawExpandingBurst(effect, minRadius, maxRadius, width) {
  const fighter = effect.fighter;
  if (!fighter) return;
  const progress = 1 - clamp(effect.life / effect.maxLife, 0, 1);
  const radius = minRadius + (maxRadius - minRadius) * progress;
  const alpha = 1 - progress;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = effect.color;
  ctx.fillStyle = effect.type === "unstoppable-burst"
    ? "rgba(239, 71, 111, 0.16)"
    : "rgba(239, 71, 111, 0.08)";
  ctx.shadowColor = effect.color;
  ctx.shadowBlur = effect.type === "unstoppable-burst" ? 36 : 18;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.arc(fighter.x, fighter.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.lineWidth = Math.max(2, width - 3);
  ctx.setLineDash([16, 10]);
  ctx.beginPath();
  ctx.arc(fighter.x, fighter.y, radius * 0.72, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawStealthBurst(effect) {
  const fighter = effect.fighter;
  if (!fighter) return;
  const progress = 1 - clamp(effect.life / effect.maxLife, 0, 1);
  const radius = fighter.radius + 20 + progress * 44;
  ctx.save();
  ctx.globalAlpha = 1 - progress;
  ctx.strokeStyle = effect.type === "hyper-stealth" ? "#8d7cff" : effect.color;
  ctx.shadowColor = effect.type === "hyper-stealth" ? "#8d7cff" : effect.color;
  ctx.shadowBlur = effect.type === "hyper-stealth" ? 34 : 18;
  ctx.lineWidth = effect.type === "hyper-stealth" ? 5 : 3;
  ctx.setLineDash(effect.type === "hyper-stealth" ? [4, 7, 18, 7] : [7, 7]);
  ctx.beginPath();
  ctx.arc(fighter.x, fighter.y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawFighter(fighter) {
  ctx.save();
  ctx.translate(fighter.x, fighter.y);
  drawFighterAuras(fighter);
  ctx.beginPath();
  ctx.arc(0, 0, fighter.radius + 7, 0, Math.PI * 2);
  ctx.fillStyle = fighter.hitFlash > 0
    ? "rgba(255,255,255,0.42)"
    : fighter.rageTime > 0
      ? "rgba(239, 71, 111, 0.34)"
      : "rgba(255,255,255,0.08)";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, fighter.radius, 0, Math.PI * 2);
  ctx.globalAlpha = fighter.stealthTime > 0 ? 0.42 : 1;
  ctx.fillStyle = fighter.rageTime > 0 ? "#ff174f" : fighter.color;
  ctx.shadowColor = fighter.rageTime > 0 ? "#ef476f" : "transparent";
  ctx.shadowBlur = fighter.rageTime > 0 ? 22 : 0;
  ctx.fill();
  ctx.shadowBlur = 0;
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
    drawUnstoppableAura(fighter);
  }
  if (fighter.stealthTime > 0) {
    drawStealthAura(fighter);
  }
  if (fighter.lockOnTime > 0) drawLockOnMark(fighter);
  if (fighter.shieldTime > 0) {
    ctx.strokeStyle = "#d5dde8";
    ctx.fillStyle = "rgba(213, 221, 232, 0.18)";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(0, 0, fighter.radius + 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  fighter.godWeapons.forEach((weapon, index) => {
    const angle = game.tick * 0.055 + (Math.PI * 2 * index) / fighter.godWeapons.length;
    const orbit = fighter.radius + 12 + Math.floor(index / 6) * 16;
    ctx.save();
    ctx.rotate(angle);
    ctx.fillStyle = fighter.accent;
    ctx.fillRect(orbit, -5, 34, 10);
    ctx.fillStyle = "#101319";
    ctx.font = "900 9px Segoe UI, Arial";
    ctx.fillText(Math.floor(weapon.power), orbit + 17, 3);
    ctx.restore();
  });
  ctx.restore();
  drawFighterName(fighter);
  drawFighterHealthBar(fighter);
  drawPokerHand(fighter);
  if (fighter.kind === "enhancer") {
    addFighterStatLabel(fighter, `공격력 ${Math.floor(fighter.attackPower)}`, fighter.accent);
  }
}

function addFighterStatLabel(fighter, label, color) {
  ctx.save();
  ctx.font = "900 12px Segoe UI, Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = color;
  ctx.strokeStyle = "rgba(0,0,0,0.8)";
  ctx.lineWidth = 3;
  const y = fighter.y + fighter.radius + 42;
  ctx.strokeText(label, fighter.x, y);
  ctx.fillText(label, fighter.x, y);
  ctx.restore();
}

function drawFighterAuras(fighter) {
  if (fighter.rageTime <= 0 && fighter.unstoppableTime <= 0 && fighter.unstoppableWindup <= 0 && !fighter.hyperStealthActive) return;
  ctx.save();
  if (fighter.unstoppableWindup > 0) {
    const progress = 1 - fighter.unstoppableWindup / 24;
    ctx.globalAlpha = 0.38 + progress * 0.42;
    ctx.strokeStyle = fighter.accent;
    ctx.shadowColor = fighter.accent;
    ctx.shadowBlur = 18 + progress * 22;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, fighter.radius + 34 - progress * 20, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (fighter.rageTime > 0) {
    const pulse = 1 + Math.sin(game.tick * 0.22) * 0.06;
    ctx.globalAlpha = 0.34;
    ctx.fillStyle = "rgba(239, 71, 111, 0.28)";
    ctx.beginPath();
    ctx.arc(0, 0, (fighter.radius + 18) * pulse, 0, Math.PI * 2);
    ctx.fill();
  }
  if (fighter.hyperStealthActive) {
    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = "#8d7cff";
    ctx.lineWidth = 3;
    ctx.setLineDash([3, 6]);
    for (let i = 0; i < 3; i += 1) {
      const radius = fighter.radius + 18 + i * 10 + Math.sin(game.tick * 0.16 + i) * 4;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawUnstoppableAura(fighter) {
  const pulse = Math.sin(game.tick * 0.34) * 5;
  ctx.save();
  ctx.shadowColor = "#ef476f";
  ctx.shadowBlur = 34;
  ctx.strokeStyle = "rgba(239, 71, 111, 0.95)";
  ctx.fillStyle = "rgba(239, 71, 111, 0.18)";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(0, 0, fighter.radius + 60 + pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "rgba(255, 226, 138, 0.62)";
  ctx.lineWidth = 3;
  ctx.setLineDash([20, 8]);
  ctx.beginPath();
  ctx.arc(0, 0, fighter.radius + 42 - pulse * 0.4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawStealthAura(fighter) {
  ctx.save();
  if (fighter.hyperStealthActive) {
    ctx.strokeStyle = "rgba(141, 124, 255, 0.95)";
    ctx.fillStyle = "rgba(91, 108, 255, 0.11)";
    ctx.shadowColor = "#8d7cff";
    ctx.shadowBlur = 30;
    ctx.lineWidth = 5;
    ctx.setLineDash([2, 5, 16, 5]);
    ctx.beginPath();
    ctx.arc(0, 0, fighter.radius + 24 + Math.sin(game.tick * 0.28) * 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.rotate(game.tick * 0.045);
    for (let i = 0; i < 4; i += 1) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(fighter.radius + 14, 0);
      ctx.lineTo(fighter.radius + 40, 0);
      ctx.stroke();
    }
  } else {
    ctx.strokeStyle = fighter.accent;
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(0, 0, fighter.radius + 12, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawLockOnMark(fighter) {
  const alpha = clamp(fighter.lockOnTime / 90, 0, 1);
  const radius = fighter.radius + 24 + Math.sin(fighter.lockOnPulse * 0.28) * 4;
  ctx.save();
  ctx.globalAlpha = Math.max(0.25, alpha);
  ctx.strokeStyle = "#ff304f";
  ctx.shadowColor = "#ff304f";
  ctx.shadowBlur = 20;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 4;
  for (let i = 0; i < 4; i += 1) {
    const angle = i * Math.PI / 2 + game.tick * 0.025;
    const x1 = Math.cos(angle) * (radius - 8);
    const y1 = Math.sin(angle) * (radius - 8);
    const x2 = Math.cos(angle) * (radius + 16);
    const y2 = Math.sin(angle) * (radius + 16);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(255, 48, 79, 0.88)";
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
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
  ctx.save();
  if (ball.blood) {
    ctx.shadowColor = "#ff174f";
    ctx.shadowBlur = 18;
    ctx.translate(ball.x, ball.y);
    ctx.rotate(Math.atan2(ball.vy, ball.vx));
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.moveTo(ball.radius + 8, 0);
    ctx.lineTo(-ball.radius, -ball.radius * 0.68);
    ctx.lineTo(-ball.radius * 0.35, 0);
    ctx.lineTo(-ball.radius, ball.radius * 0.68);
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
  ctx.restore();
}

function drawAreaAttack(attack) {
  ctx.save();
  const warning = attack.delay > 0;
  const isAnnihilator = attack.type === "annihilator-laser";
  ctx.globalAlpha = warning ? 0.42 + Math.sin(game.tick * 0.32) * 0.12 : clamp(attack.life / 24, 0, 1);
  ctx.strokeStyle = isAnnihilator ? "#ff304f" : attack.type === "laser" ? "#62dfff" : attack.color;
  ctx.fillStyle = isAnnihilator ? "rgba(255,48,79,0.18)" : attack.type === "laser" ? "rgba(66,165,255,0.16)" : "rgba(216,255,117,0.12)";
  ctx.shadowColor = isAnnihilator ? "#ff304f" : "transparent";
  ctx.shadowBlur = isAnnihilator ? (warning ? 12 : 28) : 0;
  ctx.lineWidth = warning ? 3 : 8;
  ctx.setLineDash(warning ? [8, 7] : []);
  ctx.beginPath();
  ctx.arc(attack.x, attack.y, attack.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  if (!warning && (attack.type === "laser" || isAnnihilator)) {
    ctx.fillStyle = isAnnihilator ? "rgba(255,48,79,0.78)" : "rgba(167,239,255,0.7)";
    ctx.fillRect(
      attack.x - (isAnnihilator ? 11 : 18),
      0,
      isAnnihilator ? 22 : 36,
      isAnnihilator ? attack.y : canvas.height
    );
  }
  if (!warning && attack.type === "slash") {
    ctx.translate(attack.x, attack.y);
    ctx.rotate(attack.angle);
    ctx.strokeStyle = "#d8ff75";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(-attack.radius, -18);
    ctx.lineTo(attack.radius, 18);
    ctx.moveTo(-attack.radius, 18);
    ctx.lineTo(attack.radius, -18);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBeam(beam) {
  ctx.save();
  ctx.globalAlpha = beam.delay > 0 ? 0.35 : clamp(beam.life / 24, 0, 1);
  ctx.strokeStyle = beam.color;
  ctx.shadowColor = beam.color;
  ctx.shadowBlur = beam.delay > 0 ? 8 : 24;
  ctx.lineWidth = beam.delay > 0 ? 6 : 34;
  ctx.setLineDash(beam.delay > 0 ? [12, 10] : []);
  ctx.beginPath();
  ctx.moveTo(beam.x1, beam.y1);
  ctx.lineTo(beam.x2, beam.y2);
  ctx.stroke();
  ctx.restore();
}

function drawWeapon(weapon) {
  ctx.save();
  ctx.translate(weapon.x, weapon.y);
  ctx.rotate(Math.atan2(weapon.vy, weapon.vx));
  ctx.shadowColor = weapon.color;
  ctx.shadowBlur = 18;
  ctx.fillStyle = weapon.color;
  ctx.fillRect(-20, -5, 40, 10);
  ctx.fillStyle = "#f7f4eb";
  ctx.fillRect(8, -9, 10, 18);
  ctx.restore();
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
  ctx.shadowColor = grapple.enhanced ? "#ffffff" : "transparent";
  ctx.shadowBlur = grapple.enhanced ? 18 : 0;
  ctx.lineWidth = grapple.enhanced ? 9 : 5;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(endX, endY, grapple.enhanced ? 16 : 10, 0, Math.PI * 2);
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
    updateAreaAttacks(dt);
    updateBeams(dt);
    updateWeapons(dt);
    updateDamageTexts(dt);
    updateVisualEffects(dt);
    updateSkillHud();
  }
}

function resimulateGameToTick(targetTick) {
  if (!game || resimulatingGame || targetTick <= 0) return;
  resimulatingGame = true;
  resetGame();
  while (game && !game.over && game.tick < targetTick) {
    stepGame(1);
  }
  resimulatingGame = false;
  updateHud();
  updateSkillHud();
  if (game?.over && game.winner) {
    presentGameWinner(game.winner);
  } else if (game?.over && game.draw) {
    presentGameDraw();
  }
}

function loop(now) {
  if (!game) return;
  const serverTick = Math.max(0, Math.floor((serverNowMs() - game.startTimeMs) / FIXED_STEP_MS));
  const targetTick = Math.max(0, serverTick - NETWORK_BUFFER_TICKS);
  let steps = 0;
  while (game.tick < targetTick && steps < 12) {
    stepGame(gameSpeed);
    steps += 1;
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

function pveVelocity(speed, offset = 0) {
  const angle = (pveGame.seed * 0.61803398875 + offset) % (Math.PI * 2);
  pveGame.seed += 1;
  return { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
}

function pveRandomIndex(length) {
  const value = Math.abs(Math.imul(pveGame.seed++, 2654435761)) >>> 0;
  return value % length;
}

function makePveEnemy(type, x, y, offset) {
  const velocity = pveVelocity(type === "thrower" ? 3.4 : 4.2, offset);
  return {
    type,
    x,
    y,
    vx: velocity.vx,
    vy: velocity.vy,
    radius: 26,
    hp: type === "thrower" ? 55 : 65,
    maxHp: type === "thrower" ? 55 : 65,
    contactCooldown: 0,
    throwTimer: type === "thrower" ? 300 : Infinity,
    slowTime: 0,
    stunTime: 0,
    silenceTime: 0
  };
}

async function startPveStage(stage) {
  stopPveGame();
  let pveRun;
  try {
    pveRun = await rpc("begin_pve_run", {
      session_token: appSessionToken,
      stage_code: stage
    });
  } catch (error) {
    ui.modeMessage.textContent = error.message;
    showScreen("lobby");
    return;
  }
  const kind = selectedPveCharacter || DEFAULT_CHARACTER;
  const character = characters[kind];
  const playerVelocity = { vx: 5.8, vy: 4.6 };
  pveGame = {
    stage,
    runId: pveRun.runId || pveRun.run_id,
    seed: stage === "1-1" ? 11 : stage === "1-2" ? 22 : 33,
    tick: 0,
    lastTime: performance.now(),
    accumulator: 0,
    over: false,
    player: {
      kind,
      x: 120,
      y: pveCanvas.height / 2,
      vx: playerVelocity.vx,
      vy: playerVelocity.vy,
      radius: 32,
      hp: 200,
      maxHp: 200,
      color: character.color,
      accent: character.accent,
      shotTimer: 50,
      hitFlash: 0,
      skillTimer: kind === "vampire" || kind === "brawler" ? 0 : 480,
      ultimateTimer: kind === "wild" || kind === "brawler" ? 0 : 480,
      rageTime: 0,
      unstoppableWindup: 0,
      unstoppableDirectionX: 0,
      unstoppableDirectionY: 0,
      unstoppableTime: 0,
      stealthTime: 0,
      stealthTimer: kind === "stealth" ? 420 : Infinity,
      hyperStealthNext: false,
      hyperStealth: false,
      furnaceCharges: 0,
      attackPower: kind === "enhancer" ? 1 : 0,
      enhanceTimer: 120,
      godWeapons: [],
      shieldTime: 0,
      bloodPreludeTime: 0,
      gritUsed: false,
      gritActive: false,
      idleAttackTime: 0,
      chaseTime: 0,
      pokerBoostMultiplier: 1
    },
    enemies: [],
    projectiles: [],
    grapples: [],
    areaAttacks: [],
    damageTexts: [],
    floatingTexts: []
  };
  if (stage === "1-1") {
    pveGame.enemies.push(makePveEnemy("melee", 480, 260, 1));
  } else if (stage === "1-2") {
    pveGame.enemies.push(makePveEnemy("melee", 455, 170, 1));
    pveGame.enemies.push(makePveEnemy("melee", 500, 350, 2));
  } else {
    pveGame.enemies.push(makePveEnemy("thrower", 460, 150, 1));
    pveGame.enemies.push(makePveEnemy("melee", 500, 350, 2));
  }
  ui.pvePlayerLabel.textContent = currentUser.name;
  ui.pvePlayerCharacter.textContent = character.name;
  ui.pveStageLabel.textContent = stage;
  ui.pveResultOverlay.classList.remove("is-active");
  updatePveHud();
  updatePveSkillHud();
  showScreen("pveBattle");
  pveAnimationId = requestAnimationFrame(pveLoop);
}

function openPveCharacterSelect(stage) {
  pendingPveStage = stage;
  ui.pveSelectedStageLabel.textContent = `STAGE ${stage}`;
  ui.pveCharacterMessage.textContent = "";
  renderPveCharacterOptions();
  showScreen("pveCharacter");
}

function nearestPveEnemy() {
  if (!pveGame) return null;
  return pveGame.enemies.filter(enemy => enemy.hp > 0)
    .sort((a, b) => Math.hypot(a.x - pveGame.player.x, a.y - pveGame.player.y)
      - Math.hypot(b.x - pveGame.player.x, b.y - pveGame.player.y))[0] || null;
}

function addPveFloating(text, color = "#f7f4eb") {
  if (!pveGame) return;
  pveGame.floatingTexts.push({
    x: pveGame.player.x,
    y: pveGame.player.y - 48,
    text,
    color,
    life: 60
  });
}

function healPvePlayer(amount) {
  if (!pveGame || pveGame.over) return;
  pveGame.player.hp = Math.min(pveGame.player.maxHp, pveGame.player.hp + amount);
  pveGame.floatingTexts.push({
    x: pveGame.player.x,
    y: pveGame.player.y - 40,
    text: `+${Math.round(amount * 10) / 10}`,
    color: "#7bd88f",
    life: 50
  });
}

function bouncePveBody(body) {
  if (body.x - body.radius < 0) { body.x = body.radius; body.vx = Math.abs(body.vx); }
  if (body.x + body.radius > pveCanvas.width) { body.x = pveCanvas.width - body.radius; body.vx = -Math.abs(body.vx); }
  if (body.y - body.radius < 0) { body.y = body.radius; body.vy = Math.abs(body.vy); }
  if (body.y + body.radius > pveCanvas.height) { body.y = pveCanvas.height - body.radius; body.vy = -Math.abs(body.vy); }
}

function addPveDamage(x, y, amount, color = "#ff304f") {
  pveGame.damageTexts.push({ x, y, amount, color, life: 45 });
}

function damagePvePlayer(amount) {
  if (!pveGame || pveGame.over) return;
  const player = pveGame.player;
  if (player.stealthTime > 0) return;
  const reduction = player.shieldTime > 0 ? 0.9 : player.kind === "tank" ? 0.2 : 0;
  amount *= 1 - reduction;
  player.hp = Math.max(0, player.hp - amount);
  pveGame.player.hitFlash = 10;
  addPveDamage(player.x, player.y - 36, Math.round(amount * 10) / 10);
  if (player.kind === "brawler" && !player.gritUsed && player.hp <= player.maxHp * 0.5) {
    player.gritUsed = true;
    player.gritActive = true;
    healPvePlayer(player.maxHp * 0.3);
    addPveFloating("투지!", player.accent);
  }
  if (player.hp <= 0) finishPve(false);
}

function damagePveEnemy(enemy, amount) {
  enemy.hp = Math.max(0, enemy.hp - amount);
  addPveDamage(enemy.x, enemy.y - 30, Math.round(amount * 10) / 10);
  if (pveGame.player.kind === "vampire") healPvePlayer(amount * 0.3);
}

function firePvePlayerShot(options = {}) {
  const target = nearestPveEnemy();
  if (!target) return;
  const angle = Math.atan2(target.y - pveGame.player.y, target.x - pveGame.player.x);
  const blood = options.blood ?? pveGame.player.kind === "vampire";
  const speed = options.speed || (blood ? 15 : 11);
  pveGame.projectiles.push({
    owner: "player",
    x: pveGame.player.x,
    y: pveGame.player.y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: options.radius || (blood ? 10 : 8),
    damage: options.damage ?? 10,
    life: options.life || 180,
    color: options.color || (blood ? "#ff174f" : pveGame.player.accent),
    blood,
    hitCooldown: 0,
    homing: Boolean(options.homing),
    star: Boolean(options.star),
    slow: Boolean(options.slow)
  });
}

function firePveGrapple(enhanced = false) {
  const target = nearestPveEnemy();
  if (!target) return;
  pveGame.grapples.push({
    angle: Math.atan2(target.y - pveGame.player.y, target.x - pveGame.player.x),
    length: pveGame.player.radius,
    maxLength: enhanced ? 940 : 470,
    speed: enhanced ? 19 : 11,
    enhanced,
    life: enhanced ? 70 : 50
  });
}

function createPveAreaAttack(x, y, radius, damageAmount, delay = 18, color = "#ff304f", type = "blast", stun = 0) {
  pveGame.areaAttacks.push({ x, y, radius, damage: damageAmount, delay, life: delay + 24, hit: false, color, type, stun });
}

function usePveSkill(type) {
  if (!pveGame || pveGame.over) return;
  const player = pveGame.player;
  const timerKey = type === "normal" ? "skillTimer" : "ultimateTimer";
  if (player[timerKey] > 0) return;
  const target = nearestPveEnemy();

  if (type === "normal") {
    if (player.kind === "thrower") {
      pveGame.projectiles.filter(projectile => projectile.owner === "player").forEach(projectile => {
        projectile.homing = true;
        projectile.homingTime = 240;
      });
      player.skillTimer = 720;
      addPveFloating("룩 온!", player.accent);
    } else if (player.kind === "charger") {
      player.rageTime = 180;
      player.skillTimer = 600;
      addPveFloating("격노!", player.accent);
    } else if (player.kind === "grabber") {
      firePveGrapple(true);
      player.skillTimer = 900;
      addPveFloating("강화 그랩!", player.accent);
    } else if (player.kind === "poker") {
      const cards = ["JOKER", "A", "K", "Q", "J"];
      const card = cards[pveRandomIndex(cards.length)];
      let cardDamage = card === "JOKER" ? 18 : card === "A" || card === "Q" ? 7.5 : card === "J" ? 4.5 : 0;
      if (card === "K") player.pokerBoostMultiplier = 2;
      if (target && cardDamage) damagePveEnemy(target, cardDamage);
      if (card === "A" && target) target.slowTime = 180;
      if (card === "Q") player.rageTime = 180;
      player.skillTimer = 600;
      addPveFloating(`드로우 ${card}`, player.accent);
    } else if (player.kind === "stealth" && player.stealthTime > 0 && target) {
      const angle = Math.atan2(target.vy, target.vx);
      player.x = target.x - Math.cos(angle) * (target.radius + player.radius + 8);
      player.y = target.y - Math.sin(angle) * (target.radius + player.radius + 8);
      bouncePveBody(player);
      player.skillTimer = 900;
      addPveFloating("암살!", player.accent);
    } else if (player.kind === "enhancer") {
      player.furnaceCharges = 2;
      player.skillTimer = 600;
      addPveFloating("용광로!", player.accent);
    } else if (player.kind === "tank") {
      if (target) {
        damagePveEnemy(target, 10);
        const angle = Math.atan2(player.y - target.y, player.x - target.x);
        target.vx = Math.cos(angle) * 5;
        target.vy = Math.sin(angle) * 5;
        target.silenceTime = 120;
      }
      player.skillTimer = 720;
      addPveFloating("도발!", player.accent);
    } else if (player.kind === "beamer") {
      if (target) {
        damagePveEnemy(target, 5);
        target.slowTime = 180;
      }
      player.skillTimer = 720;
      addPveFloating("슬로우 빔!", player.accent);
    } else if (player.kind === "wild") {
      player.chaseTime = 300;
      player.skillTimer = 1080;
      addPveFloating("추격!", player.accent);
    }
  } else {
    if (player.kind === "thrower") {
      firePvePlayerShot({ damage: 5, life: 540, radius: 14, star: true, speed: 12 });
      firePvePlayerShot({ damage: 5, life: 540, radius: 14, star: true, speed: 12 });
      player.ultimateTimer = 1800;
      addPveFloating("스타 스트라이크!", player.accent);
    } else if (player.kind === "charger") {
      const speed = Math.hypot(player.vx, player.vy) || 1;
      player.unstoppableDirectionX = player.vx / speed;
      player.unstoppableDirectionY = player.vy / speed;
      player.vx = 0;
      player.vy = 0;
      player.unstoppableWindup = 24;
      player.ultimateTimer = 1380;
      addPveFloating("집중...", player.accent);
    } else if (player.kind === "grabber") {
      createPveAreaAttack(player.x, player.y, 192, 30, 0, player.accent, "shockwave", 60);
      player.ultimateTimer = 1680;
      addPveFloating("충격파!", player.accent);
    } else if (player.kind === "poker") {
      const roll = pveRandomIndex(6) + 1;
      healPvePlayer(roll * 5);
      player.ultimateTimer = 2400;
      addPveFloating(`힐 다이스 ${roll}`, player.accent);
    } else if (player.kind === "stealth") {
      player.hyperStealthNext = true;
      player.ultimateTimer = 2700;
      addPveFloating("하이퍼 히든!", player.accent);
    } else if (player.kind === "enhancer") {
      player.godWeapons.push({ power: player.attackPower, timer: 1 });
      player.attackPower = 0;
      player.ultimateTimer = 300;
      addPveFloating("갓 웨폰!", player.accent);
    } else if (player.kind === "tank") {
      player.shieldTime = 180;
      player.shieldBlastPending = true;
      player.ultimateTimer = 2400;
      addPveFloating("야수의 방패!", player.accent);
    } else if (player.kind === "beamer") {
      player.annihilatorTime = 180;
      player.shotTimer = 1;
      player.ultimateTimer = 3600;
      addPveFloating("절멸자!", player.accent);
    } else if (player.kind === "vampire") {
      player.hp = Math.max(1, player.hp * 0.5);
      player.bloodPreludeTime = 180;
      player.ultimateTimer = 3000;
      addPveFloating("핏빛 서곡!", player.accent);
    }
  }
  updatePveSkillHud();
}

function updatePveSkillHud() {
  if (!pveGame) return;
  const player = pveGame.player;
  const names = skillNames[player.kind];
  const passiveNormal = player.kind === "vampire" || player.kind === "brawler";
  const passiveUltimate = player.kind === "wild" || player.kind === "brawler";
  const normalCooldown = cooldownSeconds(player.skillTimer);
  const ultimateCooldown = cooldownSeconds(player.ultimateTimer);
  ui.pveNormalSkillName.textContent = names.normal;
  ui.pveUltimateSkillName.textContent = names.ultimate;
  ui.pveNormalSkillCooldown.textContent = passiveNormal ? "PASSIVE" : normalCooldown || "";
  ui.pveUltimateSkillCooldown.textContent = passiveUltimate ? "PASSIVE" : ultimateCooldown || "";
  ui.pveNormalSkillButton.classList.toggle("is-cooling", passiveNormal || normalCooldown > 0);
  ui.pveUltimateSkillButton.classList.toggle("is-cooling", passiveUltimate || ultimateCooldown > 0);
  ui.pveNormalSkillButton.disabled = passiveNormal || normalCooldown > 0 || (player.kind === "stealth" && player.stealthTime <= 0);
  ui.pveUltimateSkillButton.disabled = passiveUltimate || ultimateCooldown > 0;
}

function firePveEnemyShot(enemy) {
  const angle = Math.atan2(pveGame.player.y - enemy.y, pveGame.player.x - enemy.x);
  pveGame.projectiles.push({
    owner: "enemy",
    x: enemy.x,
    y: enemy.y,
    vx: Math.cos(angle) * 8,
    vy: Math.sin(angle) * 8,
    radius: 9,
    damage: 5,
    life: 220,
    color: "#ef476f",
    blood: false,
    hitCooldown: 0
  });
}

function stepPve() {
  if (!pveGame || pveGame.over) return;
  pveGame.tick += 1;
  const player = pveGame.player;
  if (player.skillTimer > 0) player.skillTimer -= 1;
  if (player.ultimateTimer > 0) player.ultimateTimer -= 1;
  if (player.rageTime > 0) player.rageTime -= 1;
  if (player.unstoppableWindup > 0) {
    player.unstoppableWindup -= 1;
    player.vx = 0;
    player.vy = 0;
    if (player.unstoppableWindup <= 0) {
      player.vx = player.unstoppableDirectionX * 5.8;
      player.vy = player.unstoppableDirectionY * 5.8;
      player.unstoppableTime = 55;
      addPveFloating("불가항력!", player.accent);
    }
  } else if (player.unstoppableTime > 0) {
    player.unstoppableTime -= 1;
  }
  if (player.bloodPreludeTime > 0) player.bloodPreludeTime -= 1;
  if (player.chaseTime > 0) player.chaseTime -= 1;
  if (player.shieldTime > 0) {
    player.shieldTime -= 1;
    if (player.shieldTime <= 0 && player.shieldBlastPending) {
      player.shieldBlastPending = false;
      createPveAreaAttack(player.x, player.y, 261, 50, 0, "#d5dde8", "shockwave", 180);
    }
  }
  if (player.stealthTime > 0) player.stealthTime -= 1;
  if (player.kind === "stealth") {
    player.stealthTimer -= 1;
    if (player.stealthTimer <= 0) {
      player.hyperStealth = player.hyperStealthNext;
      player.hyperStealthNext = false;
      player.stealthTime = player.hyperStealth ? 240 : 180;
      player.stealthTimer = 420;
      addPveFloating(player.hyperStealth ? "하이퍼 은신!" : "은신", player.accent);
    }
    if (player.stealthTime <= 0) player.hyperStealth = false;
  }
  if (player.kind === "enhancer") {
    player.enhanceTimer -= 1;
    if (player.enhanceTimer <= 0) {
      player.attackPower = Math.min(40, player.attackPower + (player.furnaceCharges > 0 ? 2 : 1));
      if (player.furnaceCharges > 0) player.furnaceCharges -= 1;
      player.enhanceTimer = 120;
    }
    player.godWeapons.forEach(weapon => {
      weapon.timer -= 1;
      if (weapon.timer <= 0) {
        firePvePlayerShot({ damage: weapon.power, speed: 14, color: "#ffe28a" });
        weapon.timer = 300;
      }
    });
  }
  if (player.kind === "beamer" && player.annihilatorTime > 0) player.annihilatorTime -= 1;

  const closest = nearestPveEnemy();
  if (player.chaseTime > 0 && closest) {
    const angle = Math.atan2(closest.y - player.y, closest.x - player.x);
    player.vx = Math.cos(angle) * 18;
    player.vy = Math.sin(angle) * 18;
  }
  const speedMultiplier = (player.rageTime > 0 ? 1.55 : 1)
    * (player.stealthTime > 0 ? player.hyperStealth ? 10 : 1.8 : 1)
    * (player.kind === "wild" && closest && closest.hp <= closest.maxHp * 0.5 ? 3.5 : 1)
    * (player.bloodPreludeTime > 0 ? 2 : 1)
    * (player.unstoppableTime > 0 ? 8.8 : 1)
    * (player.kind === "brawler" ? 1 + player.idleAttackTime / 60 * 0.06 : 1);
  if (player.shieldTime <= 0 && player.unstoppableWindup <= 0) {
    player.x += player.vx * speedMultiplier;
    player.y += player.vy * speedMultiplier;
  }
  bouncePveBody(player);
  if (player.hitFlash > 0) player.hitFlash -= 1;
  player.shotTimer -= 1;
  if (player.shotTimer <= 0) {
    if (player.kind === "thrower") {
      firePvePlayerShot({ damage: 5, speed: 12.4, life: 420, radius: 11 });
      player.shotTimer = 180;
    } else if (player.kind === "grabber") {
      firePveGrapple(false);
      player.shotTimer = 150;
    } else if (player.kind === "poker") {
      for (let index = 0; index < 5; index += 1) firePvePlayerShot({ damage: 4.5, speed: 15.8, life: 190 });
      player.shotTimer = 300;
    } else if (player.kind === "beamer") {
      if (closest) createPveAreaAttack(closest.x, closest.y, 62, 45, 60, player.accent, "laser");
      player.shotTimer = player.annihilatorTime > 0 ? 12 : 180;
    } else if (player.kind === "wild") {
      for (let index = 0; index < 3; index += 1) {
        createPveAreaAttack(
          58 + (pveGame.seed++ * 71 % (pveCanvas.width - 116)),
          58 + (pveGame.seed++ * 43 % (pveCanvas.height - 116)),
          58, 20, 28 + index * 8, player.accent, "slash"
        );
      }
      player.shotTimer = 180;
    } else if (player.kind === "vampire") {
      const missing = 1 - player.hp / player.maxHp;
      firePvePlayerShot({ blood: true, damage: 10 + missing * 25, speed: 12.5 + missing * 9.5 });
      player.shotTimer = player.bloodPreludeTime > 0 ? 60 : 180;
    } else if (player.kind === "brawler") {
      if (closest && Math.hypot(closest.x - player.x, closest.y - player.y) < player.radius + closest.radius + 52) {
        damagePveEnemy(closest, 7 + (player.gritActive ? 8 : 0));
        player.idleAttackTime = 0;
      }
      player.shotTimer = 60;
    } else {
      player.shotTimer = 60;
    }
  }

  pveGame.enemies.forEach(enemy => {
    if (enemy.hp <= 0) return;
    if (enemy.stunTime > 0) {
      enemy.stunTime -= 1;
      enemy.vx *= 0.82;
      enemy.vy *= 0.82;
      return;
    }
    enemy.x += enemy.vx;
    enemy.y += enemy.vy;
    bouncePveBody(enemy);
    if (enemy.contactCooldown > 0) enemy.contactCooldown -= 1;
    if (enemy.slowTime > 0) {
      enemy.slowTime -= 1;
      enemy.vx *= 0.99;
      enemy.vy *= 0.99;
    }
    if (enemy.silenceTime > 0) enemy.silenceTime -= 1;
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.hypot(dx, dy);
    if (distance < player.radius + enemy.radius) {
      if (player.stealthTime > 0) {
        if (enemy.contactCooldown <= 0) {
          damagePveEnemy(enemy, player.hyperStealth ? 10 : 15);
          enemy.contactCooldown = 24;
        }
        return;
      }
      const nx = dx / (distance || 1);
      const ny = dy / (distance || 1);
      player.vx = nx * 6;
      player.vy = ny * 6;
      enemy.vx = -nx * 4.4;
      enemy.vy = -ny * 4.4;
      if (enemy.contactCooldown <= 0) {
        damagePvePlayer(5);
        const contactDamage = player.unstoppableTime > 0 ? 40
          : player.kind === "charger" ? 10
          : player.kind === "tank" ? 5
            : player.kind === "enhancer" ? player.attackPower
              : 0;
        if (contactDamage > 0) damagePveEnemy(enemy, contactDamage);
        if (player.kind === "wild") {
          for (let index = 0; index < 3; index += 1) {
            createPveAreaAttack(enemy.x + (index - 1) * 32, enemy.y, 58, 20, index * 6, player.accent, "slash");
          }
        }
        enemy.contactCooldown = 30;
      }
    }
    if (enemy.type === "thrower" && enemy.silenceTime <= 0) {
      enemy.throwTimer -= 1;
      if (enemy.throwTimer <= 0) {
        firePveEnemyShot(enemy);
        enemy.throwTimer = 300;
      }
    }
  });

  pveGame.projectiles = pveGame.projectiles.filter(projectile => {
    if (projectile.homingTime > 0) {
      projectile.homingTime -= 1;
      if (projectile.homingTime <= 0) projectile.homing = false;
    }
    if (projectile.homing) {
      const target = nearestPveEnemy();
      if (target) {
        const speed = Math.hypot(projectile.vx, projectile.vy);
        const angle = Math.atan2(target.y - projectile.y, target.x - projectile.x);
        projectile.vx = projectile.vx * 0.85 + Math.cos(angle) * speed * 0.15;
        projectile.vy = projectile.vy * 0.85 + Math.sin(angle) * speed * 0.15;
      }
    }
    projectile.x += projectile.vx;
    projectile.y += projectile.vy;
    projectile.life -= 1;
    if (projectile.hitCooldown > 0) projectile.hitCooldown -= 1;
    if (!projectile.blood) bouncePveBody(projectile);
    if (projectile.owner === "player") {
      const enemy = pveGame.enemies.find(item => item.hp > 0
        && projectile.hitCooldown <= 0
        && Math.hypot(item.x - projectile.x, item.y - projectile.y) < item.radius + projectile.radius);
      if (enemy) {
        damagePveEnemy(enemy, projectile.damage);
        if (projectile.slow) enemy.slowTime = 180;
        if (projectile.blood) return false;
        const angle = Math.atan2(enemy.y - projectile.y, enemy.x - projectile.x);
        const speed = Math.hypot(projectile.vx, projectile.vy);
        projectile.vx = -Math.cos(angle) * speed;
        projectile.vy = -Math.sin(angle) * speed;
        projectile.hitCooldown = 18;
      }
    } else if (projectile.hitCooldown <= 0
      && Math.hypot(player.x - projectile.x, player.y - projectile.y) < player.radius + projectile.radius) {
      damagePvePlayer(projectile.damage);
      const angle = Math.atan2(player.y - projectile.y, player.x - projectile.x);
      const speed = Math.hypot(projectile.vx, projectile.vy);
      projectile.vx = -Math.cos(angle) * speed;
      projectile.vy = -Math.sin(angle) * speed;
      projectile.hitCooldown = 18;
    }
    return projectile.life > 0
      && (projectile.blood
        ? projectile.x > -30 && projectile.x < pveCanvas.width + 30 && projectile.y > -30 && projectile.y < pveCanvas.height + 30
        : true);
  });
  pveGame.grapples = pveGame.grapples.filter(grapple => {
    grapple.length += grapple.speed;
    grapple.life -= 1;
    const endX = player.x + Math.cos(grapple.angle) * grapple.length;
    const endY = player.y + Math.sin(grapple.angle) * grapple.length;
    const enemy = pveGame.enemies.find(item => item.hp > 0
      && Math.hypot(item.x - endX, item.y - endY) < item.radius + (grapple.enhanced ? 20 : 14));
    if (enemy) {
      const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
      enemy.x += Math.cos(angle) * 70;
      enemy.y += Math.sin(angle) * 70;
      enemy.vx = Math.cos(angle) * 5.2;
      enemy.vy = Math.sin(angle) * 5.2;
      enemy.stunTime = 30;
      damagePveEnemy(enemy, 20);
      return false;
    }
    return grapple.life > 0 && grapple.length < grapple.maxLength;
  });
  pveGame.areaAttacks = pveGame.areaAttacks.filter(attack => {
    attack.delay -= 1;
    attack.life -= 1;
    if (attack.delay <= 0 && !attack.hit) {
      attack.hit = true;
      pveGame.enemies.forEach(enemy => {
        if (enemy.hp <= 0) return;
        const hit = Math.hypot(enemy.x - attack.x, enemy.y - attack.y) < enemy.radius + attack.radius
          || (attack.type === "laser" && Math.abs(enemy.x - attack.x) < enemy.radius + 18);
        if (hit) {
          damagePveEnemy(enemy, attack.damage);
          if (attack.stun) enemy.stunTime = Math.max(enemy.stunTime, attack.stun);
        }
      });
    }
    return attack.life > 0;
  });
  pveGame.enemies = pveGame.enemies.filter(enemy => enemy.hp > 0);
  pveGame.damageTexts = pveGame.damageTexts.filter(text => {
    text.y -= 0.6;
    text.life -= 1;
    return text.life > 0;
  });
  pveGame.floatingTexts = pveGame.floatingTexts.filter(text => {
    text.y -= 0.5;
    text.life -= 1;
    return text.life > 0;
  });
  if (player.kind === "brawler") player.idleAttackTime += 1;
  updatePveHud();
  updatePveSkillHud();
  if (!pveGame.enemies.length) finishPve(true);
}

function updatePveHud() {
  if (!pveGame) return;
  ui.pvePlayerHealthText.textContent = Math.ceil(pveGame.player.hp);
  ui.pvePlayerHealthBar.style.width = `${pveGame.player.hp / pveGame.player.maxHp * 100}%`;
  ui.pveEnemyCount.textContent = String(pveGame.enemies.length);
  const totalHp = pveGame.enemies.reduce((sum, enemy) => sum + enemy.hp, 0);
  const totalMax = pveGame.enemies.reduce((sum, enemy) => sum + enemy.maxHp, 0) || 1;
  ui.pveEnemyHealthBar.style.width = `${totalHp / totalMax * 100}%`;
}

function drawPve() {
  if (!pveGame) return;
  pveCtx.clearRect(0, 0, pveCanvas.width, pveCanvas.height);
  pveCtx.fillStyle = "#0d1118";
  pveCtx.fillRect(0, 0, pveCanvas.width, pveCanvas.height);
  pveCtx.strokeStyle = "rgba(255,255,255,0.05)";
  for (let x = 40; x < pveCanvas.width; x += 40) {
    pveCtx.beginPath(); pveCtx.moveTo(x, 0); pveCtx.lineTo(x, pveCanvas.height); pveCtx.stroke();
  }
  for (let y = 40; y < pveCanvas.height; y += 40) {
    pveCtx.beginPath(); pveCtx.moveTo(0, y); pveCtx.lineTo(pveCanvas.width, y); pveCtx.stroke();
  }
  const player = pveGame.player;
  pveCtx.beginPath();
  pveCtx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  pveCtx.globalAlpha = player.stealthTime > 0 ? 0.36 : 1;
  pveCtx.fillStyle = player.hitFlash > 0 ? "#ffffff" : player.color;
  pveCtx.fill();
  pveCtx.beginPath();
  pveCtx.arc(player.x + 7, player.y - 7, 6, 0, Math.PI * 2);
  pveCtx.fillStyle = "#101319";
  pveCtx.fill();
  pveCtx.globalAlpha = 1;
  pveGame.enemies.forEach(enemy => {
    pveCtx.beginPath();
    pveCtx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    pveCtx.fillStyle = enemy.type === "thrower" ? "#9b7cff" : "#ef476f";
    pveCtx.fill();
    pveCtx.fillStyle = "#101319";
    pveCtx.fillRect(enemy.x - 28, enemy.y + 34, 56, 6);
    pveCtx.fillStyle = "#ef476f";
    pveCtx.fillRect(enemy.x - 28, enemy.y + 34, 56 * enemy.hp / enemy.maxHp, 6);
  });
  pveGame.grapples.forEach(grapple => {
    const endX = player.x + Math.cos(grapple.angle) * grapple.length;
    const endY = player.y + Math.sin(grapple.angle) * grapple.length;
    pveCtx.save();
    pveCtx.strokeStyle = player.accent;
    pveCtx.shadowColor = grapple.enhanced ? "#ffffff" : "transparent";
    pveCtx.shadowBlur = grapple.enhanced ? 18 : 0;
    pveCtx.lineWidth = grapple.enhanced ? 9 : 5;
    pveCtx.beginPath();
    pveCtx.moveTo(player.x, player.y);
    pveCtx.lineTo(endX, endY);
    pveCtx.stroke();
    pveCtx.beginPath();
    pveCtx.arc(endX, endY, grapple.enhanced ? 16 : 10, 0, Math.PI * 2);
    pveCtx.fillStyle = player.accent;
    pveCtx.fill();
    pveCtx.restore();
  });
  pveGame.areaAttacks.forEach(attack => {
    const warning = attack.delay > 0;
    pveCtx.save();
    pveCtx.globalAlpha = warning ? 0.4 : Math.min(1, attack.life / 18);
    pveCtx.strokeStyle = attack.color;
    pveCtx.fillStyle = `${attack.color}28`;
    pveCtx.lineWidth = warning ? 3 : 8;
    pveCtx.setLineDash(warning ? [8, 7] : []);
    pveCtx.beginPath();
    pveCtx.arc(attack.x, attack.y, attack.radius, 0, Math.PI * 2);
    pveCtx.fill();
    pveCtx.stroke();
    if (!warning && (attack.type === "laser" || attack.type === "annihilator")) {
      pveCtx.fillStyle = attack.type === "annihilator" ? "rgba(255,48,79,.75)" : "rgba(167,239,255,.7)";
      pveCtx.fillRect(attack.x - 13, 0, 26, attack.type === "annihilator" ? attack.y : pveCanvas.height);
    }
    pveCtx.restore();
  });
  pveGame.projectiles.forEach(projectile => {
    if (projectile.blood) {
      pveCtx.save();
      pveCtx.translate(projectile.x, projectile.y);
      pveCtx.rotate(Math.atan2(projectile.vy, projectile.vx));
      pveCtx.fillStyle = projectile.color;
      pveCtx.shadowColor = projectile.color;
      pveCtx.shadowBlur = 16;
      pveCtx.beginPath();
      pveCtx.moveTo(17, 0);
      pveCtx.lineTo(-10, -7);
      pveCtx.lineTo(-4, 0);
      pveCtx.lineTo(-10, 7);
      pveCtx.closePath();
      pveCtx.fill();
      pveCtx.restore();
      return;
    }
    pveCtx.beginPath();
    pveCtx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
    pveCtx.fillStyle = projectile.color;
    pveCtx.fill();
  });
  pveGame.damageTexts.forEach(text => {
    pveCtx.globalAlpha = text.life / 45;
    pveCtx.fillStyle = text.color;
    pveCtx.font = "900 20px Segoe UI";
    pveCtx.textAlign = "center";
    pveCtx.fillText(`-${text.amount}`, text.x, text.y);
  });
  pveGame.floatingTexts.forEach(text => {
    pveCtx.globalAlpha = Math.min(1, text.life / 30);
    pveCtx.fillStyle = text.color;
    pveCtx.font = "900 18px Segoe UI";
    pveCtx.textAlign = "center";
    pveCtx.fillText(text.text, text.x, text.y);
  });
  pveCtx.globalAlpha = 1;
}

function pveLoop(now) {
  if (!pveGame) return;
  pveGame.accumulator += Math.min(100, now - pveGame.lastTime);
  pveGame.lastTime = now;
  while (pveGame.accumulator >= FIXED_STEP_MS) {
    stepPve();
    pveGame.accumulator -= FIXED_STEP_MS;
  }
  drawPve();
  if (pveGame && !pveGame.over) pveAnimationId = requestAnimationFrame(pveLoop);
}

async function finishPve(won) {
  if (!pveGame || pveGame.over) return;
  const completedStage = pveGame.stage;
  const completedRunId = pveGame.runId;
  pveGame.over = true;
  ui.pveResultTitle.textContent = won ? "STAGE CLEAR" : "DEFEAT";
  ui.pveResultText.textContent = won ? `${completedStage} 클리어 · 보상 지급 중...` : `${completedStage} 실패`;
  ui.pveResultOverlay.classList.add("is-active");
  if (!won) return;

  ui.pveResultButton.disabled = true;
  try {
    const data = await rpc("complete_pve_run", {
      session_token: appSessionToken,
      run_id: completedRunId
    });
    currentUser = normalizePlayer(data.user);
    players = players.map(player => player.id === currentUser.id ? currentUser : player);
    ui.pveResultText.textContent = `${completedStage} 클리어 · +${data.reward ?? 10}C`;
    renderLobby();
  } catch (error) {
    ui.pveResultText.textContent = `${completedStage} 클리어 · 보상 오류: ${error.message}`;
  } finally {
    ui.pveResultButton.disabled = false;
  }
}

function stopPveGame() {
  if (pveAnimationId) cancelAnimationFrame(pveAnimationId);
  pveAnimationId = null;
  pveGame = null;
}

function returnToPveSelect() {
  stopPveGame();
  ui.pveResultOverlay.classList.remove("is-active");
  renderPveCharacterOptions();
  showScreen("pve");
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
  stopPveGame();
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
ui.patchNoteButton.addEventListener("click", () => setPatchNotesOpen(true));
ui.patchNoteCloseButton.addEventListener("click", () => setPatchNotesOpen(false));
ui.patchNoteModal.addEventListener("click", event => {
  if (event.target === ui.patchNoteModal) setPatchNotesOpen(false);
});
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
ui.backFromPveButton.addEventListener("click", () => {
  stopPveGame();
  renderLobby();
  showScreen("lobby");
});
ui.pveStageButtons.forEach(button => {
  button.addEventListener("click", () => openPveCharacterSelect(button.dataset.pveStage));
});
ui.backToPveStagesButton.addEventListener("click", () => showScreen("pve"));
ui.startPveBattleButton.addEventListener("click", () => {
  if (!pendingPveStage) return;
  ui.startPveBattleButton.disabled = true;
  startPveStage(pendingPveStage).finally(() => {
    ui.startPveBattleButton.disabled = false;
  });
});
ui.pveResultButton.addEventListener("click", returnToPveSelect);
document.querySelectorAll("[data-lobby-tab]").forEach(button => {
  button.addEventListener("click", () => switchLobbyTab(button.dataset.lobbyTab));
});
ui.normalSkillButton.addEventListener("click", () => useSkill("normal"));
ui.ultimateSkillButton.addEventListener("click", () => useSkill("ultimate"));
ui.pveNormalSkillButton.addEventListener("click", () => usePveSkill("normal"));
ui.pveUltimateSkillButton.addEventListener("click", () => usePveSkill("ultimate"));
document.addEventListener("keydown", event => {
  if (screens.pveBattle.classList.contains("is-active") && pveGame) {
    if (event.key === "1") {
      event.preventDefault();
      usePveSkill("normal");
    }
    if (event.key === "2") {
      event.preventDefault();
      usePveSkill("ultimate");
    }
    return;
  }
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

