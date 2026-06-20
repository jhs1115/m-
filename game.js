const STORAGE_KEY = "matchzzang-arena-players";
const DEFAULT_CHARACTER = "thrower";
const GACHA_COST = 50;
const APP_SESSION_KEY = "matchzzang-supabase-session";
const SOUND_SETTINGS_KEY = "matchzzang-sound-settings";
const FIXED_STEP_MS = 1000 / 60;
const NETWORK_BUFFER_TICKS = 18;
const SIMULATION_VERSION = "20260616a";
const VOID_RIFT_RADIUS = 200;
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
  pvpQueue: document.getElementById("pvpQueueScreen"),
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
  accountSettingsButton: document.getElementById("accountSettingsButton"),
  accountModal: document.getElementById("accountModal"),
  accountModalCloseButton: document.getElementById("accountModalCloseButton"),
  accountCancelButton: document.getElementById("accountCancelButton"),
  accountSaveButton: document.getElementById("accountSaveButton"),
  accountCurrentUsername: document.getElementById("accountCurrentUsername"),
  accountCurrentPassword: document.getElementById("accountCurrentPassword"),
  accountNewUsername: document.getElementById("accountNewUsername"),
  accountNewPassword: document.getElementById("accountNewPassword"),
  accountNewPasswordConfirm: document.getElementById("accountNewPasswordConfirm"),
  accountMessage: document.getElementById("accountMessage"),
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
  codexArchiveLabel: document.getElementById("codexArchiveLabel"),
  codexTypeButtons: document.querySelectorAll("[data-codex-type]"),
  codexOwnedCount: document.getElementById("codexOwnedCount"),
  codexDetail: document.getElementById("codexDetail"),
  codexPreview: document.getElementById("codexPreview"),
  codexPreviewInitial: document.getElementById("codexPreviewInitial"),
  codexOwnership: document.getElementById("codexOwnership"),
  codexCharacterName: document.getElementById("codexCharacterName"),
  codexSkillList: document.getElementById("codexSkillList"),
  rankingPodium: document.getElementById("rankingPodium"),
  rankingList: document.getElementById("rankingList"),
  rankingModeButtons: document.querySelectorAll("[data-ranking-mode]"),
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
  survivalEntryPanel: document.getElementById("survivalEntryPanel"),
  pveDifficultyButtons: document.querySelectorAll("[data-pve-difficulty]"),
  pveStageButtons: document.querySelectorAll("[data-pve-stage]"),
  pveStageDetailCode: document.getElementById("pveStageDetailCode"),
  pveStageDetailTitle: document.getElementById("pveStageDetailTitle"),
  pveStageDetailDescription: document.getElementById("pveStageDetailDescription"),
  pveStageDetailEnemies: document.getElementById("pveStageDetailEnemies"),
  pveStageDetailReward: document.getElementById("pveStageDetailReward"),
  pveStageDetailStatus: document.getElementById("pveStageDetailStatus"),
  pveStageStartButton: document.getElementById("pveStageStartButton"),
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
  pveElapsedTime: document.getElementById("pveElapsedTime"),
  pveLevel: document.getElementById("pveLevel"),
  pveXpBar: document.getElementById("pveXpBar"),
  pveXpText: document.getElementById("pveXpText"),
  pveBuildList: document.getElementById("pveBuildList"),
  pveAugmentOverlay: document.getElementById("pveAugmentOverlay"),
  pveAugmentChoices: document.getElementById("pveAugmentChoices"),
  pveAugmentReroll: document.getElementById("pveAugmentReroll"),
  pveAwakeningOverlay: document.getElementById("pveAwakeningOverlay"),
  pveAwakeningName: document.getElementById("pveAwakeningName"),
  pveAwakeningDescription: document.getElementById("pveAwakeningDescription"),
  pveResultOverlay: document.getElementById("pveResultOverlay"),
  pveResultTimeTop: document.getElementById("pveResultTimeTop"),
  pveResultEyebrow: document.getElementById("pveResultEyebrow"),
  pveResultTitle: document.getElementById("pveResultTitle"),
  pveResultText: document.getElementById("pveResultText"),
  pveResultCharacterOrb: document.getElementById("pveResultCharacterOrb"),
  pveResultPlayerName: document.getElementById("pveResultPlayerName"),
  pveResultCharacterName: document.getElementById("pveResultCharacterName"),
  pveResultReward: document.getElementById("pveResultReward"),
  pveResultRewardLabel: document.getElementById("pveResultRewardLabel"),
  pveResultDamageDealt: document.getElementById("pveResultDamageDealt"),
  pveResultDamageTaken: document.getElementById("pveResultDamageTaken"),
  pveResultHealing: document.getElementById("pveResultHealing"),
  pveResultHealth: document.getElementById("pveResultHealth"),
  pveResultTime: document.getElementById("pveResultTime"),
  pveResultButton: document.getElementById("pveResultButton"),
  pveNormalSkillButton: document.getElementById("pveNormalSkillButton"),
  pveUltimateSkillButton: document.getElementById("pveUltimateSkillButton"),
  pveNormalSkillName: document.getElementById("pveNormalSkillName"),
  pveUltimateSkillName: document.getElementById("pveUltimateSkillName"),
  pveNormalSkillCooldown: document.getElementById("pveNormalSkillCooldown"),
  pveUltimateSkillCooldown: document.getElementById("pveUltimateSkillCooldown"),
  pveSpeedButtons: document.querySelectorAll("[data-pve-speed]"),
  backFromPvpButton: document.getElementById("backFromPvpButton"),
  backFromPvpQueueButton: document.getElementById("backFromPvpQueueButton"),
  rankedMatchButton: document.getElementById("rankedMatchButton"),
  casualMatchButton: document.getElementById("casualMatchButton"),
  matchSoundVolume: document.getElementById("matchSoundVolume"),
  matchSoundVolumeText: document.getElementById("matchSoundVolumeText"),
  testMatchSoundButton: document.getElementById("testMatchSoundButton"),
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
  resultBox: document.getElementById("resultBox"),
  resultTimeTop: document.getElementById("resultTimeTop"),
  resultEyebrow: document.getElementById("resultEyebrow"),
  resultTitle: document.getElementById("resultTitle"),
  resultText: document.getElementById("resultText"),
  resultCharacterOrb: document.getElementById("resultCharacterOrb"),
  resultPlayerName: document.getElementById("resultPlayerName"),
  resultCharacterName: document.getElementById("resultCharacterName"),
  resultCurrentLp: document.getElementById("resultCurrentLp"),
  resultLpGain: document.getElementById("resultLpGain"),
  resultReward: document.getElementById("resultReward"),
  resultRewardLabel: document.getElementById("resultRewardLabel"),
  resultDamageDealt: document.getElementById("resultDamageDealt"),
  resultDamageTaken: document.getElementById("resultDamageTaken"),
  resultHealing: document.getElementById("resultHealing"),
  resultHealth: document.getElementById("resultHealth"),
  resultTime: document.getElementById("resultTime")
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
  },
  timekeeper: {
    name: "시간다루는 색히",
    color: "#f2c14e",
    accent: "#67e8f9",
    contactDamage: 0
  },
  riftmaker: {
    name: "균열일으키는 색히",
    color: "#7c3aed",
    accent: "#22d3ee",
    contactDamage: 0
  },
  summoner: {
    name: "소환하는 색히",
    color: "#16a34a",
    accent: "#facc15",
    contactDamage: 0
  },
  swordsman: {
    name: "칼쓰는 색히",
    color: "#e8edf4",
    accent: "#77f7ff",
    contactDamage: 0
  },
  demon: {
    name: "악마의 힘쓰는 색히",
    color: "#1a120e",
    accent: "#38bdf8",
    contactDamage: 0
  },
  artist: {
    name: "그림그리는 색히",
    color: "#f7f4eb",
    accent: "#f472b6",
    contactDamage: 0
  },
  believer: {
    name: "신앙하는 색히",
    color: "#fef3c7",
    accent: "#fb7185",
    contactDamage: 0
  },
  archmage: {
    name: "대마법 쓰는 색히",
    color: "#312e81",
    accent: "#facc15",
    contactDamage: 0
  }
};

const gachaPool = ["charger", "grabber", "poker", "stealth", "enhancer", "tank", "beamer", "wild", "vampire", "brawler", "timekeeper", "riftmaker", "summoner", "swordsman", "demon", "artist", "believer", "archmage"];

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
  brawler: { normal: "투지", ultimate: "야수성" },
  timekeeper: { normal: "건너뛰기", ultimate: "리플레이" },
  riftmaker: { normal: "보이드", ultimate: "게이트" },
  summoner: { normal: "체제 전환", ultimate: "강림" },
  swordsman: { normal: "제 1식", ultimate: "제 2식" },
  demon: { normal: "데빌 버스트", ultimate: "로스트 엔젤" },
  artist: { normal: "드로잉", ultimate: "예술의 혼" },
  believer: { normal: "주신을 위해", ultimate: "커져가는신앙" },
  archmage: { normal: "작열", ultimate: "창해" }
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
    attack: ["은신 돌파", "8초", "3초 동안 은신해 피해와 충돌을 무시하고 적을 관통할 때 15의 피해를 줍니다."],
    normal: ["암살", "17초", "은신 상태에서만 사용할 수 있으며 즉시 적의 뒤로 이동합니다."],
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
  },
  timekeeper: {
    attack: ["초침", "4초", "적이 일정 범위 안에 들어오면 적을 향해 초침을 휘둘러 넓은 원뿔 범위에 15의 피해를 줍니다."],
    normal: ["건너뛰기", "4초", "바라보는 방향으로 순간이동하고 초침 쿨타임을 초기화합니다. 다음 초침 피해가 7로 변경됩니다. 벽은 통과하지 못합니다."],
    ultimate: ["리플레이", "40초", "초침 쿨타임을 즉시 초기화합니다. 0.5초 집중 후 3초 전 위치로 돌아가 잃은 체력의 30%를 회복하고, 넓은 범위에 30 피해의 시간 폭발을 일으킵니다."]
  },
  riftmaker: {
    attack: ["균열", "벽 충돌", "벽에 닿을 때 균열을 남깁니다. 연결 광선에 닿은 적에게 5의 피해를 주고 연결된 일반 균열을 소모합니다."],
    normal: ["보이드", "10초", "가장 가까운 균열에 3초 동안 공허를 열어 범위 안의 적을 천천히 끌어당기고 초당 5의 피해를 줍니다."],
    ultimate: ["게이트", "5초", "모든 균열에서 적을 향해 튕기지 않는 균열 탄환을 발사합니다. 적중 시 10의 피해를 줍니다."]
  },
  summoner: {
    attack: ["일어나라!", "4초", "맵 가장자리의 무작위 위치에 현재 체제의 소환수를 소환합니다. 일반 전사는 체력 12, 일반 궁수는 8 피해의 화살을 사용하며 모든 소환수는 적의 공격을 대신 맞습니다."],
    normal: ["체제 전환", "12초", "소환 체제를 전사와 궁수 사이에서 전환합니다. 전사는 추격과 접촉 공격, 궁수는 거리 유지와 원거리 공격을 담당합니다."],
    ultimate: ["강림", "50초", "현재 체제의 강화 소환수를 부릅니다. 강화 전사는 지속 근접전을, 강화 궁수는 튕기는 강력한 화살 공격을 수행합니다."]
  },
  swordsman: {
    attack: ["기본 공격", "2.5초", "적의 위치로 순간이동하며 검으로 원형 모양으로 8의 회전 베기 피해를 줍니다. 기본적으로 움직이지 않고 체력은 125입니다."],
    normal: ["제 1식", "30초", "3초간 사라진 뒤 원래 위치로 돌아옵니다. 적은 1초간 멈추고, 멈춘 동안 0.1초마다 2의 피해를 받습니다."],
    ultimate: ["제 2식", "60초", "0.3초마다 적을 바라보는 방향의 벽 끝으로 5회 순간이동하며, 회당 20의 피해를 주고 벤 자리에 검흔을 남깁니다."]
  },
  demon: {
    attack: ["데스 소드", "3.5초", "적을 관통하는 암흑 레이저로 5의 피해를 줍니다. 표식이 없으면 5초 표식을 남기고, 표식이 있으면 1개를 지워 2초 둔화를 줍니다."],
    normal: ["데빌 버스트", "9초", "1초 집중 후 악마의 유도탄을 발사해 10의 피해를 줍니다. 표식이 없으면 5초 표식을 남기고, 표식이 있으면 1개를 지워 체력을 10% 회복합니다."],
    ultimate: ["로스트 엔젤", "30초", "적을 관통해 30의 피해를 줍니다. 표식이 없으면 8초 동안 표식 2개를 남기고, 표식이 있으면 모두 지워 표식마다 일반 스킬 쿨타임을 7.5초 줄입니다."]
  },
  artist: {
    attack: ["예술의 궤도", "패시브", "공 1개가 맵을 돌아다니며 반투명한 궤적을 남깁니다. 공은 적에게 닿아도 튕기지 않고 벽에서만 튕기며, 속도는 이동속도의 55%입니다."],
    normal: ["드로잉", "3초", "현재 궤도에 그림을 그려 궤도 위의 적에게 35의 피해를 줍니다. 궤도가 겹쳐도 한 대상에게 한 번만 피해를 줍니다."],
    ultimate: ["예술의 혼", "20초", "5초 동안 공의 속도가 2배가 되고 궤도 크기가 증가합니다."]
  },
  believer: {
    attack: ["기도", "10초", "자신의 체력을 10 회복합니다."],
    normal: ["주신을 위해", "20초", "맵 전체를 5초간 신앙으로 채워 빛냅니다. 자신은 초당 10, 적은 초당 8의 회복을 받습니다."],
    ultimate: ["커져가는신앙", "15초", "맵 중앙에 황금색으로 빛나는 큰 십자가를 생성하고, 게임이 끝날 때까지 맵 전체를 불타는 신앙으로 채웁니다. 적에게 초당 피해를 주며, 사용할 때마다 피해가 1, 2, 4, 8, 16 순서로 2배씩 증가합니다."]
  },
  archmage: {
    attack: ["벼락", "5초", "적에게 낙뢰를 떨어뜨려 3의 피해를 주고 2초 동안 초당 1의 감전 피해와 감전 원소를 부착합니다."],
    normal: ["작열", "8초", "3초 후 맵 전체를 강타하는 파이어 볼을 떨어뜨립니다. 적에게 10의 피해와 2초 동안 초당 2의 화상 피해를 주며 화상 원소를 부착합니다."],
    ultimate: ["창해", "10초", "맵 전체를 5초간 심해로 만듭니다. 물은 적을 느리게 만들며 초당 5의 피해를 주고 습기 원소를 부착합니다."]
  }
};

const enemyGuide = {
  melee: {
    name: "균열 추격자",
    initial: "M",
    color: "#ef476f",
    accent: "#ff9bb0",
    badge: "일반 적",
    entries: [
      ["등장 시점", "게임 시작", "초반부터 등장하며 생존자를 계속 추적합니다."],
      ["공격 방식", "접촉", "생존자에게 닿으면 피해를 주고 잠시 뒤 다시 공격할 수 있습니다."],
      ["시간 강화", "지속 성장", "생존 시간이 길어질수록 체력, 이동속도, 접촉 피해가 증가합니다."]
    ]
  },
  thrower: {
    name: "균열 사수",
    initial: "T",
    color: "#9b7cff",
    accent: "#d1c4ff",
    badge: "원거리 적",
    entries: [
      ["등장 시점", "약 1분 30초", "중반부터 다른 적 사이에 섞여 등장합니다."],
      ["조준 사격", "약 2.5초", "생존자의 현재 위치를 향해 직선 탄환을 한 발 발사합니다."],
      ["대응", "탄환 제거", "적 탄환은 생존자에게 한 번 닿으면 사라집니다."]
    ]
  },
  brute: {
    name: "균열 중장갑",
    initial: "H",
    color: "#7d8796",
    accent: "#d5dde8",
    badge: "방어형 적",
    entries: [
      ["등장 시점", "약 1분 30초", "일반 적보다 낮은 확률로 등장합니다."],
      ["특징", "높은 체력", "느리고 크지만 일반 적보다 훨씬 많은 공격을 버팁니다."],
      ["보상", "XP 7", "처치 시 일반 적보다 큰 경험치 결정을 떨어뜨립니다."]
    ]
  },
  dasher: {
    name: "고속 추격자",
    initial: "R",
    color: "#ff8f3d",
    accent: "#ffd08a",
    badge: "돌진형 적",
    entries: [
      ["등장 시점", "약 40초", "초반 후반부부터 추격자 대신 일정 확률로 등장합니다."],
      ["특징", "빠른 이동", "체력은 낮지만 생존자에게 빠르게 접근합니다."],
      ["대응", "범위 공격", "충격파나 발톱 같은 범위 무기로 처리하기 쉽습니다."]
    ]
  },
  bomber: {
    name: "균열 폭격수",
    initial: "A",
    color: "#d85cff",
    accent: "#f2b4ff",
    badge: "범위형 적",
    entries: [
      ["등장 시점", "약 3분", "후반 웨이브부터 낮은 확률로 등장합니다."],
      ["폭발탄", "약 3.3초", "일반 사수보다 크고 강한 탄환을 생존자 방향으로 발사합니다."],
      ["보상", "XP 6", "위험도가 높은 만큼 많은 경험치를 떨어뜨립니다."]
    ]
  },
  boss: {
    name: "균열 파수꾼",
    initial: "B",
    color: "#f43f5e",
    accent: "#fda4af",
    badge: "5분 주기 보스",
    entries: [
      ["등장 주기", "5분마다", "생존 시간 5분, 10분, 15분마다 더 강한 개체가 출현합니다."],
      ["균열 원형탄", "약 3초", "주변 열 방향으로 느린 탄환을 한 번 발사합니다. 탄 사이가 넓어 지나갈 공간이 있습니다."],
      ["보상", "대량 XP", "처치하면 일반 적보다 훨씬 많은 경험치를 떨어뜨립니다."]
    ]
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
let matchmakingType = "ranked";
let matchmakingGeneration = 0;
let matchmakingRequestPending = false;
let matchTransitionRoomCode = "";
let matchTransitionTimeoutId = null;
let completedMatchTransitionRoomCode = "";
let matchRandomSeed = 1;
let matchStartTimeoutId = null;
let appliedSkillEvents = new Set();
let pendingSkillUse = false;
let soundSettings = loadSoundSettings();
let audioContext = null;
let resimulatingGame = false;
let settlementRequestedWinnerId = "";
let settlementTimeoutId = null;
let serverClockOffsetMs = 0;
let lastBattleClockSyncAt = 0;
let battleClockSyncPending = false;
let pveGame = null;
let pveAnimationId = null;
let pendingPveStage = "";
let selectedPveCharacter = DEFAULT_CHARACTER;
let selectedPveMapStage = "1-1";
let selectedPveDifficulty = "easy";
let pveProgress = { completedStages: [], unlockedStages: ["1-1"] };
let codexType = "character";
let rankingMode = "pvp";

const PVE_STAGES = {
  "1-1": {
    title: "첫 충돌",
    description: "기본 움직임과 충돌 전투를 익히는 첫 작전입니다.",
    enemies: "근접형 1기",
    reward: 10
  },
  "1-2": {
    title: "협공 지대",
    description: "서로 다른 궤도로 움직이는 근접형 적 둘을 상대합니다.",
    enemies: "근접형 2기",
    reward: 10
  },
  "1-3": {
    title: "탄환 교차로",
    description: "투척형의 탄환을 피하면서 근접형 적을 함께 처리합니다.",
    enemies: "근접형 1기 · 투척형 1기",
    reward: 10
  },
  "1-4": {
    title: "중장갑 초소",
    description: "느리지만 체력과 충돌 피해가 높은 중장갑 적이 길을 막습니다.",
    enemies: "중장갑 1기 · 투척형 1기",
    reward: 10
  },
  "1-5": {
    title: "철갑 거체",
    description: "복잡한 패턴 없이 압도적인 체력과 무게로 밀어붙이는 미니보스입니다.",
    enemies: "미니보스 철갑 거체",
    reward: 10
  },
  "1-6": {
    title: "추격 협곡",
    description: "주기적으로 플레이어를 향해 가속 돌진하는 추격형이 등장합니다.",
    enemies: "추격형 2기 · 근접형 1기",
    reward: 10
  },
  "1-7": {
    title: "폭격 지대",
    description: "플레이어가 있던 위치를 조준해 위험 지대를 생성하는 포격형 부대입니다.",
    enemies: "포격형 2기 · 중장갑 1기",
    reward: 10
  },
  "1-8": {
    title: "혼성 부대",
    description: "투척, 추격, 중장갑 병력이 서로 다른 방식으로 압박합니다.",
    enemies: "투척형 · 추격형 · 중장갑",
    reward: 10
  },
  "1-9": {
    title: "성문 돌파",
    description: "챕터 보스 직전의 정예 혼성 부대를 돌파해야 합니다.",
    enemies: "중장갑 2기 · 추격형 · 포격형",
    reward: 10
  },
  "1-10": {
    title: "균열의 지배자",
    description: "탄막, 추적 포격, 광폭 돌진을 순환하는 챕터 1 보스입니다.",
    enemies: "보스 균열의 지배자",
    reward: 100
  }
};

function normalizePlayer(user) {
  return {
    id: user.id,
    name: user.username ?? user.name,
    coins: user.coins,
    lp: user.lp ?? 1000,
    pveDamageTotal: Number(user.pveDamageTotal ?? user.pve_damage_total ?? 0),
    ownedCharacters: [...new Set([DEFAULT_CHARACTER, ...(user.ownedCharacters || user.owned_characters || [])])]
  };
}

function tierForLp(lp, rankPosition = null) {
  if (lp >= 2700 && rankPosition === 1) return "챌린저";
  if (lp >= 2700 && (rankPosition === 2 || rankPosition === 3)) return "그마";
  if (lp >= 2700 && rankPosition !== null && rankPosition >= 4 && rankPosition <= 7) return "마스터";
  if (lp >= 2200) return "다이아";
  if (lp >= 1800) return "플레";
  if (lp >= 1500) return "골드";
  if (lp >= 1200) return "실버";
  if (lp >= 1000) return "브론즈";
  if (lp >= 500) return "아이언";
  return "구리";
}

function tierClassForLp(lp, rankPosition = null) {
  return {
    "챌린저": "tier-challenger",
    "그마": "tier-grandmaster",
    "마스터": "tier-master",
    "다이아": "tier-diamond",
    "플레": "tier-platinum",
    "골드": "tier-gold",
    "실버": "tier-silver",
    "브론즈": "tier-bronze",
    "아이언": "tier-iron",
    "구리": "tier-copper"
  }[tierForLp(lp, rankPosition)];
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

function abandonMatchPresence() {
  if (!appSessionToken || (!matchmakingActive && !currentRoom)) return;
  const config = window.MATCHZZANG_SUPABASE;
  if (!config?.url || !config?.anonKey) return;
  fetch(`${config.url}/rest/v1/rpc/cancel_pvp_match`, {
    method: "POST",
    keepalive: true,
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ session_token: appSessionToken })
  }).catch(() => {});
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
  if (bestSample) {
    serverClockOffsetMs = game
      ? serverClockOffsetMs * 0.75 + bestSample.offset * 0.25
      : bestSample.offset;
  }
}

function savePlayers() {
  // Supabase stores player data online.
}

function getPlayer(id) {
  return players.find(player => player.id === id);
}

function loadSoundSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SOUND_SETTINGS_KEY) || "{}");
    const volume = Number(saved.matchVolume);
    return {
      matchVolume: Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : 0.7
    };
  } catch {
    return { matchVolume: 0.7 };
  }
}

function saveSoundSettings() {
  localStorage.setItem(SOUND_SETTINGS_KEY, JSON.stringify(soundSettings));
}

function updateSoundSettingsUi() {
  const percent = Math.round(soundSettings.matchVolume * 100);
  if (ui.matchSoundVolume) ui.matchSoundVolume.value = String(percent);
  if (ui.matchSoundVolumeText) ui.matchSoundVolumeText.textContent = `${percent}%`;
}

function getAudioContext() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContext = new AudioContextClass();
  }
  return audioContext;
}

function playMatchFoundSound() {
  const volume = soundSettings.matchVolume;
  if (volume <= 0) return;
  const context = getAudioContext();
  if (!context) return;
  if (context.state === "suspended") context.resume().catch(() => {});

  const now = context.currentTime + 0.01;
  const master = context.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.24 * volume, now + 0.03);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 0.72);
  master.connect(context.destination);

  [523.25, 659.25, 783.99].forEach((frequency, index) => {
    const start = now + index * 0.12;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.55, start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.24);
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start(start);
    oscillator.stop(start + 0.28);
  });
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
  matchmakingType = "ranked";
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
    enhancer: "E", tank: "D", beamer: "L", wild: "W", vampire: "V", brawler: "F",
    timekeeper: "C", riftmaker: "R", summoner: "N", swordsman: "K", demon: "M", artist: "A", believer: "H", archmage: "Z"
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
    card.style.setProperty("--char-color", character.color);
    card.style.setProperty("--char-accent", character.accent);
    card.innerHTML = `
      <div class="inventory-orb">${unlocked ? characterInitial(kind) : "?"}</div>
      <div class="inventory-card-copy">
        <strong>${unlocked ? character.name : "미보유 캐릭터"}</strong>
        <span>${unlocked ? "보유 캐릭터" : "상점에서 획득 가능"}</span>
        <em>${unlocked ? "OWNED" : "LOCKED"}</em>
      </div>
    `;
    ui.inventoryGrid.appendChild(card);
  });
}

function renderCodex(selectedKind = null) {
  if (!ui.codexCharacterList || !currentUser) return;
  ui.codexTypeButtons.forEach(button => {
    button.classList.toggle("is-active", button.dataset.codexType === codexType);
  });
  if (codexType === "enemy") {
    renderEnemyCodex(selectedKind);
    return;
  }
  const owned = currentUser.ownedCharacters || [];
  const activeKind = selectedKind
    || ui.codexCharacterList.querySelector(".is-active")?.dataset.character
    || DEFAULT_CHARACTER;

  ui.codexArchiveLabel.textContent = "CHARACTER ARCHIVE";
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

function renderEnemyCodex(selectedType = null) {
  const activeType = selectedType && enemyGuide[selectedType]
    ? selectedType
    : ui.codexCharacterList.querySelector(".is-active")?.dataset.enemy || "melee";
  ui.codexArchiveLabel.textContent = "ENEMY ARCHIVE";
  ui.codexOwnedCount.textContent = `${Object.keys(enemyGuide).length}종 기록`;
  ui.codexCharacterList.innerHTML = Object.entries(enemyGuide).map(([type, enemy]) => `
    <button class="codex-character-button codex-enemy-button ${type === activeType ? "is-active" : ""}"
      type="button" data-enemy="${type}"
      style="--char-color:${enemy.color}; --char-accent:${enemy.accent};">
      <span class="codex-list-orb">${enemy.initial}</span>
      <strong>${enemy.name}</strong>
      <em>${enemy.badge}</em>
    </button>
  `).join("");
  ui.codexCharacterList.querySelectorAll("[data-enemy]").forEach(button => {
    button.addEventListener("click", () => renderEnemyCodex(button.dataset.enemy));
  });
  renderEnemyCodexDetail(activeType);
}

function renderCodexDetail(kind) {
  const character = characters[kind] || characters[DEFAULT_CHARACTER];
  const guide = characterGuide[kind] || characterGuide[DEFAULT_CHARACTER];
  const unlocked = currentUser?.ownedCharacters?.includes(kind);
  const maxHp = characterMaxHp(kind);
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
  ui.codexSkillList.innerHTML = `
    <section class="codex-stat-card">
      <span>체력</span>
      <strong>${maxHp}</strong>
    </section>
  ` + skillTypes.map(([type, skill]) => `
    <section class="codex-skill">
      <span>${type}</span>
      <h4>${skill[0]}</h4>
      <em>${skill[1]}</em>
      <p>${skill[2]}</p>
    </section>
  `).join("");
}

function renderEnemyCodexDetail(type) {
  const enemy = enemyGuide[type] || enemyGuide.melee;
  ui.codexDetail.style.setProperty("--char-color", enemy.color);
  ui.codexDetail.style.setProperty("--char-accent", enemy.accent);
  ui.codexPreview.style.setProperty("--char-color", enemy.color);
  ui.codexPreview.style.setProperty("--char-accent", enemy.accent);
  ui.codexPreviewInitial.textContent = enemy.initial;
  ui.codexCharacterName.textContent = enemy.name;
  ui.codexOwnership.textContent = enemy.badge;
  ui.codexOwnership.classList.remove("is-locked");
  ui.codexSkillList.innerHTML = enemy.entries.map(([typeLabel, title, description]) => `
    <section class="codex-skill codex-enemy-skill">
      <span>${typeLabel}</span>
      <h4>${title}</h4>
      <em>PVE</em>
      <p>${description}</p>
    </section>
  `).join("");
}

function setCodexType(type) {
  if (!["character", "enemy"].includes(type)) return;
  codexType = type;
  renderCodex(type === "enemy" ? "melee" : DEFAULT_CHARACTER);
}

async function loadRankings() {
  if (!ui.rankingList || !currentUser) return;
  if (ui.rankingPodium) ui.rankingPodium.innerHTML = `<div class="ranking-podium-empty">TOP 3 집계 중...</div>`;
  ui.rankingList.innerHTML = `<div class="ranking-empty">랭킹을 불러오는 중...</div>`;
  ui.rankingModeButtons?.forEach(button => {
    const selected = button.dataset.rankingMode === rankingMode;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-pressed", selected ? "true" : "false");
  });

  try {
    const rpcName = rankingMode === "pve" ? "get_pve_rankings" : "get_rankings";
    const rankings = await rpc(rpcName, { session_token: appSessionToken });
    renderRankings(Array.isArray(rankings) ? rankings : [], rankingMode);
  } catch (error) {
    if (ui.rankingPodium) ui.rankingPodium.innerHTML = "";
    ui.rankingList.innerHTML = `<div class="ranking-empty">${escapeHtml(error.message)}</div>`;
  }
}

function renderRankings(rankings, mode = "pvp") {
  if (!ui.rankingList) return;
  if (!rankings.length) {
    if (ui.rankingPodium) ui.rankingPodium.innerHTML = `<div class="ranking-podium-empty">아직 TOP 3가 없습니다.</div>`;
    ui.rankingList.innerHTML = `<div class="ranking-empty">아직 랭킹 데이터가 없습니다.</div>`;
    return;
  }

  renderRankingPodium(rankings.slice(0, 3), mode);
  const myRankIndex = currentUser ? rankings.findIndex(player => player.id === currentUser.id) : -1;
  if (mode === "pvp" && myRankIndex >= 0) {
    const myTier = tierForLp(currentUser.lp, myRankIndex + 1);
    const myTierClass = tierClassForLp(currentUser.lp, myRankIndex + 1);
    ui.currentUserTier.textContent = myTier;
    ui.currentUserName.className = `rank-name ${myTierClass}`;
    ui.currentUserTier.className = `tier-label ${myTierClass}`;
  }
  ui.rankingList.innerHTML = rankings.map((player, index) => {
    const lp = Number(player.lp ?? 1000);
    const pveDamage = Number(player.pveDamageTotal ?? player.pve_damage_total ?? 0);
    const rankPosition = index + 1;
    const tier = mode === "pvp" ? tierForLp(lp, rankPosition) : "PVE";
    const tierClass = mode === "pvp" ? tierClassForLp(lp, rankPosition) : "tier-gold";
    const scoreText = mode === "pvp" ? `${lp} LP` : `${formatResultNumber(pveDamage)} 피해`;
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
        <em>${scoreText}</em>
      </article>
    `;
  }).join("");
}

function renderRankingPodium(topPlayers, mode = "pvp") {
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
        const pveDamage = Number(slot.player.pveDamageTotal ?? slot.player.pve_damage_total ?? 0);
        const tier = mode === "pvp" ? tierForLp(lp, slot.rank) : "PVE";
        const tierClass = mode === "pvp" ? tierClassForLp(lp, slot.rank) : "tier-gold";
        const scoreText = mode === "pvp" ? `${lp} LP` : `${formatResultNumber(pveDamage)} 피해`;
        return `
          <article class="podium-slot ${slot.className}">
            <div class="podium-player">
              <span>${slot.rank === 1 ? "♛" : "◆"}</span>
              <strong class="${tierClass}">${escapeHtml(slot.player.name || slot.player.username || "unknown")}</strong>
              <em>${scoreText}</em>
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
  if (!currentUser) return;
  if (matchmakingActive) return;
  selectedMode = "pvp";
  ui.pvpModeButton.classList.add("is-selected");
  ui.pveModeButton.classList.remove("is-selected");
  ui.modeMessage.textContent = "";
  showScreen("pvpQueue");
}

async function startMatchmaking(type = "ranked") {
  if (!currentUser) return;
  if (matchmakingActive) return;
  selectedMode = "pvp";
  resetLocalMatchState();
  matchmakingType = type === "casual" ? "casual" : "ranked";
  const generation = matchmakingGeneration;
  renderLobby();
  matchmakingActive = true;
  ui.pvpModeButton.classList.add("is-selected");
  ui.pveModeButton.classList.remove("is-selected");
  ui.cancelMatchButton.classList.remove("is-hidden");
  ui.modeMessage.textContent = matchmakingType === "casual" ? "일반게임 매칭중..." : "랭크게임 매칭중...";
  ui.pvpModeButton.disabled = true;
  showScreen("lobby");
  await checkMatchmaking(generation);
  if (matchmakingActive && generation === matchmakingGeneration) setMatchmakingPolling(true);
}

async function checkMatchmaking(expectedGeneration = matchmakingGeneration) {
  if (!matchmakingActive || matchmakingRequestPending || expectedGeneration !== matchmakingGeneration) return;
  matchmakingRequestPending = true;
  try {
    const data = await rpc("find_pvp_match", {
      session_token: appSessionToken,
      casual: matchmakingType === "casual"
    });
    if (!matchmakingActive || expectedGeneration !== matchmakingGeneration) return;
    if (!data.matched) {
      const label = matchmakingType === "casual" ? "일반게임 매칭중" : "랭크게임 매칭중";
      ui.modeMessage.textContent = `${label}... ${data.elapsed ?? 0}초`;
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

async function selectPveMode() {
  if (matchmakingActive) {
    await cancelMatchmaking();
  }
  selectedMode = "pve";
  ui.pveModeButton.classList.add("is-selected");
  ui.pvpModeButton.classList.remove("is-selected");
  ui.modeMessage.textContent = "";
  selectSurvivalDifficulty(selectedPveDifficulty);
  showScreen("pve");
}

function computeUnlockedPveStages(completedStages) {
  const unlocked = ["1-1"];
  for (let index = 1; index < 10; index += 1) {
    if (!completedStages.includes(`1-${index}`)) break;
    unlocked.push(`1-${index + 1}`);
  }
  return unlocked;
}

async function loadPveProgress() {
  try {
    const data = await rpc("get_pve_progress", { session_token: appSessionToken });
    const completedStages = data.completedStages || data.completed_stages || [];
    pveProgress = {
      completedStages,
      unlockedStages: data.unlockedStages || data.unlocked_stages || computeUnlockedPveStages(completedStages)
    };
  } catch (error) {
    pveProgress = { completedStages: [], unlockedStages: ["1-1"] };
    ui.modeMessage.textContent = error.message;
  }
  if (!pveProgress.unlockedStages.includes(selectedPveMapStage)) {
    selectedPveMapStage = pveProgress.unlockedStages.at(-1) || "1-1";
  }
  renderPveWorldMap();
}

function renderPveWorldMap() {
  ui.pveStageButtons.forEach(button => {
    const stage = button.dataset.pveStage;
    const locked = !pveProgress.unlockedStages.includes(stage);
    button.disabled = locked;
    button.classList.toggle("is-locked", locked);
    button.classList.toggle("is-completed", pveProgress.completedStages.includes(stage));
    button.classList.toggle("is-selected", stage === selectedPveMapStage);
    button.setAttribute("aria-pressed", stage === selectedPveMapStage ? "true" : "false");
  });

  const stage = PVE_STAGES[selectedPveMapStage];
  const completed = pveProgress.completedStages.includes(selectedPveMapStage);
  const locked = !pveProgress.unlockedStages.includes(selectedPveMapStage);
  ui.pveStageDetailCode.textContent = `STAGE ${selectedPveMapStage}`;
  ui.pveStageDetailTitle.textContent = stage.title;
  ui.pveStageDetailDescription.textContent = stage.description;
  ui.pveStageDetailEnemies.textContent = stage.enemies;
  ui.pveStageDetailReward.textContent = selectedPveMapStage === "1-10"
    ? pveProgress.completedStages.includes("1-10") ? "재도전 10C" : "최초 클리어 100C"
    : `${stage.reward}C`;
  ui.pveStageDetailStatus.textContent = locked ? "이전 스테이지 클리어 필요" : completed ? "클리어 완료" : "도전 가능";
  ui.pveStageDetailStatus.classList.toggle("is-completed", completed);
  ui.pveStageStartButton.disabled = locked;
  ui.pveStageStartButton.textContent = locked ? "잠김" : "게임 시작";
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
  await rpc("cancel_pvp_match", { session_token: appSessionToken }).catch(() => {});
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
  playMatchFoundSound();
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

function setAccountModalOpen(open) {
  ui.accountModal.classList.toggle("is-active", open);
  ui.accountModal.setAttribute("aria-hidden", open ? "false" : "true");
  if (open) {
    ui.accountCurrentUsername.value = currentUser?.name || "";
    ui.accountCurrentPassword.value = "";
    ui.accountNewUsername.value = currentUser?.name || "";
    ui.accountNewPassword.value = "";
    ui.accountNewPasswordConfirm.value = "";
    ui.accountMessage.textContent = "";
    setTimeout(() => ui.accountCurrentPassword.focus(), 0);
  }
}

async function saveAccountChanges() {
  if (!currentUser) return;
  const currentUsername = ui.accountCurrentUsername.value.trim();
  const currentPassword = ui.accountCurrentPassword.value;
  const newUsername = ui.accountNewUsername.value.trim();
  const newPassword = ui.accountNewPassword.value;
  const newPasswordConfirm = ui.accountNewPasswordConfirm.value;

  if (!currentUsername || !currentPassword) {
    ui.accountMessage.textContent = "현재 아이디와 비밀번호를 입력하세요.";
    return;
  }
  if (newPassword !== newPasswordConfirm) {
    ui.accountMessage.textContent = "새 비밀번호 확인이 맞지 않습니다.";
    return;
  }
  if (!newUsername && !newPassword) {
    ui.accountMessage.textContent = "새 닉네임이나 새 비밀번호를 입력하세요.";
    return;
  }

  ui.accountSaveButton.disabled = true;
  ui.accountMessage.textContent = "변경 중...";
  try {
    const data = await rpc("update_account", {
      session_token: appSessionToken,
      current_user_name: currentUsername,
      current_password: currentPassword,
      new_user_name: newUsername,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm
    });
    currentUser = normalizePlayer(data.user);
    players = players.map(player => player.id === currentUser.id ? currentUser : player);
    renderLobby();
    ui.accountMessage.textContent = "변경 완료!";
    setTimeout(() => setAccountModalOpen(false), 450);
  } catch (error) {
    ui.accountMessage.textContent = error.message;
  } finally {
    ui.accountSaveButton.disabled = false;
  }
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
    stealth: 1020,
    enhancer: 600,
    tank: 720,
    beamer: 720,
    wild: 1080,
    vampire: 0,
    brawler: 0,
    timekeeper: 540,
    riftmaker: 600,
    summoner: 720,
    swordsman: 1800,
    demon: 540,
    artist: 180,
    believer: 1200,
    archmage: 480
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
    brawler: 0,
    timekeeper: 2400,
    riftmaker: 300,
    summoner: 3000,
    swordsman: 3600,
    demon: 1800,
    artist: 1200,
    believer: 900,
    archmage: 600
  }[kind] ?? Infinity;
}

function characterMaxHp(kind) {
  return {
    swordsman: 125,
    archmage: 150,
    believer: 175,
    charger: 250,
    tank: 250
  }[kind] ?? 200;
}

function makeCharacterCombatState(kind) {
  const character = characters[kind];
  const maxHp = characterMaxHp(kind);
  return {
    kind,
    name: character.name,
    color: character.color,
    accent: character.accent,
    radius: 32,
    hp: maxHp,
    maxHp,
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
    stealthTimer: character.canStealth ? 480 : Infinity,
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
    phaseTime: 0,
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
    idleAttackTime: 0,
    clockHandTimer: kind === "timekeeper" ? 240 : Infinity,
    clockDamageOverride: 0,
    timeHistory: [],
    replayWindup: 0,
    replayTarget: null,
    riftWallCooldown: 0,
    summonTimer: kind === "summoner" ? 240 : Infinity,
    summonMode: "warrior",
    swordTimer: kind === "swordsman" ? 150 : Infinity,
    swordDanceTime: 0,
    swordDanceTimer: 0,
    swordDanceHits: 0,
    swordReturnX: 0,
    swordReturnY: 0,
    swordUltimateHits: 0,
    swordUltimateTimer: 0,
    demonSwordTimer: kind === "demon" ? 210 : Infinity,
    demonBurstWindup: 0,
    demonMarkCount: 0,
    demonMarkTime: 0,
    artSoulTime: 0,
    prayerTimer: kind === "believer" ? 600 : Infinity,
    ceremonyTime: 0,
    ceremonyTick: 0,
    faithStacks: 0,
    faithBurnTick: 60,
    mageLightningTimer: kind === "archmage" ? 300 : Infinity,
    mageFireDelay: 0,
    mageSeaTime: 0,
    mageSeaTick: 60,
    mageElements: { wet: 0, fire: 0, electro: 0 },
    mageDots: {},
    mageReaction: null,
    damageDealt: 0,
    damageTaken: 0,
    healingDone: 0
  };
}

function characterBaseSpeed(fighter) {
  if (fighter.kind === "swordsman") return 0;
  if (fighter.stealthTime > 0) return fighter.hyperStealthActive ? 125 : 12.5;
  if (fighter.canThrow) return 5.9;
  if (fighter.canGrab) return 6.2;
  if (fighter.kind === "riftmaker") return 5.44;
  if (fighter.kind === "tank") return 5.7;
  if (fighter.kind === "brawler") return 7.1;
  return 6.8;
}

function makeFighter(kind, label, ownerId, x, y) {
  const velocity = randomVelocity(6.5);
  return {
    ...makeCharacterCombatState(kind),
    label,
    ownerId,
    ownerName: getPlayer(ownerId).name,
    x,
    y,
    vx: velocity.vx,
    vy: velocity.vy
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

  const stealthMirror = selections.p1 === "stealth" && selections.p2 === "stealth";
  const easterWinnerIndex = stealthMirror && seededRandom() < 0.5 ? 0 : 1;
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
    rifts: [],
    summons: [],
    artOrbs: [],
    damageTexts: [],
    visualEffects: [],
    contactLock: false,
    over: false,
    tick: 0,
    easterEgg: stealthMirror ? {
      active: true,
      winnerIndex: easterWinnerIndex,
      revealTick: 180,
      finishTick: 300,
      revealed: false
    } : null,
    startTimeMs: Number((currentRoom?.prepState || currentRoom?.prep_state || {}).matchStartAt || 0) * 1000 || serverNowMs(),
    lastCanonicalTick: 0
  };
  game.fighters.forEach(fighter => {
    if (fighter.kind === "artist") spawnArtOrb(fighter);
  });
  appliedSkillEvents = new Set();
  pendingSkillUse = false;

  ui.currentBet.textContent = "+10~20 LP";
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
  if (fighter.phaseTime > 0) return;
  let finalAmount = amount;
  const reduction = fighter.shieldTime > 0 ? 0.9 : fighter.damageReduction;
  finalAmount *= 1 - reduction;
  finalAmount = Math.max(0, finalAmount);
  const actualDamage = Math.min(fighter.hp, finalAmount);
  fighter.hp = clamp(fighter.hp - finalAmount, 0, fighter.maxHp);
  fighter.damageTaken += actualDamage;
  if (attacker && attacker !== fighter) attacker.damageDealt += actualDamage;
  fighter.hitFlash = 10;
  addDamageText(fighter.x, fighter.y - fighter.radius, Math.round(finalAmount * 10) / 10);
  if (attacker?.kind === "vampire") {
    heal(attacker, finalAmount * 0.3);
  }
  if (fighter.kind === "brawler" && !fighter.gritUsed && fighter.hp <= fighter.maxHp * 0.5 && fighter.hp > 0) {
    fighter.gritUsed = true;
    fighter.gritActive = true;
    heal(fighter, fighter.maxHp * 0.3);
    addSkillPulse(fighter, fighter.accent);
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
    const damageToA = Math.min(a.hp, bDamage);
    const damageToB = Math.min(b.hp, aDamage);
    a.damageTaken += damageToA;
    b.damageTaken += damageToB;
    a.damageDealt += damageToB;
    b.damageDealt += damageToA;
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

function addSkillPulse(fighter, color = fighter.accent) {
  addVisualEffect({
    type: "skill-pulse",
    fighter,
    color,
    life: 28,
    maxLife: 28
  });
}

function fighterDirection(fighter) {
  const speed = Math.hypot(fighter.vx, fighter.vy);
  if (speed > 0.001) return { x: fighter.vx / speed, y: fighter.vy / speed };
  const seed = hashSeed(`${currentRoom?.code || "local"}|${fighter.ownerId}|${game?.tick || 0}`);
  const angle = (seed / 4294967296) * Math.PI * 2;
  return { x: Math.cos(angle), y: Math.sin(angle) };
}

function skipTime(fighter) {
  const direction = fighterDirection(fighter);
  const fromX = fighter.x;
  const fromY = fighter.y;
  const distance = 190;
  fighter.x = clamp(fighter.x + direction.x * distance, fighter.radius, canvas.width - fighter.radius);
  fighter.y = clamp(fighter.y + direction.y * distance, fighter.radius, canvas.height - fighter.radius);
  fighter.clockHandTimer = 0;
  fighter.clockDamageOverride = 7;
  addVisualEffect({
    type: "time-skip",
    x1: fromX,
    y1: fromY,
    x2: fighter.x,
    y2: fighter.y,
    color: fighter.accent,
    life: 24,
    maxLife: 24
  });
}

function beginReplay(fighter) {
  const snapshot = fighter.timeHistory[0] || {
    x: fighter.x,
    y: fighter.y,
    hp: fighter.hp
  };
  fighter.replayTarget = {
    x: snapshot.x,
    y: snapshot.y,
    lostHp: Math.max(0, snapshot.hp - fighter.hp)
  };
  fighter.clockHandTimer = 0;
  fighter.replayWindup = 30;
  addVisualEffect({
    type: "replay-charge",
    fighter,
    color: fighter.accent,
    life: 30,
    maxLife: 30
  });
}

function finishReplay(fighter) {
  const target = fighter.replayTarget;
  if (!target) return;
  const fromX = fighter.x;
  const fromY = fighter.y;
  fighter.x = clamp(target.x, fighter.radius, canvas.width - fighter.radius);
  fighter.y = clamp(target.y, fighter.radius, canvas.height - fighter.radius);
  heal(fighter, target.lostHp * 0.3);
  addVisualEffect({
    type: "time-skip",
    x1: fromX,
    y1: fromY,
    x2: fighter.x,
    y2: fighter.y,
    color: fighter.accent,
    life: 34,
    maxLife: 34
  });
  addVisualEffect({
    type: "time-explosion",
    x: fighter.x,
    y: fighter.y,
    color: fighter.accent,
    radius: 185,
    life: 34,
    maxLife: 34
  });
  const summonTarget = enemySummonInArea(fighter, fighter.x, fighter.y, 185);
  const targetFighter = opponentOf(fighter);
  if (summonTarget) {
    damageSummon(summonTarget, 30, fighter);
  } else if (Math.hypot(targetFighter.x - fighter.x, targetFighter.y - fighter.y) <= 185 + targetFighter.radius) {
    damage(targetFighter, 30, fighter);
  }
  fighter.replayTarget = null;
}

function swingClockHand(fighter) {
  const target = nearestEnemyTarget(fighter);
  const damageAmount = fighter.clockDamageOverride || 15;
  fighter.clockDamageOverride = 0;
  const dx = target.x - fighter.x;
  const dy = target.y - fighter.y;
  const distance = Math.hypot(dx, dy);
  const fallback = fighterDirection(fighter);
  const direction = distance > 0
    ? { x: dx / distance, y: dy / distance }
    : fallback;
  const effect = {
    type: "clock-sweep",
    fighter,
    direction,
    color: fighter.accent,
    range: 215,
    halfAngle: Math.PI / 3,
    hitOpponent: false,
    hitSummonIds: [],
    damage: damageAmount,
    life: 28,
    maxLife: 28
  };
  addVisualEffect(effect);
  resolveClockSweepHits(game.visualEffects[game.visualEffects.length - 1]);
}

function targetInsideClockSweep(effect, target) {
  const fighter = effect.fighter;
  const dx = target.x - fighter.x;
  const dy = target.y - fighter.y;
  const distance = Math.hypot(dx, dy);
  if (distance > effect.range + target.radius) return false;
  const dot = distance > 0
    ? (dx / distance) * effect.direction.x + (dy / distance) * effect.direction.y
    : 1;
  return dot >= Math.cos(effect.halfAngle);
}

function resolveClockSweepHits(effect) {
  if (!effect?.fighter || effect.fighter.hp <= 0) return;
  const target = opponentOf(effect.fighter);
  if (!effect.hitOpponent && target?.hp > 0 && targetInsideClockSweep(effect, target)) {
    effect.hitOpponent = true;
    damage(target, effect.damage || 15, effect.fighter);
  }
  enemySummonsOf(effect.fighter).forEach(summon => {
    if (effect.hitSummonIds.includes(summon.id) || !targetInsideClockSweep(effect, summon)) return;
    effect.hitSummonIds.push(summon.id);
    damageSummon(summon, effect.damage || 15, effect.fighter);
  });
}

function wallPoint(wall, ratio = 0.5, radius = 16) {
  if (wall === "left") return { x: radius, y: radius + ratio * (canvas.height - radius * 2) };
  if (wall === "right") return { x: canvas.width - radius, y: radius + ratio * (canvas.height - radius * 2) };
  if (wall === "top") return { x: radius + ratio * (canvas.width - radius * 2), y: radius };
  return { x: radius + ratio * (canvas.width - radius * 2), y: canvas.height - radius };
}

function addRift(owner, x, y, isVoid = false, wall = "") {
  const ownedRifts = game.rifts.filter(rift => rift.owner === owner);
  if (ownedRifts.length >= 7) {
    const oldest = ownedRifts[0];
    game.rifts = game.rifts.filter(rift => rift !== oldest);
  }
  game.rifts.push({
    owner,
    x,
    y,
    wall,
    isVoid,
    hitsRemaining: isVoid ? 3 : 1,
    hitCooldown: 0,
    gateCooldown: 0,
    voidFieldTime: 0,
    voidDamageTick: 0,
    life: isVoid ? 1800 : 900
  });
}

function createVoidRift(fighter) {
  const rift = nearestOwnedRift(fighter);
  if (!rift) return false;
  rift.isVoid = true;
  rift.hitsRemaining = Math.max(rift.hitsRemaining, 3);
  rift.voidFieldTime = 180;
  rift.voidDamageTick = 0;
  rift.life = Math.max(rift.life, 360);
  addVisualEffect({
    type: "void-rift",
    x: rift.x,
    y: rift.y,
    color: fighter.accent,
    radius: 160,
    life: 42,
    maxLife: 42
  });
  addSkillPulse(fighter, fighter.accent);
  return true;
}

function nearestOwnedRift(fighter) {
  if (!game) return null;
  let nearest = null;
  let nearestDistance = Infinity;
  game.rifts.forEach(rift => {
    if (rift.owner !== fighter || rift.life <= 0 || rift.hitsRemaining <= 0) return;
    const distance = Math.hypot(fighter.x - rift.x, fighter.y - rift.y);
    if (distance < nearestDistance) {
      nearest = rift;
      nearestDistance = distance;
    }
  });
  return nearest;
}

function useRiftGate(fighter) {
  const rifts = game.rifts.filter(rift => rift.owner === fighter && rift.life > 0 && rift.hitsRemaining > 0);
  if (!rifts.length) return false;
  rifts.forEach(rift => {
    const target = nearestEnemyTarget(fighter, rift.x, rift.y);
    const angle = Math.atan2(target.y - rift.y, target.x - rift.x);
    game.balls.push({
      owner: fighter,
      x: rift.x + Math.cos(angle) * 22,
      y: rift.y + Math.sin(angle) * 22,
      vx: Math.cos(angle) * 13.6,
      vy: Math.sin(angle) * 13.6,
      radius: 12,
      life: 190,
      hitCooldown: 0,
      damage: 10,
      speed: 13.6,
      color: fighter.accent,
      homing: false,
      star: false,
      riftShot: true,
      noBounce: true
    });
    addVisualEffect({
      type: "void-rift",
      x: rift.x,
      y: rift.y,
      color: fighter.accent,
      radius: 72,
      life: 26,
      maxLife: 26
    });
  });
  addSkillPulse(fighter, fighter.accent);
  return true;
}

function pointSegmentDistance(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;
  if (!lengthSquared) return Math.hypot(px - x1, py - y1);
  const t = clamp(((px - x1) * dx + (py - y1) * dy) / lengthSquared, 0, 1);
  return Math.hypot(px - (x1 + dx * t), py - (y1 + dy * t));
}

function riftConnections(rifts) {
  const connections = [];
  const seen = new Set();
  const addConnection = (a, b) => {
    if (!a || !b || a === b) return;
    const aIndex = game.rifts.indexOf(a);
    const bIndex = game.rifts.indexOf(b);
    const key = aIndex < bIndex ? `${aIndex}:${bIndex}` : `${bIndex}:${aIndex}`;
    if (seen.has(key)) return;
    seen.add(key);
    connections.push([a, b]);
  };
  for (let index = 1; index < rifts.length; index += 1) {
    addConnection(rifts[index - 1], rifts[index]);
  }
  rifts.filter(rift => rift.isVoid).forEach(voidRift => {
    rifts.forEach(rift => addConnection(voidRift, rift));
  });
  return connections;
}

function updateRifts(dt) {
  game.rifts.forEach(rift => {
    rift.life -= dt;
    rift.hitCooldown = Math.max(0, rift.hitCooldown - dt);
    if (rift.voidFieldTime > 0) {
      rift.voidFieldTime -= dt;
      rift.voidDamageTick -= dt;
      const radius = VOID_RIFT_RADIUS;
      const targets = [opponentOf(rift.owner), ...enemySummonsOf(rift.owner)].filter(target => target && target.hp > 0);
      targets.forEach(target => {
        const dx = rift.x - target.x;
        const dy = rift.y - target.y;
        const distance = Math.hypot(dx, dy) || 1;
        if (distance > radius + target.radius) return;
        const pull = target.owner ? 1.8 : 1.15;
        target.x += dx / distance * pull * dt;
        target.y += dy / distance * pull * dt;
        if (!target.owner) {
          target.vx = target.vx * 0.94 + dx / distance * 0.28;
          target.vy = target.vy * 0.94 + dy / distance * 0.28;
        }
      });
      if (rift.voidDamageTick <= 0) {
        rift.voidDamageTick = 60;
        targets.forEach(target => {
          if (Math.hypot(target.x - rift.x, target.y - rift.y) > radius + target.radius) return;
          damageCombatTarget(target, 5, rift.owner);
        });
      }
    }
  });

  const owners = [...new Set(game.rifts.map(rift => rift.owner))];
  owners.forEach(owner => {
    const rifts = game.rifts.filter(rift => rift.owner === owner && rift.life > 0 && rift.hitsRemaining > 0);
    const target = opponentOf(owner);
    const connections = riftConnections(rifts);
    for (const [a, b] of connections) {
      if (a.voidFieldTime > 0 || b.voidFieldTime > 0) continue;
      if (a.hitCooldown > 0 || b.hitCooldown > 0) continue;
      const summonTarget = enemySummonOnLine(owner, a.x, a.y, b.x, b.y, 8);
      if (!summonTarget && pointSegmentDistance(target.x, target.y, a.x, a.y, b.x, b.y) > target.radius + 8) continue;
      if (summonTarget) damageSummon(summonTarget, 5, owner);
      else damage(target, 5, owner);
      a.hitsRemaining -= 1;
      b.hitsRemaining -= 1;
      a.hitCooldown = 30;
      b.hitCooldown = 30;
      addVisualEffect({
        type: "rift-hit",
        x: summonTarget?.x ?? target.x,
        y: summonTarget?.y ?? target.y,
        color: owner.accent,
        life: 24,
        maxLife: 24
      });
      break;
    }
  });

  game.rifts = game.rifts.filter(rift => rift.life > 0 && rift.hitsRemaining > 0);
}

function randomEdgePosition(radius = 20) {
  const wall = Math.floor(seededRandom() * 4);
  const ratio = 0.12 + seededRandom() * 0.76;
  if (wall === 0) return { x: radius, y: radius + ratio * (canvas.height - radius * 2) };
  if (wall === 1) return { x: canvas.width - radius, y: radius + ratio * (canvas.height - radius * 2) };
  if (wall === 2) return { x: radius + ratio * (canvas.width - radius * 2), y: radius };
  return { x: radius + ratio * (canvas.width - radius * 2), y: canvas.height - radius };
}

function summonUnit(owner, elite = false) {
  const type = owner.summonMode;
  const archer = type === "archer";
  const radius = elite ? 25 : 19;
  const position = randomEdgePosition(radius);
  game.summons.push({
    owner,
    type,
    elite,
    x: position.x,
    y: position.y,
    vx: 0,
    vy: 0,
    radius,
    hp: archer ? (elite ? 20 : 5) : (elite ? 60 : 12),
    maxHp: archer ? (elite ? 20 : 5) : (elite ? 60 : 12),
    life: archer && !elite ? 600 : Infinity,
    attackTimer: archer ? (elite ? 300 : 180) : Infinity,
    contactCooldown: 0,
    fighterContactCooldown: 0,
    hitFlash: 0
  });
  addVisualEffect({
    type: "summon-arrival",
    x: position.x,
    y: position.y,
    color: archer ? "#facc15" : "#4ade80",
    life: 34,
    maxLife: 34
  });
}

function damageSummon(summon, amount, attacker = null) {
  if (amount <= 0 || summon.hp <= 0) return;
  const actualDamage = Math.min(summon.hp, amount);
  summon.hp -= actualDamage;
  summon.hitFlash = 8;
  addDamageText(summon.x, summon.y - summon.radius, Math.round(actualDamage * 10) / 10);
  if (attacker && attacker !== summon.owner) attacker.damageDealt += actualDamage;
  if (attacker?.kind === "vampire") {
    heal(attacker, actualDamage * 0.3);
  }
  addVisualEffect({
    type: "rage-burst",
    fighter: summon,
    life: 16,
    maxLife: 16,
    color: attacker?.accent || summon.owner.accent
  });
}

function enemySummonsOf(owner) {
  return game.summons.filter(summon => summon.owner !== owner && summon.hp > 0 && summon.life > 0);
}

function collidingEnemySummon(owner, x, y, radius = 0) {
  return enemySummonsOf(owner).find(summon => Math.hypot(summon.x - x, summon.y - y) < summon.radius + radius) || null;
}

function enemySummonInArea(owner, x, y, radius) {
  return enemySummonsOf(owner).find(summon => Math.hypot(summon.x - x, summon.y - y) < summon.radius + radius) || null;
}

function enemySummonOnLine(owner, x1, y1, x2, y2, width) {
  return enemySummonsOf(owner).find(summon => pointSegmentDistance(summon.x, summon.y, x1, y1, x2, y2) < summon.radius + width) || null;
}

function fireSummonArrow(summon) {
  const target = nearestEnemyTarget(summon.owner, summon.x, summon.y);
  const angle = Math.atan2(target.y - summon.y, target.x - summon.x);
  const elite = summon.elite;
  game.balls.push({
    owner: summon.owner,
    sourceSummon: summon,
    x: summon.x + Math.cos(angle) * (summon.radius + 12),
    y: summon.y + Math.sin(angle) * (summon.radius + 12),
    vx: Math.cos(angle) * (elite ? 12 : 14),
    vy: Math.sin(angle) * (elite ? 12 : 14),
    radius: elite ? 9 : 7,
    life: elite ? 300 : 180,
    hitCooldown: 0,
    damage: elite ? 15 : 8,
    speed: elite ? 12 : 14,
    color: elite ? "#fde047" : "#86efac",
    homing: false,
    star: false,
    summonArrow: true,
    persistentArrow: elite,
    noBounce: !elite
  });
}

function updateSummons(dt) {
  game.summons.forEach(summon => {
    summon.life -= dt;
    summon.contactCooldown = Math.max(0, summon.contactCooldown - dt);
    summon.fighterContactCooldown = Math.max(0, summon.fighterContactCooldown - dt);
    summon.hitFlash = Math.max(0, summon.hitFlash - dt);
    if (summon.demonMarkTime > 0) {
      summon.demonMarkTime -= dt;
      if (summon.demonMarkTime <= 0) {
        summon.demonMarkCount = 0;
        summon.demonMarkTime = 0;
      }
    }
    const target = nearestEnemyTarget(summon.owner, summon.x, summon.y);
    const enemyFighter = opponentOf(summon.owner);
    const ownerSpeed = Math.max(0.1, Math.hypot(summon.owner.vx, summon.owner.vy) || characterBaseSpeed(summon.owner));
    const dx = target.x - summon.x;
    const dy = target.y - summon.y;
    const distance = Math.hypot(dx, dy) || 1;

    if (summon.type === "warrior") {
      const speed = ownerSpeed * 0.5;
      summon.vx = dx / distance * speed;
      summon.vy = dy / distance * speed;
      summon.x += summon.vx * dt;
      summon.y += summon.vy * dt;
      bounceOnWalls(summon);
      if (distance < summon.radius + target.radius && summon.contactCooldown <= 0) {
        if (summon.elite) {
          damageCombatTarget(target, 15, summon.owner);
          damageSummon(summon, 15, target.owner || target);
          summon.contactCooldown = 30;
          const angle = Math.atan2(summon.y - target.y, summon.x - target.x);
          summon.x += Math.cos(angle) * 22;
          summon.y += Math.sin(angle) * 22;
        } else {
          damageCombatTarget(target, summon.hp, summon.owner);
          summon.hp = 0;
        }
      }
    } else {
      const fleeRange = 190;
      const speed = ownerSpeed * (summon.elite ? 0.1 : 0.3);
      if (distance < fleeRange) {
        summon.vx = -dx / distance * speed;
        summon.vy = -dy / distance * speed;
        summon.x += summon.vx * dt;
        summon.y += summon.vy * dt;
        bounceOnWalls(summon);
      } else {
        summon.vx = 0;
        summon.vy = 0;
      }
      summon.attackTimer -= dt;
      if (summon.attackTimer <= 0) {
        fireSummonArrow(summon);
        summon.attackTimer = summon.elite ? 300 : 180;
      }
    }

    if (summon.hp > 0 && Math.hypot(enemyFighter.x - summon.x, enemyFighter.y - summon.y) < enemyFighter.radius + summon.radius) {
      const contactDamage = enemyFighter.kind === "enhancer" ? enemyFighter.attackPower : enemyFighter.contactDamage;
      if (contactDamage > 0 && summon.fighterContactCooldown <= 0) {
        damageSummon(summon, contactDamage, enemyFighter);
        summon.fighterContactCooldown = 24;
      }
      if (enemyFighter.kind === "wild" && summon.fighterContactCooldown <= 0) {
        createWildSlashes(enemyFighter, summon.x, summon.y);
        summon.fighterContactCooldown = 30;
      }
      resolveFighterSummonImpact(enemyFighter, summon);
    }
  });
  game.summons = game.summons.filter(summon => summon.hp > 0 && summon.life > 0);
}

function resolveFighterSummonImpact(fighter, summon) {
  const dx = summon.x - fighter.x;
  const dy = summon.y - fighter.y;
  const distance = Math.hypot(dx, dy) || 1;
  const minDistance = fighter.radius + summon.radius;
  if (distance >= minDistance) return;
  const nx = dx / distance;
  const ny = dy / distance;
  const overlap = minDistance - distance;
  fighter.x -= nx * overlap * 0.62;
  fighter.y -= ny * overlap * 0.62;
  summon.x += nx * overlap * 0.38;
  summon.y += ny * overlap * 0.38;
  bounceOnWalls(fighter);
  bounceOnWalls(summon);

  const fighterNormalSpeed = fighter.vx * nx + fighter.vy * ny;
  const summonNormalSpeed = summon.vx * nx + summon.vy * ny;
  fighter.vx += (summonNormalSpeed - fighterNormalSpeed) * nx - nx * 1.6;
  fighter.vy += (summonNormalSpeed - fighterNormalSpeed) * ny - ny * 1.6;
  summon.vx += (fighterNormalSpeed - summonNormalSpeed) * nx + nx * 1.2;
  summon.vy += (fighterNormalSpeed - summonNormalSpeed) * ny + ny * 1.2;

  if (fighter.kind === "wild" && fighter.chaseTime > 0) {
    fighter.slowTime = Math.max(fighter.slowTime, 30);
    fighter.chaseBounceTime = Math.max(fighter.chaseBounceTime, 24);
  }
}

function finishGame(winner) {
  if (game.over) return;
  game.over = true;
  game.winner = winner;
  if (resimulatingGame) return;
  presentGameWinner(winner);
}

function formatBattleTime(ticks) {
  const totalSeconds = Math.max(0, Math.round((ticks || 0) / 60));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function formatResultNumber(value) {
  const rounded = Math.round((Number(value) || 0) * 10) / 10;
  return rounded.toLocaleString("ko-KR", { maximumFractionDigits: 1 });
}

function setResultCharacter(orb, fighter) {
  orb.textContent = characterInitial(fighter.kind);
  orb.style.setProperty("--result-color", fighter.color);
  orb.style.setProperty("--result-accent", fighter.accent);
}

function renderPvpResultSummary(fighter, outcome) {
  const elapsed = formatBattleTime(game?.tick);
  const player = getPlayer(fighter.ownerId);
  setResultCharacter(ui.resultCharacterOrb, fighter);
  ui.resultTimeTop.textContent = elapsed;
  ui.resultTime.textContent = elapsed;
  ui.resultPlayerName.textContent = fighter.ownerName || player.name;
  ui.resultCharacterName.textContent = fighter.name;
  ui.resultCurrentLp.textContent = `${player.lp} LP`;
  ui.resultDamageDealt.textContent = formatResultNumber(fighter.damageDealt);
  ui.resultDamageTaken.textContent = formatResultNumber(fighter.damageTaken);
  ui.resultHealing.textContent = formatResultNumber(fighter.healingDone);
  ui.resultHealth.textContent = `${Math.ceil(fighter.hp)} / ${fighter.maxHp}`;

  if (outcome === "draw") {
    ui.resultEyebrow.textContent = "MATCH DRAW";
    ui.resultTitle.textContent = "무승부";
    ui.resultText.textContent = "승부를 가리지 못했습니다.";
    ui.resultLpGain.textContent = "+0 LP";
    ui.resultReward.textContent = "변동 없음";
    ui.resultRewardLabel.textContent = "무승부";
    return;
  }

  if (outcome === "lose") {
    ui.resultEyebrow.textContent = "MATCH DEFEAT";
    ui.resultTitle.textContent = "패배";
    ui.resultText.textContent = `${fighter.name} 패배 · 다음 경기를 준비하세요`;
    ui.resultLpGain.textContent = "정산 중";
    ui.resultReward.textContent = "-5~10 LP";
    ui.resultRewardLabel.textContent = "패배";
    return;
  }

  ui.resultEyebrow.textContent = "MATCH VICTORY";
  ui.resultTitle.textContent = "승리!";
  ui.resultText.textContent = `${fighter.ownerName} · ${fighter.name} 승리`;
  ui.resultLpGain.textContent = "정산 중";
  ui.resultReward.textContent = "+10~20 LP";
  ui.resultRewardLabel.textContent = "랭크 승리 보상";
}

function presentGameWinner(winner) {
  const loser = winner === game.fighters[0] ? game.fighters[1] : game.fighters[0];
  const winnerPlayer = getPlayer(winner.ownerId);
  const loserPlayer = getPlayer(loser.ownerId);
  const localFighter = myFighter() || winner;
  renderPvpResultSummary(localFighter, localFighter === winner ? "win" : "lose");
  ui.resultBox.classList.remove("is-promotion");
  ui.resultBox.classList.toggle("is-defeat", localFighter !== winner);
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
    const localWon = currentUser?.id === updatedWinner.id;
    const casualMatch = Boolean(data.casual);
    const lpGain = Number(data.lpGain ?? 14);
    const lpLoss = Number(data.lpLoss ?? 7);
    if (casualMatch && localWon) {
      ui.resultBox.classList.remove("is-promotion");
      ui.resultBox.classList.remove("is-defeat");
      ui.resultText.textContent = `${updatedWinner.name} 승리 · 일반게임 종료`;
      ui.resultReward.textContent = "LP 변화 없음";
      ui.resultRewardLabel.textContent = "일반게임";
    } else if (casualMatch) {
      ui.resultBox.classList.remove("is-promotion");
      ui.resultBox.classList.add("is-defeat");
      ui.resultTitle.textContent = "패배";
      ui.resultText.textContent = `${updatedLoser.name} 패배 · 일반게임 종료`;
      ui.resultReward.textContent = "LP 변화 없음";
      ui.resultRewardLabel.textContent = "일반게임";
      ui.resultCurrentLp.textContent = `${updatedLoser.lp} LP`;
      ui.resultLpGain.textContent = "+0 LP";
    } else if (data.promoted && localWon) {
      ui.resultBox.classList.remove("is-defeat");
      ui.resultBox.classList.add("is-promotion");
      ui.resultTitle.textContent = `${data.newTier} 승급!`;
      ui.resultText.textContent = `${updatedWinner.name} 승리 · ${data.newTier} 승급`;
      ui.resultReward.textContent = `+${lpGain} LP · +${data.promotionReward ?? 200}C`;
      ui.resultRewardLabel.textContent = `${data.newTier} 승급 보상`;
    } else if (localWon) {
      ui.resultBox.classList.remove("is-promotion");
      ui.resultBox.classList.remove("is-defeat");
      ui.resultText.textContent = `${updatedWinner.name} 승리 · 랭크 정산 완료`;
      ui.resultReward.textContent = `+${lpGain} LP`;
      ui.resultRewardLabel.textContent = "랭크 승리 보상";
    } else {
      ui.resultBox.classList.remove("is-promotion");
      ui.resultBox.classList.add("is-defeat");
      ui.resultTitle.textContent = "패배";
      ui.resultText.textContent = `${updatedLoser.name} 패배 · ${updatedWinner.name} 승리`;
      ui.resultReward.textContent = `-${lpLoss} LP`;
      ui.resultRewardLabel.textContent = "랭크 패배";
      ui.resultCurrentLp.textContent = `${updatedLoser.lp} LP`;
      ui.resultLpGain.textContent = `-${lpLoss} LP`;
    }
    if (localWon) {
      ui.resultCurrentLp.textContent = `${updatedWinner.lp} LP`;
      ui.resultLpGain.textContent = casualMatch ? "+0 LP" : `+${lpGain} LP`;
    }
  } catch (error) {
    ui.resultText.textContent = `정산 실패: ${error.message}`;
    ui.resultReward.textContent = "정산 실패";
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
  renderPvpResultSummary(myFighter() || game.fighters[0], "draw");
  ui.resultBox.classList.remove("is-promotion", "is-defeat");
  ui.resultOverlay.classList.add("is-active");
}

function opponentOf(fighter) {
  return fighter === game.fighters[0] ? game.fighters[1] : game.fighters[0];
}

function swordEnemyTarget(owner) {
  return opponentOf(owner);
}

function nearestEnemyTarget(owner, x = owner.x, y = owner.y) {
  const fighter = opponentOf(owner);
  return [fighter, ...enemySummonsOf(owner)].reduce((nearest, target) => {
    if (!target || target.hp <= 0) return nearest;
    if (!nearest) return target;
    return Math.hypot(target.x - x, target.y - y) < Math.hypot(nearest.x - x, nearest.y - y)
      ? target
      : nearest;
  }, null) || fighter;
}

function damageCombatTarget(target, amount, attacker) {
  if (target?.owner) damageSummon(target, amount, attacker);
  else damage(target, amount, attacker);
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
}

function heal(fighter, amount) {
  if (amount <= 0 || game.over) return;
  const before = fighter.hp;
  fighter.hp = clamp(fighter.hp + amount, 0, fighter.maxHp);
  const actualHealing = fighter.hp - before;
  fighter.healingDone += actualHealing;
  const shownAmount = Math.round(actualHealing * 10) / 10;
  if (shownAmount <= 0) return;
  addFloatingText(fighter.x, fighter.y - fighter.radius - 28, `+${shownAmount}`, "#7bd88f");
  updateHud();
}

const mageElementLabels = {
  wet: "습기",
  fire: "화상",
  electro: "감전"
};

const mageElementColors = {
  wet: "#38bdf8",
  fire: "#fb923c",
  electro: "#facc15"
};

function clearMageElements(target) {
  target.mageElements = { wet: 0, fire: 0, electro: 0 };
}

function mageReactionFor(existingElement, nextElement) {
  const pair = new Set([existingElement, nextElement]);
  if (pair.has("wet") && pair.has("fire")) return { name: "증발", color: "#fb923c", dotDamage: 20 };
  if (pair.has("wet") && pair.has("electro")) return { name: "감전", color: "#38bdf8", dotDamage: 10 };
  if (pair.has("electro") && pair.has("fire")) return { name: "과부하", color: "#f97316", instantDamage: 20 };
  return null;
}

function applyMageElement(owner, target, element) {
  if (!target || target.hp <= 0 || target.owner) return;
  const elements = target.mageElements || { wet: 0, fire: 0, electro: 0 };
  const existing = Object.entries(elements).find(([key, ticks]) => key !== element && ticks > 0);
  if (existing) {
    const reaction = mageReactionFor(existing[0], element);
    clearMageElements(target);
    if (reaction) {
      addFloatingText(target.x, target.y - target.radius - 40, reaction.name, reaction.color);
      addVisualEffect({
        type: "mage-reaction",
        x: target.x,
        y: target.y,
        color: reaction.color,
        life: 42,
        maxLife: 42
      });
      if (reaction.instantDamage) damage(target, reaction.instantDamage, owner);
      if (reaction.dotDamage) {
        target.mageReaction = {
          owner,
          name: reaction.name,
          color: reaction.color,
          damage: reaction.dotDamage,
          time: 120,
          tick: 60
        };
      }
    }
    return;
  }
  target.mageElements = {
    ...elements,
    [element]: 300
  };
  addFloatingText(target.x, target.y - target.radius - 36, mageElementLabels[element], mageElementColors[element]);
}

function applyMageDot(owner, target, id, damagePerSecond, durationTicks) {
  if (!target || target.hp <= 0 || target.owner) return;
  target.mageDots = target.mageDots || {};
  target.mageDots[id] = {
    owner,
    damage: damagePerSecond,
    time: durationTicks,
    tick: 60,
    color: mageElementColors[id] || "#f7f4eb"
  };
}

function updateMageAilments(target, dt) {
  if (!target || target.hp <= 0 || game.over) return;
  if (target.mageElements) {
    Object.keys(target.mageElements).forEach(key => {
      if (target.mageElements[key] > 0) target.mageElements[key] = Math.max(0, target.mageElements[key] - dt);
    });
  }
  Object.keys(target.mageDots || {}).forEach(key => {
    const dot = target.mageDots[key];
    dot.time -= dt;
    dot.tick -= dt;
    while (dot.time > 0 && dot.tick <= 0 && !game.over) {
      damage(target, dot.damage, dot.owner);
      dot.tick += 60;
    }
    if (dot.time <= 0) delete target.mageDots[key];
  });
  if (target.mageReaction) {
    const reaction = target.mageReaction;
    reaction.time -= dt;
    reaction.tick -= dt;
    while (reaction.time > 0 && reaction.tick <= 0 && !game.over) {
      damage(target, reaction.damage, reaction.owner);
      reaction.tick += 60;
    }
    if (reaction.time <= 0) target.mageReaction = null;
  }
}

function castMageLightning(owner) {
  const target = opponentOf(owner);
  damage(target, 3, owner);
  applyMageDot(owner, target, "electro", 1, 120);
  applyMageElement(owner, target, "electro");
  addVisualEffect({
    type: "mage-lightning",
    x: target.x,
    y: target.y,
    color: "#facc15",
    life: 34,
    maxLife: 34
  });
}

function detonateMageFire(owner) {
  const target = opponentOf(owner);
  damage(target, 10, owner);
  applyMageDot(owner, target, "fire", 2, 120);
  applyMageElement(owner, target, "fire");
  addVisualEffect({
    type: "mage-fireball",
    x: canvas.width / 2,
    y: canvas.height / 2,
    color: "#fb923c",
    life: 56,
    maxLife: 56
  });
}

function triggerNormalSkill(fighter) {
  if (fighter.kind === "thrower") {
    const target = nearestEnemyTarget(fighter);
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
    addSkillPulse(fighter, count ? "#ffe28a" : fighter.accent);
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
    fighter.skillTimer = 600;
    return;
  }

  if (fighter.kind === "grabber") {
    throwGrapple(fighter, true);
    fighter.skillTimer = 1020;
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
    fighter.skillTimer = 1020;
    return;
  }

  if (fighter.kind === "enhancer") {
    fighter.furnaceCharges = 2;
    addSkillPulse(fighter, fighter.accent);
    fighter.skillTimer = 600;
    return;
  }

  if (fighter.kind === "tank") {
    const target = nearestEnemyTarget(fighter);
    damageCombatTarget(target, 10, fighter);
    if (!target.owner) {
      const angle = Math.atan2(fighter.y - target.y, fighter.x - target.x);
      const speed = Math.hypot(target.vx, target.vy) || 6.8;
      target.vx = Math.cos(angle) * speed;
      target.vy = Math.sin(angle) * speed;
      target.silenceTime = Math.max(target.silenceTime, 120);
    }
    addSkillPulse(fighter, fighter.accent);
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
    addSkillPulse(fighter, fighter.accent);
    fighter.skillTimer = 1080;
    return;
  }

  if (fighter.kind === "timekeeper") {
    skipTime(fighter);
    fighter.skillTimer = 540;
    return;
  }

  if (fighter.kind === "riftmaker") {
    if (createVoidRift(fighter)) {
      fighter.skillTimer = 600;
    }
    return;
  }

  if (fighter.kind === "summoner") {
    fighter.summonMode = fighter.summonMode === "warrior" ? "archer" : "warrior";
    addSkillPulse(fighter, fighter.summonMode === "warrior" ? "#4ade80" : "#facc15");
    fighter.skillTimer = 720;
    return;
  }

  if (fighter.kind === "swordsman") {
    beginSwordDance(fighter);
    return;
  }

  if (fighter.kind === "demon") {
    beginDemonBurst(fighter);
    return;
  }

  if (fighter.kind === "artist") {
    useDrawing(fighter);
    return;
  }

  if (fighter.kind === "believer") {
    fighter.ceremonyTime = 300;
    fighter.ceremonyTick = 60;
    fighter.skillTimer = 1200;
    addSkillPulse(fighter, fighter.accent);
    addVisualEffect({
      type: "ceremony-light",
      fighter,
      color: fighter.accent,
      life: 300,
      maxLife: 300
    });
    return;
  }

  if (fighter.kind === "archmage") {
    fighter.mageFireDelay = 180;
    fighter.skillTimer = 480;
    addSkillPulse(fighter, "#fb923c");
    addFloatingText(fighter.x, fighter.y - fighter.radius - 46, "작열 준비", "#fb923c");
    return;
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
    addSkillPulse(fighter, fighter.accent);
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
    addFloatingText(fighter.x, fighter.y - fighter.radius - 52, `${roll}`, fighter.accent);
    addSkillPulse(fighter, "#7bd88f");
    fighter.ultimateTimer = 2400;
    return;
  }

  if (fighter.kind === "stealth") {
    fighter.hyperStealthNext = true;
    addSkillPulse(fighter, "#8d7cff");
    fighter.ultimateTimer = 2700;
    return;
  }

  if (fighter.kind === "enhancer") {
    fighter.godWeapons.push({
      power: fighter.attackPower,
      timer: 1
    });
    fighter.attackPower = 0;
    addSkillPulse(fighter, fighter.accent);
    fighter.ultimateTimer = 300;
    return;
  }

  if (fighter.kind === "tank") {
    fighter.shieldTime = 180;
    fighter.shieldBlastPending = true;
    addSkillPulse(fighter, fighter.accent);
    fighter.ultimateTimer = 2400;
    return;
  }

  if (fighter.kind === "beamer") {
    fighter.annihilatorTime = 180;
    fighter.beamTimer = 1;
    addSkillPulse(fighter, fighter.accent);
    fighter.ultimateTimer = 3600;
    return;
  }

  if (fighter.kind === "vampire") {
    fighter.hp = Math.max(1, fighter.hp * 0.5);
    fighter.bloodPreludeTime = 180;
    fighter.bloodTimer = Math.min(fighter.bloodTimer, 60);
    addSkillPulse(fighter, fighter.accent);
    updateHud();
    fighter.ultimateTimer = 3000;
    return;
  }

  if (fighter.kind === "timekeeper") {
    beginReplay(fighter);
    fighter.ultimateTimer = 2400;
    return;
  }

  if (fighter.kind === "riftmaker") {
    if (useRiftGate(fighter)) {
      fighter.ultimateTimer = 300;
    }
    return;
  }

  if (fighter.kind === "summoner") {
    summonUnit(fighter, true);
    addSkillPulse(fighter, fighter.summonMode === "warrior" ? "#4ade80" : "#facc15");
    fighter.ultimateTimer = 3000;
    return;
  }

  if (fighter.kind === "swordsman") {
    beginSwordUltimate(fighter);
    return;
  }

  if (fighter.kind === "demon") {
    fireDemonLine(fighter, {
      damage: 30,
      addMark: 2,
      markDuration: 480,
      consumeAll: true,
      cooldownRefund: 450,
      width: 30,
      ultimate: true
    });
    fighter.ultimateTimer = 1800;
    return;
  }

  if (fighter.kind === "artist") {
    fighter.artSoulTime = 300;
    fighter.ultimateTimer = 1200;
    addSkillPulse(fighter, fighter.accent);
    return;
  }

  if (fighter.kind === "believer") {
    fighter.faithStacks += 1;
    fighter.faithBurnTick = Math.min(fighter.faithBurnTick, 60);
    fighter.ultimateTimer = 900;
    addSkillPulse(fighter, "#fb7185");
    addFloatingText(fighter.x, fighter.y - fighter.radius - 46, `신앙 ${fighter.faithStacks}중첩`, fighter.accent);
    return;
  }

  if (fighter.kind === "archmage") {
    fighter.mageSeaTime = 300;
    fighter.mageSeaTick = 0;
    fighter.ultimateTimer = 600;
    addSkillPulse(fighter, "#38bdf8");
    addVisualEffect({
      type: "mage-sea",
      fighter,
      color: "#38bdf8",
      life: 300,
      maxLife: 300
    });
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
  if (fighter.swordDanceTime > 0 || fighter.swordDanceHits > 0 || fighter.swordUltimateHits > 0 || fighter.demonBurstWindup > 0) return false;
  if (type === "normal") {
    if (fighter.kind === "vampire" || fighter.kind === "brawler") return false;
    if (fighter.skillTimer > 0) return false;
    if (fighter.kind === "stealth" && fighter.stealthTime <= 0) return false;
    if (fighter.kind === "riftmaker" && !nearestOwnedRift(fighter)) return false;
    return true;
  }
  if (fighter.kind === "wild" || fighter.kind === "brawler") return false;
  if (fighter.kind === "riftmaker" && !nearestOwnedRift(fighter)) return false;
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
  if (game?.easterEgg?.active) return;
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
  const rawEvents = prep.skillEvents || prep.skill_events || [];
  if (!Array.isArray(rawEvents)) return;
  const events = [...rawEvents].sort((a, b) => {
    const tickDifference = Number(a.applyTick ?? a.apply_tick ?? 0) - Number(b.applyTick ?? b.apply_tick ?? 0);
    if (tickDifference) return tickDifference;
    return String(a.id || "").localeCompare(String(b.id || ""));
  });
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
  const normalLocked = (fighter.kind === "stealth" && fighter.stealthTime <= 0 && normalCooldown === 0)
    || (fighter.kind === "riftmaker" && !nearestOwnedRift(fighter) && normalCooldown === 0);
  const ultimateLocked = fighter.kind === "riftmaker" && !nearestOwnedRift(fighter) && ultimateCooldown === 0;

  ui.normalSkillName.textContent = names.normal;
  ui.ultimateSkillName.textContent = names.ultimate;
  ui.normalSkillCooldown.textContent = normalCooldown > 0 ? normalCooldown : "";
  ui.ultimateSkillCooldown.textContent = ultimateCooldown > 0 ? ultimateCooldown : "";
  ui.normalSkillButton.classList.toggle("is-cooling", normalCooldown > 0);
  ui.ultimateSkillButton.classList.toggle("is-cooling", ultimateCooldown > 0);
  ui.normalSkillButton.classList.toggle("is-locked", normalLocked);
  ui.ultimateSkillButton.classList.toggle("is-locked", ultimateLocked);
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
  updateMageAilments(fighter, dt);
  if (game.over) return;
  fighter.timeHistory.push({ x: fighter.x, y: fighter.y, hp: fighter.hp });
  if (fighter.timeHistory.length > 181) fighter.timeHistory.shift();
  if (fighter.phaseTime > 0) fighter.phaseTime -= dt;
  if (fighter.demonMarkTime > 0) {
    fighter.demonMarkTime -= dt;
    if (fighter.demonMarkTime <= 0) {
      fighter.demonMarkCount = 0;
      fighter.demonMarkTime = 0;
    }
  }
  if (fighter.artSoulTime > 0) fighter.artSoulTime -= dt;
  if (fighter.kind === "believer") {
    fighter.prayerTimer -= dt;
    if (fighter.prayerTimer <= 0) {
      heal(fighter, 10);
      fighter.prayerTimer = 600;
      addVisualEffect({
        type: "prayer-heal",
        fighter,
        color: fighter.accent,
        life: 34,
        maxLife: 34
      });
    }
    if (fighter.ceremonyTime > 0) {
      fighter.ceremonyTime -= dt;
      fighter.ceremonyTick -= dt;
      if (fighter.ceremonyTick <= 0) {
        heal(fighter, 10);
        heal(opponentOf(fighter), 8);
        fighter.ceremonyTick += 60;
      }
    }
    if (fighter.faithStacks > 0) {
      fighter.faithBurnTick -= dt;
      if (fighter.faithBurnTick <= 0) {
        const faithDamage = 2 ** (fighter.faithStacks - 1);
        damage(opponentOf(fighter), faithDamage, fighter);
        fighter.faithBurnTick += 60;
      }
    }
  }
  if (fighter.kind === "archmage") {
    fighter.mageLightningTimer -= dt;
    if (fighter.mageLightningTimer <= 0) {
      castMageLightning(fighter);
      fighter.mageLightningTimer += 300;
      if (game.over) return;
    }
    if (fighter.mageFireDelay > 0) {
      fighter.mageFireDelay -= dt;
      if (fighter.mageFireDelay <= 0) {
        detonateMageFire(fighter);
        if (game.over) return;
      }
    }
    if (fighter.mageSeaTime > 0) {
      fighter.mageSeaTime -= dt;
      fighter.mageSeaTick -= dt;
      if (fighter.mageSeaTick <= 0) {
        const target = opponentOf(fighter);
        target.slowTime = Math.max(target.slowTime, 75);
        damage(target, 5, fighter);
        applyMageElement(fighter, target, "wet");
        fighter.mageSeaTick += 60;
        if (game.over) return;
      }
    }
  }
  if (fighter.silenceTime > 0) fighter.silenceTime -= dt;
  if (fighter.swordDanceTime > 0 || fighter.swordDanceHits > 0) {
    const wasVanished = fighter.swordDanceTime > 0;
    if (fighter.swordDanceTime > 0) fighter.swordDanceTime -= dt;
    fighter.swordDanceTimer -= dt;
    fighter.vx = 0;
    fighter.vy = 0;
    updateSkills(fighter, dt);
    if (wasVanished && fighter.swordDanceTime <= 0) {
      const target = swordEnemyTarget(fighter);
      if (!target.owner) target.stunTime = Math.max(target.stunTime || 0, 60);
      fighter.swordDanceTimer = 0;
      fighter.phaseTime = Math.max(fighter.phaseTime, 60);
      addVisualEffect({
        type: "sword-ring",
        x: target.x,
        y: target.y,
        radius: 168,
        color: fighter.accent,
        life: 64,
        maxLife: 64
      });
      addVisualEffect({
        type: "sword-ultimate-trail",
        x1: target.x - 150,
        y1: target.y - 84,
        x2: target.x + 150,
        y2: target.y + 84,
        color: fighter.accent,
        life: 72,
        maxLife: 72,
        index: 0,
        total: 3
      });
      addVisualEffect({
        type: "sword-ultimate-trail",
        x1: target.x + 128,
        y1: target.y - 104,
        x2: target.x - 128,
        y2: target.y + 104,
        color: "#f7fbff",
        life: 72,
        maxLife: 72,
        index: 1,
        total: 3
      });
    }
    while (fighter.swordDanceTime <= 0 && fighter.swordDanceHits > 0 && fighter.swordDanceTimer <= 0) {
      const target = swordEnemyTarget(fighter);
      damageCombatTarget(target, 2, fighter);
      if (!target.owner) target.stunTime = Math.max(target.stunTime || 0, 6);
      fighter.swordDanceHits -= 1;
      fighter.swordDanceTimer += 6;
      fighter.phaseTime = Math.max(fighter.phaseTime, 6);
      addVisualEffect({
        type: "sword-dash-trail",
        x1: target.x - 108 + fighter.swordDanceHits * 6,
        y1: target.y - 48,
        x2: target.x + 108 - fighter.swordDanceHits * 6,
        y2: target.y + 48,
        color: fighter.swordDanceHits % 2 ? fighter.accent : "#f7fbff",
        life: 28,
        maxLife: 28,
        index: 10 - fighter.swordDanceHits,
        total: 10
      });
      if (fighter.swordDanceHits <= 0) {
        fighter.swordDanceTimer = 0;
        fighter.x = clamp(fighter.swordReturnX || fighter.x, fighter.radius, canvas.width - fighter.radius);
        fighter.y = clamp(fighter.swordReturnY || fighter.y, fighter.radius, canvas.height - fighter.radius);
        fighter.phaseTime = 0;
      }
    }
    return;
  }
  if (fighter.swordUltimateHits > 0) {
    fighter.swordUltimateTimer -= dt;
    fighter.vx = 0;
    fighter.vy = 0;
    updateSkills(fighter, dt);
    if (fighter.swordUltimateTimer <= 0) {
      const hitIndex = 5 - fighter.swordUltimateHits;
      performSwordDash(fighter, 20, hitIndex, 5, true);
      fighter.swordUltimateHits -= 1;
      fighter.swordUltimateTimer = 18;
    }
    return;
  }
  if (fighter.demonBurstWindup > 0) {
    fighter.demonBurstWindup -= dt;
    fighter.vx = 0;
    fighter.vy = 0;
    updateSkills(fighter, dt);
    if (fighter.demonBurstWindup <= 0) launchDemonMissile(fighter);
    return;
  }
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
  if (fighter.replayWindup > 0) {
    fighter.replayWindup -= dt;
    fighter.vx = 0;
    fighter.vy = 0;
    updateSkills(fighter, dt);
    if (fighter.replayWindup <= 0) finishReplay(fighter);
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
    }
    return;
  }
  if (fighter.shieldTime <= 0 && fighter.kind !== "swordsman") {
    fighter.x += fighter.vx * dt;
    fighter.y += fighter.vy * dt;
  } else if (fighter.kind === "swordsman") {
    fighter.vx = 0;
    fighter.vy = 0;
  }
  const speed = Math.hypot(fighter.vx, fighter.vy);
  const baseSpeed = characterBaseSpeed(fighter);
  const target = nearestEnemyTarget(fighter);
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
    const direction = fighterDirection(fighter);
    fighter.vx = direction.x * targetSpeed;
    fighter.vy = direction.y * targetSpeed;
  }
  if (fighter.kind === "swordsman") {
    fighter.vx = 0;
    fighter.vy = 0;
  }
  const wallHit = bounceOnWalls(fighter);
  updateSkills(fighter, dt);

  if (fighter.rageTime > 0) fighter.rageTime -= dt;
  if (fighter.unstoppableTime > 0) {
    fighter.unstoppableTime -= dt;
    const target = nearestEnemyTarget(fighter);
    if (!fighter.unstoppableHit) {
      if (Math.hypot(target.x - fighter.x, target.y - fighter.y) < target.radius + fighter.radius + 52) {
        damageCombatTarget(target, 40, fighter);
        fighter.unstoppableHit = true;
      }
    }
  }
  if (fighter.slowTime > 0) fighter.slowTime -= dt;
  if (fighter.hasteTime > 0) fighter.hasteTime -= dt;
  if (fighter.chaseTime > 0) fighter.chaseTime -= dt;
  if (fighter.chaseBounceTime > 0) fighter.chaseBounceTime -= dt;
  if (fighter.bloodPreludeTime > 0) fighter.bloodPreludeTime -= dt;
  if (fighter.riftWallCooldown > 0) fighter.riftWallCooldown -= dt;
  if (fighter.kind === "riftmaker" && wallHit && fighter.riftWallCooldown <= 0) {
    addRift(fighter, fighter.x, fighter.y, false, wallHit);
    fighter.riftWallCooldown = 24;
  }

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
    const summonTarget = enemySummonsOf(fighter).find(summon => (
      Math.hypot(summon.x - fighter.x, summon.y - fighter.y) < fighter.radius + summon.radius + 52
    ));
    const distance = Math.hypot(target.x - fighter.x, target.y - fighter.y);
    if (fighter.punchTimer <= 0) {
      if (summonTarget) punchSummon(fighter, summonTarget);
      else if (distance < fighter.radius + target.radius + 52) punchTarget(fighter, target);
    }
  }

  if (fighter.kind === "timekeeper") {
    fighter.clockHandTimer -= dt;
    if (fighter.clockHandTimer <= 0) {
      const targetDistance = Math.hypot(target.x - fighter.x, target.y - fighter.y);
      if (targetDistance <= 190 + target.radius) {
        swingClockHand(fighter);
        fighter.clockHandTimer = 240;
      }
    }
  }

  if (fighter.kind === "summoner") {
    fighter.summonTimer -= dt;
    if (fighter.summonTimer <= 0) {
      summonUnit(fighter, false);
      fighter.summonTimer = 240;
    }
  }

  if (fighter.kind === "swordsman") {
    fighter.swordTimer -= dt;
    if (fighter.swordTimer <= 0) {
      useSwordBasic(fighter);
      fighter.swordTimer = 150;
    }
  }

  if (fighter.kind === "demon") {
    fighter.demonSwordTimer -= dt;
    if (fighter.demonSwordTimer <= 0) {
      fireDemonLine(fighter, {
        damage: 5,
        addMark: 1,
        markDuration: 300,
        slowTime: 120,
        width: 26
      });
      fighter.demonSwordTimer = 210;
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
      fighter.stealthTimer = 480;
    }
    if (fighter.stealthTime > 0) fighter.stealthTime -= dt;
    if (fighter.stealthTime <= 0) fighter.hyperStealthActive = false;
    if (fighter.stealthDamageCooldown > 0) fighter.stealthDamageCooldown -= dt;
  }
  if (fighter.hitFlash > 0) fighter.hitFlash -= dt;
}

function bounceOnWalls(body) {
  let wallHit = "";
  if (body.x - body.radius < 0) {
    body.x = body.radius;
    body.vx = Math.abs(body.vx);
    wallHit = "left";
  }
  if (body.x + body.radius > canvas.width) {
    body.x = canvas.width - body.radius;
    body.vx = -Math.abs(body.vx);
    wallHit = "right";
  }
  if (body.y - body.radius < 0) {
    body.y = body.radius;
    body.vy = Math.abs(body.vy);
    wallHit = "top";
  }
  if (body.y + body.radius > canvas.height) {
    body.y = canvas.height - body.radius;
    body.vy = -Math.abs(body.vy);
    wallHit = "bottom";
  }
  return wallHit;
}

function handleFighterCollision() {
  const a = game.fighters[0];
  const b = game.fighters[1];
  if (a.phaseTime > 0 || b.phaseTime > 0) {
    game.contactLock = false;
    return;
  }
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

function arenaEdgePoint(x, y, dx, dy, radius = 0) {
  const candidates = [];
  if (dx > 0) candidates.push((canvas.width - radius - x) / dx);
  if (dx < 0) candidates.push((radius - x) / dx);
  if (dy > 0) candidates.push((canvas.height - radius - y) / dy);
  if (dy < 0) candidates.push((radius - y) / dy);
  const distance = Math.max(0, Math.min(...candidates.filter(value => value >= 0)));
  return {
    x: clamp(x + dx * distance, radius, canvas.width - radius),
    y: clamp(y + dy * distance, radius, canvas.height - radius)
  };
}

function enemyTargetsOnLine(owner, x1, y1, x2, y2, width) {
  return [opponentOf(owner), ...enemySummonsOf(owner)].filter(target => (
    target?.hp > 0 && pointSegmentDistance(target.x, target.y, x1, y1, x2, y2) < target.radius + width
  ));
}

function applySwordCircle(owner, damageAmount = 5, radius = 82) {
  game.areaAttacks.push({
    type: "sword-circle",
    owner,
    x: owner.x,
    y: owner.y,
    radius,
    delay: 0,
    life: 24,
    hit: false,
    damage: damageAmount,
    color: owner.accent,
    angle: seededRandom() * Math.PI
  });
  addVisualEffect({
    type: "sword-ring",
    x: owner.x,
    y: owner.y,
    color: owner.accent,
    radius,
    life: 24,
    maxLife: 24
  });
}

function useSwordBasic(owner) {
  const target = swordEnemyTarget(owner);
  const fromX = owner.x;
  const fromY = owner.y;
  owner.x = clamp(target.x, owner.radius, canvas.width - owner.radius);
  owner.y = clamp(target.y, owner.radius, canvas.height - owner.radius);
  owner.vx = 0;
  owner.vy = 0;
  applySwordCircle(owner, 8, 88);
  addVisualEffect({
    type: "sword-step",
    x1: fromX,
    y1: fromY,
    x2: owner.x,
    y2: owner.y,
    color: owner.accent,
    life: 22,
    maxLife: 22
  });
}

function performSwordDash(owner, damageAmount, orbitIndex = 0, total = 1, ultimate = false) {
  const target = swordEnemyTarget(owner);
  const angle = ultimate
    ? Math.atan2(target.y - owner.y, target.x - owner.x)
    : Math.atan2(target.y - owner.y, target.x - owner.x) + Math.PI / 2 + orbitIndex * Math.PI / 3;
  const direction = { x: Math.cos(angle), y: Math.sin(angle) };
  let startX = owner.x;
  let startY = owner.y;
  let end;
  if (ultimate) {
    end = arenaEdgePoint(owner.x, owner.y, direction.x, direction.y, owner.radius);
  } else {
    const orbitRadius = 118;
    startX = clamp(target.x - direction.x * orbitRadius, owner.radius, canvas.width - owner.radius);
    startY = clamp(target.y - direction.y * orbitRadius, owner.radius, canvas.height - owner.radius);
    end = {
      x: clamp(target.x + direction.x * orbitRadius, owner.radius, canvas.width - owner.radius),
      y: clamp(target.y + direction.y * orbitRadius, owner.radius, canvas.height - owner.radius)
    };
  }
  enemyTargetsOnLine(owner, startX, startY, end.x, end.y, ultimate ? 18 : 24)
    .forEach(hitTarget => damageCombatTarget(hitTarget, damageAmount, owner));
  owner.x = end.x;
  owner.y = end.y;
  owner.vx = 0;
  owner.vy = 0;
  addVisualEffect({
    type: ultimate ? "sword-ultimate-trail" : "sword-dash-trail",
    x1: startX,
    y1: startY,
    x2: end.x,
    y2: end.y,
    color: owner.accent,
    life: ultimate ? 180 : 34,
    maxLife: ultimate ? 180 : 34,
    index: orbitIndex,
    total
  });
}

function beginSwordDance(owner) {
  const selfCost = Math.min(5, Math.max(0, owner.hp - 1));
  owner.hp -= selfCost;
  owner.damageTaken += selfCost;
  addDamageText(owner.x, owner.y - owner.radius, selfCost);
  updateHud();
  owner.swordReturnX = owner.x;
  owner.swordReturnY = owner.y;
  owner.phaseTime = 180;
  owner.swordDanceTime = 180;
  owner.swordDanceTimer = 180;
  owner.swordDanceHits = 10;
  owner.skillTimer = 1800;
  addSkillPulse(owner, owner.accent);
}

function beginSwordUltimate(owner) {
  owner.swordUltimateHits = 5;
  owner.swordUltimateTimer = 1;
  owner.ultimateTimer = 3600;
  addSkillPulse(owner, "#f7fbff");
}

function addDemonMark(target, count, duration) {
  target.demonMarkCount = Math.min(9, (target.demonMarkCount || 0) + count);
  target.demonMarkTime = Math.max(target.demonMarkTime || 0, duration);
  addFloatingText(target.x, target.y - target.radius - 22, `표식 x${target.demonMarkCount}`, "#38bdf8");
}

function consumeDemonMarks(target, count = 1) {
  const marks = target.demonMarkCount || 0;
  const consumed = Math.min(marks, count);
  target.demonMarkCount = marks - consumed;
  if (target.demonMarkCount <= 0) {
    target.demonMarkCount = 0;
    target.demonMarkTime = 0;
  }
  return consumed;
}

function applyDemonHit(target, amount, owner, options = {}) {
  const hadMark = (target.demonMarkCount || 0) > 0;
  damageCombatTarget(target, amount, owner);
  if (!hadMark) {
    if (options.addMark) addDemonMark(target, options.addMark, options.markDuration || 300);
    return 0;
  }
  const consumed = consumeDemonMarks(target, options.consumeAll ? target.demonMarkCount : 1);
  if (options.bonusDamagePerMark) damageCombatTarget(target, options.bonusDamagePerMark * consumed, owner);
  if (options.slowTime) target.slowTime = Math.max(target.slowTime || 0, options.slowTime);
  if (options.healPercent && consumed > 0) heal(owner, owner.maxHp * options.healPercent);
  if (options.cooldownRefund && consumed > 0) {
    owner.skillTimer = Math.max(0, owner.skillTimer - options.cooldownRefund * consumed);
    addFloatingText(owner.x, owner.y - owner.radius - 46, `쿨 -${(options.cooldownRefund * consumed / 60).toFixed(1)}초`, "#38bdf8");
  }
  return consumed;
}

function fireDemonLine(owner, options = {}) {
  const target = nearestEnemyTarget(owner);
  const angle = Math.atan2(target.y - owner.y, target.x - owner.x);
  const end = arenaEdgePoint(owner.x, owner.y, Math.cos(angle), Math.sin(angle), 0);
  enemyTargetsOnLine(owner, owner.x, owner.y, end.x, end.y, options.width || 28)
    .forEach(hitTarget => applyDemonHit(hitTarget, options.damage || 5, owner, options));
  addVisualEffect({
    type: options.ultimate ? "demon-cleave" : "demon-beam",
    x1: owner.x,
    y1: owner.y,
    x2: end.x,
    y2: end.y,
    color: owner.accent,
    life: options.ultimate ? 42 : 30,
    maxLife: options.ultimate ? 42 : 30
  });
  if (options.ultimate) {
    owner.x = clamp(target.x + Math.cos(angle) * (target.radius + owner.radius + 12), owner.radius, canvas.width - owner.radius);
    owner.y = clamp(target.y + Math.sin(angle) * (target.radius + owner.radius + 12), owner.radius, canvas.height - owner.radius);
  }
}

function beginDemonBurst(owner) {
  owner.demonBurstWindup = 60;
  owner.vx = 0;
  owner.vy = 0;
  owner.skillTimer = 540;
  addVisualEffect({
    type: "demon-focus",
    fighter: owner,
    color: owner.accent,
    life: 60,
    maxLife: 60
  });
}

function launchDemonMissile(owner) {
  const target = nearestEnemyTarget(owner);
  const angle = Math.atan2(target.y - owner.y, target.x - owner.x);
  game.balls.push({
    owner,
    x: owner.x + Math.cos(angle) * (owner.radius + 18),
    y: owner.y + Math.sin(angle) * (owner.radius + 18),
    vx: Math.cos(angle) * 8.8,
    vy: Math.sin(angle) * 8.8,
    radius: 13,
    life: 260,
    hitCooldown: 0,
    damage: 10,
    speed: 8.8,
    color: "#38bdf8",
    homing: true,
    homeTarget: target,
    homingTime: 260,
    demonMissile: true
  });
}

function spawnArtOrb(owner) {
  if (!game || game.artOrbs?.some(orb => orb.owner === owner)) return;
  const velocity = randomVelocity(characterBaseSpeed(owner) * 0.55);
  game.artOrbs.push({
    owner,
    x: owner.x,
    y: owner.y,
    vx: velocity.vx,
    vy: velocity.vy,
    radius: 13,
    trail: []
  });
}

function updateArtOrbs(dt) {
  if (!game.artOrbs) game.artOrbs = [];
  game.fighters
    .filter(fighter => fighter.kind === "artist" && fighter.hp > 0)
    .forEach(spawnArtOrb);
  game.artOrbs = game.artOrbs.filter(orb => orb.owner.hp > 0);
  game.artOrbs.forEach(orb => {
    const speed = characterBaseSpeed(orb.owner) * 0.55 * (orb.owner.artSoulTime > 0 ? 2 : 1);
    const currentSpeed = Math.hypot(orb.vx, orb.vy) || speed || 1;
    orb.vx = orb.vx / currentSpeed * speed;
    orb.vy = orb.vy / currentSpeed * speed;
    orb.x += orb.vx * dt;
    orb.y += orb.vy * dt;
    bounceOnWalls(orb);
    const last = orb.trail[orb.trail.length - 1];
    if (!last || Math.hypot(last.x - orb.x, last.y - orb.y) > 18) {
      orb.trail.push({
        x: orb.x,
        y: orb.y,
        radius: orb.owner.artSoulTime > 0 ? 30 : 18
      });
    }
  });
}

function useDrawing(owner) {
  const orb = game.artOrbs?.find(item => item.owner === owner);
  if (!orb) return;
  let hits = 0;
  const targets = [opponentOf(owner), ...enemySummonsOf(owner)].filter(target => target?.hp > 0);
  targets.forEach(target => {
    let overlapGroups = 0;
    let wasInsideTrail = false;
    for (let index = 1; index < orb.trail.length; index += 1) {
      const previous = orb.trail[index - 1];
      const current = orb.trail[index];
      const width = Math.max(previous.radius || 18, current.radius || 18);
      const insideTrail = pointSegmentDistance(target.x, target.y, previous.x, previous.y, current.x, current.y) < target.radius + width;
      if (insideTrail && !wasInsideTrail) overlapGroups += 1;
      wasInsideTrail = insideTrail;
    }
    if (overlapGroups > 0) {
      damageCombatTarget(target, 35, owner);
      hits += 1;
    }
  });
  owner.skillTimer = 180;
  addVisualEffect({
    type: "drawing-flash",
    trail: orb.trail.map(point => ({ ...point })),
    color: owner.accent,
    life: 34,
    maxLife: 34
  });
  orb.trail = [];
  addFloatingText(owner.x, owner.y - owner.radius - 38, hits ? `드로잉 x${hits}` : "드로잉", owner.accent);
}

function throwBall(owner) {
  if (!owner.canThrow || game.over) return;
  const target = nearestEnemyTarget(owner);
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
  const target = nearestEnemyTarget(owner);
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
  addSkillPulse(owner, "#ffe28a");
}

function throwGrapple(owner, enhanced = false) {
  if (!owner.canGrab || game.over) return;
  const target = nearestEnemyTarget(owner);
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
  const target = nearestEnemyTarget(owner);
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
    damageCombatTarget(target, 30, owner);
    if (!target.owner) {
      target.stunTime = Math.max(target.stunTime, 60);
      target.vx *= 0.25;
      target.vy *= 0.25;
    }
  }
}

function fireSlowBeam(owner) {
  const target = nearestEnemyTarget(owner);
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
  const target = nearestEnemyTarget(owner);
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
  const target = nearestEnemyTarget(owner);
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
  const target = nearestEnemyTarget(owner);
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
  const target = nearestEnemyTarget(owner);
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
    damageCombatTarget(target, 50, owner);
    if (!target.owner) target.stunTime = Math.max(target.stunTime, 180);
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

function punchSummon(owner, summon) {
  const damageAmount = 7 + (owner.gritActive ? 8 : 0);
  damageSummon(summon, damageAmount, owner);
  owner.punchTimer = 60;
  owner.idleAttackTime = 0;
  addVisualEffect({
    type: "rage-burst",
    fighter: summon,
    life: 18,
    maxLife: 18,
    color: owner.accent
  });
}

function throwDrawCard(owner) {
  const target = nearestEnemyTarget(owner);
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
  addSkillPulse(owner, owner.accent);
}

function assassinate(owner) {
  const target = nearestEnemyTarget(owner);
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

  const target = nearestEnemyTarget(owner);
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
      if (ball.homeTarget.hp <= 0) ball.homeTarget = nearestEnemyTarget(ball.owner, ball.x, ball.y);
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
    if (!ball.blood && !ball.noBounce) bounceOnWalls(ball);

    const summonTarget = collidingEnemySummon(ball.owner, ball.x, ball.y, ball.radius);
    if (summonTarget && ball.hitCooldown <= 0) {
      if (ball.demonMissile) {
        applyDemonHit(summonTarget, ball.damage, ball.owner, {
          addMark: 1,
          markDuration: 300,
          healPercent: 0.1
        });
        return false;
      }
      damageSummon(summonTarget, ball.damage, ball.owner);
      if (ball.blood || ball.riftShot || ball.summonArrow || (ball.owner.canThrow && !ball.star)) {
        if (!ball.persistentArrow) return false;
      }
      const angle = Math.atan2(summonTarget.y - ball.y, summonTarget.x - ball.x);
      const speed = ball.speed || Math.hypot(ball.vx, ball.vy) || 10.2;
      ball.vx = -Math.cos(angle) * speed;
      ball.vy = -Math.sin(angle) * speed;
      ball.hitCooldown = 18;
    }

    for (const target of game.fighters) {
      const dx = target.x - ball.x;
      const dy = target.y - ball.y;
      if (Math.hypot(dx, dy) < target.radius + ball.radius && ball.hitCooldown <= 0) {
        if (target !== ball.owner) {
          if (ball.demonMissile) {
            applyDemonHit(target, ball.damage, ball.owner, {
              addMark: 1,
              markDuration: 300,
              healPercent: 0.1
            });
            return false;
          }
          damage(target, ball.damage, ball.owner);
          if (ball.slow) target.slowTime = Math.max(target.slowTime, 180);
          if (ball.blood || ball.riftShot || (ball.summonArrow && !ball.persistentArrow) || (ball.owner.canThrow && !ball.star)) return false;
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
      && (ball.blood || ball.noBounce
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
    const summonTarget = collidingEnemySummon(grapple.owner, endX, endY, 14);
    if (summonTarget && !grapple.hit) {
      grapple.hit = true;
      damageSummon(summonTarget, 20, grapple.owner);
      return false;
    }
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
    const summonTarget = collidingEnemySummon(card.owner, card.x, card.y, card.radius);
    if (summonTarget) {
      damageSummon(summonTarget, card.damage, card.owner);
      return false;
    }
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
    addSkillPulse(card.owner, card.owner.accent);
    return;
  }
  damageCombatTarget(card.target, card.damage, card.owner);
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
      if (attack.type === "sword-circle") {
        [target, ...enemySummonsOf(attack.owner)].forEach(hitTarget => {
          if (hitTarget?.hp > 0 && Math.hypot(hitTarget.x - attack.x, hitTarget.y - attack.y) < hitTarget.radius + attack.radius) {
            damageCombatTarget(hitTarget, attack.damage, attack.owner);
          }
        });
        return attack.life > 0;
      }
      const summonTarget = attack.type === "laser"
        ? enemySummonsOf(attack.owner).find(summon => Math.abs(summon.x - attack.x) < summon.radius + 18)
        : enemySummonInArea(attack.owner, attack.x, attack.y, attack.radius);
      if (summonTarget) {
        damageSummon(summonTarget, attack.damage, attack.owner);
        return attack.life > 0;
      }
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
      const summonTarget = enemySummonOnLine(beam.owner, beam.x1, beam.y1, beam.x2, beam.y2, 42);
      if (summonTarget) {
        damageSummon(summonTarget, 5, beam.owner);
        return beam.life > 0;
      }
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
    const summonTarget = !weapon.returning
      ? collidingEnemySummon(weapon.owner, weapon.x, weapon.y, 18)
      : null;
    if (summonTarget) {
      damageSummon(summonTarget, weapon.damage, weapon.owner);
      weapon.hit = true;
      weapon.returning = true;
    }
    if (!weapon.returning && Math.hypot(weapon.target.x - weapon.x, weapon.target.y - weapon.y) < weapon.target.radius + 18) {
      if (!weapon.hit) damageCombatTarget(weapon.target, weapon.damage, weapon.owner);
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
    if (effect.type === "clock-sweep") resolveClockSweepHits(effect);
    effect.life -= dt;
    return effect.life > 0;
  });
}

function drawCombatBackdrop(renderCtx, width, height, tick, primary = "#22d3ee", secondary = "#8b5cf6") {
  renderCtx.save();
  const base = renderCtx.createLinearGradient(0, 0, width, height);
  base.addColorStop(0, "#050b13");
  base.addColorStop(0.48, "#07101c");
  base.addColorStop(1, "#090812");
  renderCtx.fillStyle = base;
  renderCtx.fillRect(0, 0, width, height);

  const glowA = renderCtx.createRadialGradient(
    width * (0.2 + Math.sin(tick * 0.002) * 0.03),
    height * 0.28,
    0,
    width * 0.22,
    height * 0.3,
    width * 0.62
  );
  glowA.addColorStop(0, "rgba(34, 211, 238, 0.13)");
  glowA.addColorStop(0.52, "rgba(34, 211, 238, 0.035)");
  glowA.addColorStop(1, "rgba(34, 211, 238, 0)");
  renderCtx.fillStyle = glowA;
  renderCtx.fillRect(0, 0, width, height);

  const glowB = renderCtx.createRadialGradient(width * 0.82, height * 0.7, 0, width * 0.82, height * 0.7, width * 0.58);
  glowB.addColorStop(0, "rgba(139, 92, 246, 0.11)");
  glowB.addColorStop(0.5, "rgba(244, 114, 182, 0.025)");
  glowB.addColorStop(1, "rgba(139, 92, 246, 0)");
  renderCtx.fillStyle = glowB;
  renderCtx.fillRect(0, 0, width, height);

  renderCtx.globalCompositeOperation = "lighter";
  const gridSize = 44;
  const offsetX = (tick * 0.08) % gridSize;
  const offsetY = (tick * 0.045) % gridSize;
  renderCtx.lineWidth = 1;
  for (let x = -gridSize + offsetX; x < width + gridSize; x += gridSize) {
    const emphasis = Math.abs((x / gridSize) % 4) < 0.12;
    renderCtx.strokeStyle = emphasis ? "rgba(103, 232, 249, 0.095)" : "rgba(103, 232, 249, 0.04)";
    renderCtx.beginPath();
    renderCtx.moveTo(x, 0);
    renderCtx.lineTo(x, height);
    renderCtx.stroke();
  }
  for (let y = -gridSize + offsetY; y < height + gridSize; y += gridSize) {
    const emphasis = Math.abs((y / gridSize) % 4) < 0.12;
    renderCtx.strokeStyle = emphasis ? "rgba(167, 139, 250, 0.085)" : "rgba(167, 139, 250, 0.035)";
    renderCtx.beginPath();
    renderCtx.moveTo(0, y);
    renderCtx.lineTo(width, y);
    renderCtx.stroke();
  }

  for (let index = 0; index < 30; index += 1) {
    const seed = index * 92821 + 731;
    const x = ((seed % 997) / 997 * width + tick * (0.025 + index % 3 * 0.008)) % width;
    const y = (((seed * 13) % 991) / 991 * height + Math.sin(tick * 0.008 + index) * 8 + height) % height;
    const pulse = 0.2 + (Math.sin(tick * 0.035 + index * 1.7) + 1) * 0.18;
    renderCtx.globalAlpha = pulse;
    renderCtx.fillStyle = index % 5 === 0 ? "#fde68a" : index % 2 === 0 ? primary : secondary;
    renderCtx.beginPath();
    renderCtx.arc(x, y, index % 7 === 0 ? 1.8 : 1, 0, Math.PI * 2);
    renderCtx.fill();
  }
  renderCtx.globalCompositeOperation = "source-over";
  renderCtx.globalAlpha = 1;

  const vignette = renderCtx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.18, width / 2, height / 2, Math.max(width, height) * 0.72);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.55)");
  renderCtx.fillStyle = vignette;
  renderCtx.fillRect(0, 0, width, height);
  renderCtx.restore();
}

function drawMotionTrail(renderCtx, x, y, vx, vy, radius, color, alpha = 0.55) {
  const speed = Math.hypot(vx, vy);
  if (speed < 0.1) return;
  const nx = vx / speed;
  const ny = vy / speed;
  const length = Math.min(76, 16 + speed * 3.2);
  const trail = renderCtx.createLinearGradient(x, y, x - nx * length, y - ny * length);
  trail.addColorStop(0, color);
  trail.addColorStop(0.3, color);
  trail.addColorStop(1, "rgba(0,0,0,0)");
  renderCtx.save();
  renderCtx.globalCompositeOperation = "lighter";
  renderCtx.globalAlpha = alpha;
  renderCtx.strokeStyle = trail;
  renderCtx.shadowColor = color;
  renderCtx.shadowBlur = radius * 1.4;
  renderCtx.lineCap = "round";
  renderCtx.lineWidth = Math.max(2, radius * 1.15);
  renderCtx.beginPath();
  renderCtx.moveTo(x, y);
  renderCtx.lineTo(x - nx * length, y - ny * length);
  renderCtx.stroke();
  renderCtx.restore();
}

function drawCheapTrail(renderCtx, x, y, vx, vy, radius, color, alpha = 0.45) {
  const speed = Math.hypot(vx, vy);
  if (speed < 0.1) return;
  const length = Math.min(42, radius * 2.4 + speed * 1.4);
  renderCtx.save();
  renderCtx.globalAlpha = alpha;
  renderCtx.strokeStyle = color;
  renderCtx.lineWidth = Math.max(2, radius * 0.72);
  renderCtx.lineCap = "round";
  renderCtx.beginPath();
  renderCtx.moveTo(x, y);
  renderCtx.lineTo(x - vx / speed * length, y - vy / speed * length);
  renderCtx.stroke();
  renderCtx.restore();
}

function drawLuminousCore(renderCtx, x, y, radius, color, accent, tick, alpha = 1) {
  const pulse = 1 + Math.sin(tick * 0.16 + x * 0.01 + y * 0.008) * 0.045;
  renderCtx.save();
  renderCtx.globalAlpha = alpha;
  renderCtx.globalCompositeOperation = "lighter";
  renderCtx.shadowColor = accent;
  renderCtx.shadowBlur = radius * 1.35;
  const halo = renderCtx.createRadialGradient(x, y, radius * 0.12, x, y, radius * 1.7);
  halo.addColorStop(0, "rgba(255,255,255,0.46)");
  halo.addColorStop(0.3, color);
  halo.addColorStop(0.68, accent);
  halo.addColorStop(1, "rgba(0,0,0,0)");
  renderCtx.fillStyle = halo;
  renderCtx.beginPath();
  renderCtx.arc(x, y, radius * 1.7 * pulse, 0, Math.PI * 2);
  renderCtx.fill();

  renderCtx.globalCompositeOperation = "source-over";
  const body = renderCtx.createRadialGradient(
    x - radius * 0.3,
    y - radius * 0.35,
    radius * 0.08,
    x,
    y,
    radius
  );
  body.addColorStop(0, "#ffffff");
  body.addColorStop(0.18, accent);
  body.addColorStop(0.58, color);
  body.addColorStop(1, color);
  renderCtx.fillStyle = body;
  renderCtx.beginPath();
  renderCtx.arc(x, y, radius, 0, Math.PI * 2);
  renderCtx.fill();

  renderCtx.globalCompositeOperation = "lighter";
  renderCtx.strokeStyle = accent;
  renderCtx.globalAlpha = alpha * 0.65;
  renderCtx.lineWidth = Math.max(1.5, radius * 0.08);
  renderCtx.beginPath();
  renderCtx.arc(x, y, radius * (1.2 + Math.sin(tick * 0.11) * 0.05), tick * 0.025, tick * 0.025 + Math.PI * 1.35);
  renderCtx.stroke();
  renderCtx.restore();
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
  drawFaithFields();
  game.grapples.forEach(drawGrapple);
  game.shockwaves.forEach(drawShockwave);
  game.areaAttacks.forEach(drawAreaAttack);
  game.beams.forEach(drawBeam);
  game.weapons.forEach(drawWeapon);
  drawRifts();
  drawArtOrbs();
  game.balls.forEach(drawBall);
  game.pokerShots.forEach(drawPokerShot);
  game.visualEffects.filter(effect => effect.type !== "assassinate-slash").forEach(drawVisualEffect);
  game.fighters
    .filter((fighter, index) => !game.easterEgg?.revealed || index === game.easterEgg.winnerIndex)
    .forEach(drawFighter);
  game.summons.forEach(drawSummon);
  game.visualEffects.filter(effect => effect.type === "assassinate-slash").forEach(drawVisualEffect);
  game.damageTexts.forEach(drawDamageText);
  if (game.easterEgg?.active) drawStealthMirrorEasterEgg();
}

function drawStealthMirrorEasterEgg() {
  const easterEgg = game.easterEgg;
  const tick = game.tick;
  ctx.save();
  if (!easterEgg.revealed) {
    ctx.fillStyle = tick < 34 ? `rgba(0,0,0,${Math.min(1, tick / 22)})` : "rgba(0,0,0,0.96)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (tick >= 34) {
      const slashCount = Math.min(24, Math.floor((tick - 34) / 5));
      for (let index = 0; index < slashCount; index += 1) {
        const seed = hashSeed(`${currentRoom?.code}|stealth|${index}`);
        const x1 = (seed % 1000) / 1000 * canvas.width;
        const y1 = ((seed >>> 10) % 1000) / 1000 * canvas.height;
        const angle = ((seed >>> 20) % 628) / 100;
        const length = 130 + seed % 240;
        const pulse = Math.max(0.12, 1 - ((tick - 34 - index * 5) % 28) / 28);
        ctx.globalAlpha = pulse;
        ctx.strokeStyle = index % 3 === 0 ? "#f7f4eb" : index % 2 === 0 ? "#8d7cff" : "#3dd6d0";
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = 22;
        ctx.lineWidth = index % 3 === 0 ? 3 : 7;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 + Math.cos(angle) * length, y1 + Math.sin(angle) * length);
        ctx.stroke();
      }
      ctx.globalAlpha = 0.28 + Math.sin(tick * 0.7) * 0.16;
      ctx.fillStyle = "#8d7cff";
      ctx.fillRect(0, canvas.height * (0.5 + Math.sin(tick * 0.09) * 0.12), canvas.width, 3);
    }
  } else {
    const revealProgress = clamp((tick - easterEgg.revealTick) / 30, 0, 1);
    ctx.fillStyle = `rgba(0,0,0,${0.82 * (1 - revealProgress)})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const winner = game.fighters[easterEgg.winnerIndex];
    ctx.globalAlpha = 1 - revealProgress * 0.42;
    ctx.strokeStyle = "#8d7cff";
    ctx.shadowColor = "#8d7cff";
    ctx.shadowBlur = 34;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(winner.x, winner.y, winner.radius + 28 + Math.sin(tick * 0.2) * 5, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawVisualEffect(effect) {
  if (effect.type === "sword-step") {
    drawEnergyLine(effect, 5);
    return;
  }
  if (effect.type === "sword-dash-trail" || effect.type === "sword-ultimate-trail") {
    drawSwordTrail(effect);
    return;
  }
  if (effect.type === "sword-ring") {
    drawSwordRing(effect);
    return;
  }
  if (effect.type === "demon-beam" || effect.type === "demon-cleave") {
    drawDemonBeam(effect);
    return;
  }
  if (effect.type === "demon-focus") {
    drawDemonFocus(effect);
    return;
  }
  if (effect.type === "drawing-flash") {
    drawDrawingFlash(effect);
    return;
  }
  if (effect.type === "ceremony-light" || effect.type === "prayer-heal") {
    drawFaithPulse(effect);
    return;
  }
  if (effect.type === "mage-lightning") {
    drawMageLightning(effect);
    return;
  }
  if (effect.type === "mage-fireball" || effect.type === "mage-reaction") {
    drawPointBurst(effect);
    return;
  }
  if (effect.type === "mage-sea") {
    drawMageSea(effect);
    return;
  }
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
    return;
  }
  if (effect.type === "skill-pulse" || effect.type === "replay-charge") {
    drawExpandingBurst(effect, 34, effect.type === "replay-charge" ? 94 : 72, 4);
    return;
  }
  if (effect.type === "time-skip") {
    drawEnergyLine(effect, 8);
    return;
  }
  if (effect.type === "clock-sweep") {
    drawClockSweep(effect);
    return;
  }
  if (effect.type === "time-explosion" || effect.type === "void-rift" || effect.type === "rift-hit" || effect.type === "summon-arrival") {
    drawPointBurst(effect);
  }
}

function drawSummon(summon) {
  const color = summon.type === "warrior" ? "#4ade80" : "#facc15";
  ctx.save();
  ctx.translate(summon.x, summon.y);
  ctx.globalAlpha = summon.hitFlash > 0 ? 0.68 : 1;
  ctx.shadowColor = color;
  ctx.shadowBlur = summon.elite ? 24 : 12;
  ctx.fillStyle = summon.hitFlash > 0 ? "#f7f4eb" : color;
  ctx.strokeStyle = summon.elite ? "#fff7c2" : summon.owner.color;
  ctx.lineWidth = summon.elite ? 5 : 3;
  ctx.beginPath();
  if (summon.type === "warrior") {
    ctx.arc(0, 0, summon.radius, 0, Math.PI * 2);
  } else {
    ctx.moveTo(0, -summon.radius);
    ctx.lineTo(summon.radius, summon.radius);
    ctx.lineTo(-summon.radius, summon.radius);
    ctx.closePath();
  }
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#071016";
  ctx.font = `1000 ${summon.elite ? 17 : 13}px Segoe UI, Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(summon.type === "warrior" ? "W" : "A", 0, 1);
  ctx.restore();

  const width = summon.elite ? 52 : 40;
  ctx.fillStyle = "rgba(0,0,0,0.78)";
  ctx.fillRect(summon.x - width / 2, summon.y + summon.radius + 8, width, 6);
  ctx.fillStyle = color;
  ctx.fillRect(
    summon.x - width / 2,
    summon.y + summon.radius + 8,
    width * clamp(summon.hp / summon.maxHp, 0, 1),
    6
  );
  if ((summon.demonMarkCount || 0) > 0) drawDemonMark(summon);
}

function drawEnergyLine(effect, width = 6) {
  const alpha = clamp(effect.life / effect.maxLife, 0, 1);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  [
    { size: width * 3.2, opacity: 0.12, color: effect.color },
    { size: width * 1.7, opacity: 0.38, color: "#8d7cff" },
    { size: width, opacity: 0.82, color: effect.color },
    { size: Math.max(2, width * 0.28), opacity: 1, color: "#f7fbff" }
  ].forEach((layer, index) => {
    ctx.globalAlpha = alpha * layer.opacity;
    ctx.strokeStyle = layer.color;
    ctx.shadowColor = layer.color;
    ctx.shadowBlur = 16 + layer.size;
    ctx.lineWidth = layer.size;
    ctx.setLineDash(index === 2 ? [18, 8] : []);
    ctx.lineDashOffset = -game.tick * 1.4;
    ctx.beginPath();
    ctx.moveTo(effect.x1, effect.y1);
    ctx.lineTo(effect.x2, effect.y2);
    ctx.stroke();
  });
  ctx.restore();
}

function drawMageLightning(effect) {
  const alpha = clamp(effect.life / effect.maxLife, 0, 1);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = effect.color;
  ctx.shadowColor = effect.color;
  ctx.shadowBlur = 28;
  ctx.lineCap = "round";
  for (let bolt = 0; bolt < 3; bolt += 1) {
    ctx.globalAlpha = alpha * (0.9 - bolt * 0.22);
    ctx.lineWidth = 8 - bolt * 2;
    ctx.beginPath();
    const startX = effect.x + (bolt - 1) * 16;
    ctx.moveTo(startX, 0);
    for (let step = 1; step <= 7; step += 1) {
      const t = step / 7;
      const jitter = Math.sin((game.tick + step * 19 + bolt * 31) * 0.9) * 18;
      ctx.lineTo(effect.x + jitter, effect.y * t);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = alpha * 0.35;
  ctx.fillStyle = effect.color;
  ctx.beginPath();
  ctx.arc(effect.x, effect.y, 64 * (1 - alpha * 0.35), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawMageSea(effect) {
  const alpha = clamp(effect.life / effect.maxLife, 0, 1);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = Math.min(0.24, alpha * 0.24);
  ctx.fillStyle = effect.color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(125, 211, 252, 0.42)";
  ctx.lineWidth = 2;
  for (let y = 24; y < canvas.height; y += 34) {
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x += 28) {
      const wave = Math.sin((x + game.tick * 3) * 0.035 + y * 0.02) * 5;
      if (x === 0) ctx.moveTo(x, y + wave);
      else ctx.lineTo(x, y + wave);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawClockSweep(effect) {
  const fighter = effect.fighter;
  if (!fighter) return;
  const progress = 1 - clamp(effect.life / effect.maxLife, 0, 1);
  const center = Math.atan2(effect.direction.y, effect.direction.x);
  const range = effect.range || 215;
  const halfAngle = effect.halfAngle || Math.PI / 3;
  const handAngle = center - halfAngle + halfAngle * 2 * Math.min(1, progress * 1.35);
  ctx.save();
  ctx.globalAlpha = Math.min(1, (1 - progress) * 1.8);
  ctx.fillStyle = "rgba(103, 232, 249, 0.13)";
  ctx.strokeStyle = "rgba(103, 232, 249, 0.55)";
  ctx.shadowColor = effect.color;
  ctx.shadowBlur = 26;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(fighter.x, fighter.y);
  ctx.arc(fighter.x, fighter.y, range, center - halfAngle, center + halfAngle);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  for (let trail = 3; trail >= 0; trail -= 1) {
    const angle = handAngle - trail * 0.075;
    ctx.globalAlpha = (1 - trail * 0.2) * Math.min(1, (1 - progress) * 2);
    ctx.strokeStyle = trail === 0 ? "#f7fbff" : effect.color;
    ctx.shadowColor = effect.color;
    ctx.shadowBlur = trail === 0 ? 32 : 18;
    ctx.lineWidth = trail === 0 ? 8 : 5;
    ctx.beginPath();
    ctx.moveTo(
      fighter.x + Math.cos(angle) * (fighter.radius * 0.4),
      fighter.y + Math.sin(angle) * (fighter.radius * 0.4)
    );
    ctx.lineTo(
      fighter.x + Math.cos(angle) * range,
      fighter.y + Math.sin(angle) * range
    );
    ctx.stroke();
  }

  ctx.globalAlpha = Math.min(1, (1 - progress) * 1.8);
  ctx.fillStyle = "#f7fbff";
  ctx.beginPath();
  ctx.arc(fighter.x, fighter.y, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPointBurst(effect) {
  const progress = 1 - clamp(effect.life / effect.maxLife, 0, 1);
  const radius = 16 + progress * (effect.radius || (effect.type === "time-explosion" ? 135 : 64));
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let ring = 0; ring < 3; ring += 1) {
    ctx.globalAlpha = (1 - progress) * (0.78 - ring * 0.18);
    ctx.strokeStyle = ring === 1 ? "#8d7cff" : ring === 2 ? "#f7fbff" : effect.color;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 22 + ring * 9;
    ctx.lineWidth = Math.max(1.5, 7 - ring * 2);
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, radius * (1 + ring * 0.13), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = (1 - progress) * 0.3;
  const burst = ctx.createRadialGradient(effect.x, effect.y, 0, effect.x, effect.y, radius);
  burst.addColorStop(0, "#ffffff");
  burst.addColorStop(0.22, effect.color);
  burst.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = burst;
  ctx.beginPath();
  ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
  ctx.fill();
  for (let ray = 0; ray < 10; ray += 1) {
    const angle = ray * Math.PI * 0.2 + progress * 1.7;
    const inner = radius * 0.35;
    const outer = radius * (0.72 + (ray % 3) * 0.12);
    ctx.globalAlpha = (1 - progress) * 0.52;
    ctx.strokeStyle = ray % 2 ? effect.color : "#f7fbff";
    ctx.lineWidth = ray % 3 === 0 ? 3 : 1.5;
    ctx.beginPath();
    ctx.moveTo(effect.x + Math.cos(angle) * inner, effect.y + Math.sin(angle) * inner);
    ctx.lineTo(effect.x + Math.cos(angle) * outer, effect.y + Math.sin(angle) * outer);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSwordTrail(effect) {
  const alpha = clamp(effect.life / effect.maxLife, 0, 1);
  const angle = Math.atan2(effect.y2 - effect.y1, effect.x2 - effect.x1);
  const sideX = Math.cos(angle + Math.PI / 2);
  const sideY = Math.sin(angle + Math.PI / 2);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  [
    { width: effect.type === "sword-ultimate-trail" ? 18 : 12, color: effect.color, alpha: 0.18 },
    { width: effect.type === "sword-ultimate-trail" ? 9 : 6, color: "#a5f3fc", alpha: 0.58 },
    { width: 2.4, color: "#ffffff", alpha: 0.95 }
  ].forEach((layer, index) => {
    ctx.globalAlpha = alpha * layer.alpha;
    ctx.strokeStyle = layer.color;
    ctx.shadowColor = layer.color;
    ctx.shadowBlur = 26 + index * 8;
    ctx.lineWidth = layer.width;
    ctx.beginPath();
    ctx.moveTo(effect.x1 + sideX * index * 3, effect.y1 + sideY * index * 3);
    ctx.lineTo(effect.x2 + sideX * index * 3, effect.y2 + sideY * index * 3);
    ctx.stroke();
  });
  for (let spark = 0; spark < 5; spark += 1) {
    const t = (spark + 1) / 6;
    const x = effect.x1 + (effect.x2 - effect.x1) * t;
    const y = effect.y1 + (effect.y2 - effect.y1) * t;
    ctx.globalAlpha = alpha * 0.42;
    ctx.strokeStyle = spark % 2 ? "#f7fbff" : effect.color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - sideX * 14, y - sideY * 14);
    ctx.lineTo(x + sideX * 14, y + sideY * 14);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSwordRing(effect) {
  const progress = 1 - clamp(effect.life / effect.maxLife, 0, 1);
  const radius = effect.radius * (0.65 + progress * 0.45);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 1 - progress;
  ctx.translate(effect.x, effect.y);
  ctx.rotate(game.tick * 0.14);
  for (let ring = 0; ring < 3; ring += 1) {
    ctx.strokeStyle = ring === 0 ? "#ffffff" : ring === 1 ? effect.color : "#60a5fa";
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 28;
    ctx.lineWidth = 7 - ring * 2;
    ctx.setLineDash(ring === 0 ? [] : [16, 9]);
    ctx.lineDashOffset = -game.tick * (ring + 1);
    ctx.beginPath();
    ctx.arc(0, 0, radius + ring * 8, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawDemonBeam(effect) {
  const alpha = clamp(effect.life / effect.maxLife, 0, 1);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  [
    { width: effect.type === "demon-cleave" ? 28 : 22, color: "#050505", alpha: 0.88 },
    { width: effect.type === "demon-cleave" ? 18 : 14, color: "#6b3f24", alpha: 0.45 },
    { width: effect.type === "demon-cleave" ? 10 : 8, color: "#38bdf8", alpha: 0.72 },
    { width: 2.5, color: "#dff8ff", alpha: 0.95 }
  ].forEach(layer => {
    ctx.globalAlpha = alpha * layer.alpha;
    ctx.strokeStyle = layer.color;
    ctx.shadowColor = layer.color === "#050505" ? "#38bdf8" : layer.color;
    ctx.shadowBlur = 26;
    ctx.lineWidth = layer.width;
    ctx.beginPath();
    ctx.moveTo(effect.x1, effect.y1);
    ctx.lineTo(effect.x2, effect.y2);
    ctx.stroke();
  });
  ctx.restore();
}

function drawDemonFocus(effect) {
  const fighter = effect.fighter;
  if (!fighter) return;
  const progress = 1 - clamp(effect.life / effect.maxLife, 0, 1);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let ring = 0; ring < 4; ring += 1) {
    ctx.globalAlpha = (0.75 - ring * 0.12) * (0.45 + progress * 0.55);
    ctx.strokeStyle = ring % 2 ? "#6b3f24" : "#38bdf8";
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 26;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 10]);
    ctx.lineDashOffset = -game.tick * (1 + ring * 0.45);
    ctx.beginPath();
    ctx.arc(fighter.x, fighter.y, fighter.radius + 18 + ring * 10, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawFaithFields() {
  const believers = game.fighters.filter(fighter => fighter.kind === "believer" && fighter.hp > 0);
  believers.forEach(fighter => {
    if (fighter.ceremonyTime > 0) {
      const alpha = clamp(fighter.ceremonyTime / 300, 0, 1);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.08 + alpha * 0.14;
      const gradient = ctx.createRadialGradient(fighter.x, fighter.y, 30, canvas.width / 2, canvas.height / 2, canvas.width * 0.75);
      gradient.addColorStop(0, "#fef3c7");
      gradient.addColorStop(0.48, fighter.accent);
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#fef3c7";
      ctx.lineWidth = 2;
      ctx.setLineDash([18, 14]);
      ctx.lineDashOffset = -game.tick * 1.2;
      for (let ring = 0; ring < 4; ring += 1) {
        ctx.globalAlpha = (0.22 - ring * 0.03) * alpha;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 80 + ring * 70 + (game.tick % 60), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
    if (fighter.faithStacks > 0) {
      const power = 2 ** (fighter.faithStacks - 1);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = clamp(0.05 + power * 0.015, 0.07, 0.28);
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "#7f1d1d");
      gradient.addColorStop(0.45, "#fb7185");
      gradient.addColorStop(1, "#fef3c7");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#fb7185";
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 22]);
      ctx.lineDashOffset = -game.tick * (1 + fighter.faithStacks * 0.18);
      for (let line = -canvas.height; line < canvas.width; line += 66) {
        ctx.beginPath();
        ctx.moveTo(line, canvas.height);
        ctx.lineTo(line + canvas.height, 0);
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.shadowColor = "#facc15";
      ctx.shadowBlur = 34 + Math.min(34, power * 2.5);
      ctx.globalAlpha = clamp(0.62 + power * 0.03, 0.62, 0.95);
      ctx.fillStyle = "#facc15";
      ctx.strokeStyle = "#fff7ad";
      ctx.lineWidth = 5;
      const pulse = Math.sin(game.tick * 0.08) * 4;
      ctx.beginPath();
      ctx.roundRect(-17 - pulse * 0.25, -132 - pulse, 34 + pulse * 0.5, 264 + pulse * 2, 10);
      ctx.roundRect(-92 - pulse, -22 - pulse * 0.2, 184 + pulse * 2, 44 + pulse * 0.4, 10);
      ctx.fill();
      ctx.stroke();
      ctx.globalAlpha = 0.32;
      ctx.lineWidth = 3;
      ctx.setLineDash([14, 12]);
      ctx.lineDashOffset = -game.tick * 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, 150 + pulse * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  });
}

function drawFaithPulse(effect) {
  const fighter = effect.fighter;
  if (!fighter) return;
  const progress = 1 - clamp(effect.life / effect.maxLife, 0, 1);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = clamp(effect.life / effect.maxLife, 0, 1);
  ctx.strokeStyle = effect.type === "prayer-heal" ? "#fef3c7" : effect.color;
  ctx.shadowColor = ctx.strokeStyle;
  ctx.shadowBlur = 28;
  ctx.lineWidth = effect.type === "prayer-heal" ? 5 : 9;
  ctx.beginPath();
  ctx.arc(fighter.x, fighter.y, fighter.radius + 18 + progress * (effect.type === "prayer-heal" ? 38 : 210), 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawArtOrbs() {
  if (!game.artOrbs?.length) return;
  game.artOrbs.forEach(orb => {
    const boosted = orb.owner.artSoulTime > 0;
    const trailColor = "#67e8f9";
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    for (let index = 1; index < orb.trail.length; index += 1) {
      const previous = orb.trail[index - 1];
      const current = orb.trail[index];
      ctx.globalAlpha = boosted ? 0.16 : 0.085;
      ctx.strokeStyle = trailColor;
      ctx.shadowColor = trailColor;
      ctx.shadowBlur = boosted ? 6 : 2;
      ctx.lineWidth = current.radius * (boosted ? 0.46 : 0.28);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(previous.x, previous.y);
      ctx.lineTo(current.x, current.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.translate(orb.x, orb.y);
    ctx.globalCompositeOperation = "lighter";
    ctx.shadowColor = trailColor;
    ctx.shadowBlur = boosted ? 24 : 14;
    ctx.fillStyle = trailColor;
    ctx.beginPath();
    ctx.arc(0, 0, orb.radius + (boosted ? 5 : 0), 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = trailColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, orb.radius + 8 + Math.sin(game.tick * 0.18) * 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  });
}

function drawDrawingFlash(effect) {
  const trail = effect.trail || effect.orb?.trail || [];
  if (trail.length < 2) return;
  const alpha = clamp(effect.life / effect.maxLife, 0, 1);
  const trailColor = "#67e8f9";
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = alpha * 0.28;
  ctx.lineCap = "round";
  ctx.shadowColor = trailColor;
  ctx.shadowBlur = 6;
  ctx.strokeStyle = trailColor;
  ctx.lineWidth = 5;
  for (let index = 1; index < trail.length; index += 4) {
    const previous = trail[index - 1];
    const current = trail[index];
    ctx.beginPath();
    ctx.moveTo(previous.x, previous.y);
    ctx.lineTo(current.x, current.y);
    ctx.stroke();
  }
  ctx.globalAlpha = alpha * 0.18;
  ctx.strokeStyle = trailColor;
  ctx.lineWidth = 2;
  for (let index = 1; index < trail.length; index += 2) {
    const previous = trail[index - 1];
    const current = trail[index];
    ctx.beginPath();
    ctx.moveTo(previous.x, previous.y);
    ctx.lineTo(current.x, current.y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawRifts() {
  const owners = [...new Set(game.rifts.map(rift => rift.owner))];
  owners.forEach(owner => {
    const rifts = game.rifts.filter(rift => rift.owner === owner);
    ctx.save();
    riftConnections(rifts).forEach(([a, b]) => {
      drawPrismaticBeam(ctx, a.x, a.y, b.x, b.y, 7, owner.accent, game.tick + a.x, 0.72);
    });
    rifts.forEach(rift => {
      if (rift.voidFieldTime > 0) {
        const fieldRate = clamp(rift.voidFieldTime / 180, 0, 1);
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 0.12 + fieldRate * 0.14;
        ctx.fillStyle = owner.accent;
        ctx.beginPath();
        ctx.arc(rift.x, rift.y, VOID_RIFT_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#f0abfc";
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 8]);
        ctx.beginPath();
        ctx.arc(rift.x, rift.y, VOID_RIFT_RADIUS - (game.tick % 36), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      const radius = rift.isVoid ? 20 : 13;
      drawLuminousCore(ctx, rift.x, rift.y, radius, rift.isVoid ? "#16052f" : owner.color, owner.accent, game.tick + rift.x);
      ctx.save();
      ctx.translate(rift.x, rift.y);
      ctx.rotate(game.tick * (rift.isVoid ? -0.018 : 0.025));
      ctx.strokeStyle = rift.isVoid ? "#f0abfc" : "#f7fbff";
      ctx.globalAlpha = 0.8;
      ctx.lineWidth = rift.isVoid ? 3 : 2;
      ctx.setLineDash(rift.isVoid ? [7, 5] : [4, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, radius + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
    ctx.restore();
  });
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
  ctx.globalCompositeOperation = "lighter";
  for (let ring = 0; ring < 3; ring += 1) {
    ctx.globalAlpha = alpha * (0.9 - ring * 0.2);
    ctx.strokeStyle = ring === 1 ? "#8d7cff" : ring === 2 ? "#f7fbff" : effect.color;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = effect.type === "unstoppable-burst" ? 40 : 24;
    ctx.lineWidth = Math.max(1.5, width - ring * 2);
    ctx.setLineDash(ring === 1 ? [16, 10] : []);
    ctx.lineDashOffset = -game.tick * (ring + 1);
    ctx.beginPath();
    ctx.arc(fighter.x, fighter.y, radius * (1 - ring * 0.1), 0, Math.PI * 2);
    ctx.stroke();
  }
  for (let ray = 0; ray < 12; ray += 1) {
    const angle = ray * Math.PI / 6 + progress * 0.8;
    ctx.globalAlpha = alpha * 0.55;
    ctx.strokeStyle = ray % 3 === 0 ? "#f7fbff" : effect.color;
    ctx.lineWidth = ray % 3 === 0 ? 3 : 1.5;
    ctx.beginPath();
    ctx.moveTo(
      fighter.x + Math.cos(angle) * radius * 0.78,
      fighter.y + Math.sin(angle) * radius * 0.78
    );
    ctx.lineTo(
      fighter.x + Math.cos(angle) * radius * 1.18,
      fighter.y + Math.sin(angle) * radius * 1.18
    );
    ctx.stroke();
  }
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
  if (fighter.phaseTime > 0 && fighter.kind === "swordsman") return;
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
  if (fighter.kind === "summoner") {
    ctx.fillStyle = fighter.summonMode === "warrior" ? "#4ade80" : "#facc15";
    ctx.font = "1000 15px Segoe UI, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(fighter.summonMode === "warrior" ? "W" : "A", -12, 14);
  }
  if (fighter.kind === "swordsman") {
    ctx.save();
    ctx.rotate(game.tick * 0.025);
    ctx.strokeStyle = "#f7fbff";
    ctx.shadowColor = fighter.accent;
    ctx.shadowBlur = 18;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-18, 16);
    ctx.lineTo(18, -18);
    ctx.stroke();
    ctx.strokeStyle = fighter.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, fighter.radius + 11, 0, Math.PI * 1.25);
    ctx.stroke();
    ctx.restore();
  }
  if (fighter.kind === "demon") {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = "#38bdf8";
    ctx.fillStyle = "#6b3f24";
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 16;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-17, 13);
    ctx.lineTo(15, -15);
    ctx.lineTo(8, 8);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.restore();
  }
  if (fighter.kind === "artist") {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = "#f7f4eb";
    ctx.fillStyle = fighter.accent;
    ctx.shadowColor = fighter.accent;
    ctx.shadowBlur = 16;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-6, 2, 13, 0, Math.PI * 2);
    ctx.stroke();
    ["#f472b6", "#67e8f9", "#fde68a"].forEach((color, index) => {
      const angle = index / 3 * Math.PI * 2 + game.tick * 0.04;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * 13, Math.sin(angle) * 9, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.strokeStyle = "#f7f4eb";
    ctx.beginPath();
    ctx.moveTo(8, 16);
    ctx.lineTo(20, -12);
    ctx.stroke();
    ctx.restore();
  }
  if (fighter.kind === "believer") {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = "#fef3c7";
    ctx.fillStyle = fighter.accent;
    ctx.shadowColor = "#fef3c7";
    ctx.shadowBlur = 18;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -21);
    ctx.lineTo(0, 18);
    ctx.moveTo(-14, -5);
    ctx.lineTo(14, -5);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, fighter.radius + 12 + Math.sin(game.tick * 0.12) * 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
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
  if ((fighter.demonMarkCount || 0) > 0) drawDemonMark(fighter);
  drawFighterName(fighter);
  drawFighterHealthBar(fighter);
  drawPokerHand(fighter);
  if (fighter.kind === "enhancer") {
    addFighterStatLabel(fighter, `공격력 ${Math.floor(fighter.attackPower)}`, fighter.accent);
  }
  if (fighter.kind === "summoner") {
    addFighterStatLabel(fighter, fighter.summonMode === "warrior" ? "전사 체제" : "궁수 체제", fighter.accent);
  }
}

function drawDemonMark(target) {
  ctx.save();
  const count = target.demonMarkCount || 0;
  const alpha = clamp((target.demonMarkTime || 0) / 300, 0.45, 1);
  const pulse = 0.5 + Math.sin(game.tick * 0.16) * 0.5;
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = alpha;
  ctx.translate(target.x, target.y);
  ctx.shadowColor = "#38bdf8";
  ctx.shadowBlur = 18 + pulse * 10;
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(56, 189, 248, 0.88)";
  ctx.beginPath();
  ctx.arc(0, 0, target.radius + 11 + pulse * 3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(107, 63, 36, 0.82)";
  ctx.beginPath();
  ctx.arc(0, 0, target.radius + 18 + pulse * 4, -Math.PI * 0.35, Math.PI * 1.35);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = alpha;
  ctx.translate(target.x, target.y - target.radius - 16);
  for (let index = 0; index < count; index += 1) {
    const angle = index / Math.max(1, count) * Math.PI * 2 + game.tick * 0.04;
    const x = Math.cos(angle) * 17;
    const y = Math.sin(angle) * 7;
    ctx.fillStyle = index % 2 ? "#6b3f24" : "#38bdf8";
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(x, y, 5.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(5, 5, 5, 0.72)";
  ctx.shadowColor = "#38bdf8";
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.roundRect(-15, -12, 30, 24, 8);
  ctx.fill();
  ctx.fillStyle = "#dff8ff";
  ctx.strokeStyle = "#050505";
  ctx.lineWidth = 4;
  ctx.font = "900 15px Segoe UI, Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.strokeText(String(count), 0, 0);
  ctx.fillText(String(count), 0, 0);
  ctx.restore();
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
  drawCheapTrail(ctx, ball.x, ball.y, ball.vx, ball.vy, ball.radius, ball.color, ball.star ? 0.78 : 0.46);
  if (ball.summonArrow) {
    ctx.save();
    ctx.translate(ball.x, ball.y);
    ctx.rotate(Math.atan2(ball.vy, ball.vx));
    ctx.strokeStyle = ball.color;
    ctx.fillStyle = ball.color;
    ctx.shadowColor = ball.color;
    ctx.shadowBlur = ball.persistentArrow ? 16 : 8;
    ctx.lineWidth = ball.persistentArrow ? 5 : 3;
    ctx.beginPath();
    ctx.moveTo(-ball.radius - 8, 0);
    ctx.lineTo(ball.radius + 8, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ball.radius + 8, 0);
    ctx.lineTo(ball.radius, -6);
    ctx.lineTo(ball.radius, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    return;
  }
  if (ball.star) {
    ctx.save();
    ctx.translate(ball.x, ball.y);
    ctx.rotate(Math.atan2(ball.vy, ball.vx));
    ctx.globalCompositeOperation = "lighter";
    ctx.shadowColor = ball.color;
    ctx.shadowBlur = 30;
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
  if (ball.demonMissile) {
    ctx.translate(ball.x, ball.y);
    ctx.rotate(Math.atan2(ball.vy, ball.vx));
    ctx.globalCompositeOperation = "lighter";
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 24;
    const core = ctx.createLinearGradient(-ball.radius - 8, 0, ball.radius + 10, 0);
    core.addColorStop(0, "#050505");
    core.addColorStop(0.48, "#6b3f24");
    core.addColorStop(1, "#38bdf8");
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.moveTo(ball.radius + 12, 0);
    ctx.lineTo(-ball.radius, -ball.radius * 0.82);
    ctx.lineTo(-ball.radius * 0.45, 0);
    ctx.lineTo(-ball.radius, ball.radius * 0.82);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#dff8ff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    return;
  }
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
  ctx.shadowColor = ball.color;
  ctx.shadowBlur = 10;
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

function drawPrismaticBeam(renderCtx, x1, y1, x2, y2, width, color, phase = 0, alpha = 1) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;
  const shimmer = Math.sin(phase * 0.18) * Math.max(2, width * 0.08);
  renderCtx.save();
  renderCtx.globalCompositeOperation = "lighter";
  renderCtx.lineCap = "round";
  renderCtx.globalAlpha = alpha * 0.2;
  renderCtx.strokeStyle = color;
  renderCtx.shadowColor = color;
  renderCtx.shadowBlur = width * 1.35;
  renderCtx.lineWidth = width * 1.65;
  renderCtx.beginPath();
  renderCtx.moveTo(x1, y1);
  renderCtx.lineTo(x2, y2);
  renderCtx.stroke();

  [
    { offset: -width * 0.17 + shimmer, stroke: "#8d7cff", size: width * 0.5, opacity: 0.7 },
    { offset: width * 0.17 - shimmer, stroke: "#3dd6d0", size: width * 0.5, opacity: 0.7 },
    { offset: 0, stroke: color, size: width * 0.72, opacity: 0.95 },
    { offset: 0, stroke: "#f7fbff", size: Math.max(2, width * 0.2), opacity: 1 }
  ].forEach(layer => {
    renderCtx.globalAlpha = alpha * layer.opacity;
    renderCtx.strokeStyle = layer.stroke;
    renderCtx.shadowColor = layer.stroke;
    renderCtx.shadowBlur = layer.size * 0.8;
    renderCtx.lineWidth = layer.size;
    renderCtx.beginPath();
    renderCtx.moveTo(x1 + nx * layer.offset, y1 + ny * layer.offset);
    renderCtx.lineTo(x2 + nx * layer.offset, y2 + ny * layer.offset);
    renderCtx.stroke();
  });
  renderCtx.restore();
}

function drawAreaAttack(attack) {
  ctx.save();
  const warning = attack.delay > 0;
  const isAnnihilator = attack.type === "annihilator-laser";
  if (attack.type === "sword-circle") {
    const alpha = clamp(attack.life / 24, 0, 1);
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = alpha;
    ctx.translate(attack.x, attack.y);
    ctx.rotate(game.tick * 0.18 + attack.angle);
    for (let ring = 0; ring < 3; ring += 1) {
      ctx.strokeStyle = ring === 0 ? "#ffffff" : ring === 1 ? attack.color : "#60a5fa";
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 26;
      ctx.lineWidth = 8 - ring * 2;
      ctx.setLineDash(ring === 0 ? [] : [18, 10]);
      ctx.lineDashOffset = -game.tick * (ring + 1);
      ctx.beginPath();
      ctx.arc(0, 0, attack.radius - ring * 8, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }
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
  if (warning) {
    ctx.globalCompositeOperation = "lighter";
    ctx.setLineDash([4, 10]);
    ctx.lineDashOffset = -game.tick * 1.8;
    ctx.strokeStyle = "#f7fbff";
    ctx.globalAlpha = 0.55 + Math.sin(game.tick * 0.25) * 0.18;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(attack.x, attack.y, attack.radius * 0.78, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = isAnnihilator ? "#ff304f" : "#67e8f9";
    ctx.beginPath();
    ctx.arc(attack.x, attack.y, 4 + Math.sin(game.tick * 0.3) * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  if (!warning && (attack.type === "laser" || isAnnihilator)) {
    drawPrismaticBeam(
      ctx,
      attack.x,
      0,
      attack.x,
      isAnnihilator ? attack.y : canvas.height,
      isAnnihilator ? 24 : 38,
      isAnnihilator ? "#ff304f" : "#7de7ff",
      game.tick,
      ctx.globalAlpha
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
  const alpha = beam.delay > 0 ? 0.35 : clamp(beam.life / 24, 0, 1);
  if (beam.delay > 0) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = beam.color;
    ctx.shadowColor = beam.color;
    ctx.shadowBlur = 12;
    ctx.lineWidth = 6;
    ctx.setLineDash([12, 10]);
    ctx.beginPath();
    ctx.moveTo(beam.x1, beam.y1);
    ctx.lineTo(beam.x2, beam.y2);
    ctx.stroke();
    ctx.restore();
    return;
  }
  drawPrismaticBeam(ctx, beam.x1, beam.y1, beam.x2, beam.y2, 34, beam.color, game.tick, alpha);
}

function drawWeapon(weapon) {
  drawMotionTrail(ctx, weapon.x, weapon.y, weapon.vx, weapon.vy, 10, weapon.color, 0.7);
  ctx.save();
  ctx.translate(weapon.x, weapon.y);
  ctx.rotate(Math.atan2(weapon.vy, weapon.vx));
  ctx.shadowColor = weapon.color;
  ctx.globalCompositeOperation = "lighter";
  ctx.shadowBlur = 30;
  ctx.fillStyle = weapon.color;
  ctx.fillRect(-25, -7, 50, 14);
  ctx.fillStyle = "#f7f4eb";
  ctx.fillRect(5, -11, 14, 22);
  ctx.strokeStyle = "#f7fbff";
  ctx.lineWidth = 2;
  ctx.strokeRect(-25, -7, 50, 14);
  ctx.restore();
}

function drawShockwave(wave) {
  ctx.save();
  const alpha = clamp(wave.life / 34, 0, 1);
  ctx.globalCompositeOperation = "lighter";
  for (let ring = 0; ring < 4; ring += 1) {
    ctx.strokeStyle = ring === 1 ? "#8d7cff" : ring === 2 ? "#67e8f9" : ring === 3 ? "#f7fbff" : wave.color;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 20;
    ctx.globalAlpha = alpha * (0.82 - ring * 0.14);
    ctx.lineWidth = Math.max(1.5, 7 - ring * 1.5);
    ctx.beginPath();
    ctx.arc(wave.x, wave.y, wave.radius * (1 - ring * 0.055), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPokerShot(card) {
  if (card.delay > 0) return;
  drawMotionTrail(ctx, card.x, card.y, card.vx, card.vy, 11, card.color || "#ef476f", 0.6);
  ctx.save();
  ctx.translate(card.x, card.y);
  ctx.rotate(Math.atan2(card.vy, card.vx));
  ctx.shadowColor = card.color || "#ef476f";
  ctx.shadowBlur = 22;
  const cardGradient = ctx.createLinearGradient(-14, -10, 14, 10);
  cardGradient.addColorStop(0, "#ffffff");
  cardGradient.addColorStop(0.55, "#f7f4eb");
  cardGradient.addColorStop(1, "#ffd6e3");
  ctx.fillStyle = cardGradient;
  ctx.fillRect(-14, -10, 28, 20);
  ctx.strokeStyle = card.color || "#ef476f";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(-14, -10, 28, 20);
  ctx.fillStyle = "#12131a";
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
  ctx.save();
  const startX = grapple.owner.x;
  const startY = grapple.owner.y;
  const endX = startX + Math.cos(grapple.angle) * grapple.length;
  const endY = startY + Math.sin(grapple.angle) * grapple.length;
  ctx.globalCompositeOperation = "lighter";
  [
    { width: grapple.enhanced ? 15 : 10, color: grapple.owner.accent, alpha: 0.18 },
    { width: grapple.enhanced ? 7 : 5, color: grapple.owner.accent, alpha: 0.9 },
    { width: 2, color: "#f7fbff", alpha: 0.95 }
  ].forEach(layer => {
    ctx.globalAlpha = layer.alpha;
    ctx.strokeStyle = layer.color;
    ctx.shadowColor = grapple.owner.accent;
    ctx.shadowBlur = 18;
    ctx.lineWidth = layer.width;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  });
  drawLuminousCore(ctx, endX, endY, grapple.enhanced ? 16 : 10, grapple.owner.color, grapple.owner.accent, game.tick);
  ctx.restore();
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
    if (game.easterEgg?.active) {
      const easterEgg = game.easterEgg;
      if (!easterEgg.revealed && game.tick >= easterEgg.revealTick) {
        easterEgg.revealed = true;
        const winner = game.fighters[easterEgg.winnerIndex];
        const loser = game.fighters[1 - easterEgg.winnerIndex];
        winner.x = canvas.width / 2;
        winner.y = canvas.height / 2;
        winner.vx = 0;
        winner.vy = 0;
        loser.hp = 0;
        updateHud();
      }
      if (game.tick >= easterEgg.finishTick) {
        easterEgg.active = false;
        finishGame(game.fighters[easterEgg.winnerIndex]);
      }
      return;
    }
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
    updateRifts(dt);
    updateSummons(dt);
    updateArtOrbs(dt);
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
  if (!battleClockSyncPending && now - lastBattleClockSyncAt >= 5000) {
    lastBattleClockSyncAt = now;
    battleClockSyncPending = true;
    syncServerClock(1).catch(() => {}).finally(() => {
      battleClockSyncPending = false;
    });
  }
  const serverTick = Math.max(0, Math.floor((serverNowMs() - game.startTimeMs) / FIXED_STEP_MS));
  const targetTick = Math.max(0, serverTick - NETWORK_BUFFER_TICKS);
  if (!resimulatingGame && targetTick - game.tick > 120) {
    resimulateGameToTick(targetTick);
  }
  let steps = 0;
  while (game.tick < targetTick && steps < 60) {
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
  const stats = {
    melee: { speed: 4.2, radius: 26, hp: 65, contactDamage: 5, color: "#ef476f" },
    thrower: { speed: 3.4, radius: 26, hp: 55, contactDamage: 5, color: "#9b7cff" },
    brute: { speed: 2.15, radius: 35, hp: 190, contactDamage: 10, color: "#7d8796" },
    dasher: { speed: 3.8, radius: 25, hp: 85, contactDamage: 8, color: "#ff8f3d" },
    bomber: { speed: 2.8, radius: 27, hp: 80, contactDamage: 5, color: "#d85cff" },
    miniboss: { speed: 2.65, radius: 45, hp: 520, contactDamage: 15, color: "#b26a35" },
    boss: { speed: 3.1, radius: 50, hp: 1000, contactDamage: 18, color: "#9c1647" }
  }[type];
  const velocity = pveVelocity(stats.speed, offset);
  return {
    id: `pve-${type}-${offset}-${pveGame.seed}`,
    type,
    x,
    y,
    vx: velocity.vx,
    vy: velocity.vy,
    baseSpeed: stats.speed,
    radius: stats.radius,
    hp: stats.hp,
    maxHp: stats.hp,
    contactDamage: stats.contactDamage,
    color: stats.color,
    contactCooldown: 0,
    throwTimer: type === "thrower" ? 300 : Infinity,
    dashTimer: type === "dasher" ? 150 + offset * 20 : Infinity,
    dashTime: 0,
    bombTimer: type === "bomber" ? 190 + offset * 25 : Infinity,
    patternTimer: type === "boss" ? 150 : Infinity,
    patternStep: 0,
    slowTime: 0,
    stunTime: 0,
    silenceTime: 0
  };
}

function populatePveStage(stage) {
  const add = (type, x, y, offset) => pveGame.enemies.push(makePveEnemy(type, x, y, offset));
  if (stage === "1-1") add("melee", 480, 260, 1);
  if (stage === "1-2") {
    add("melee", 455, 170, 1);
    add("melee", 500, 350, 2);
  }
  if (stage === "1-3") {
    add("thrower", 460, 150, 1);
    add("melee", 500, 350, 2);
  }
  if (stage === "1-4") {
    add("brute", 470, 300, 1);
    add("thrower", 500, 130, 2);
  }
  if (stage === "1-5") add("miniboss", 470, 260, 1);
  if (stage === "1-6") {
    add("dasher", 440, 130, 1);
    add("dasher", 500, 390, 2);
    add("melee", 520, 260, 3);
  }
  if (stage === "1-7") {
    add("bomber", 430, 120, 1);
    add("bomber", 500, 390, 2);
    add("brute", 500, 260, 3);
  }
  if (stage === "1-8") {
    add("thrower", 430, 100, 1);
    add("dasher", 520, 260, 2);
    add("brute", 450, 410, 3);
  }
  if (stage === "1-9") {
    add("brute", 440, 120, 1);
    add("brute", 500, 400, 2);
    add("dasher", 530, 250, 3);
    add("bomber", 380, 260, 4);
  }
  if (stage === "1-10") add("boss", 470, 260, 1);
}

const SURVIVAL_WEAPONS = {
  pulse: { name: "공 투척기", awakenedName: "궤도 포화", icon: "●", color: "#67e8f9", item: "scope", baseCooldown: 105, description: "가장 가까운 적에게 크고 빠른 공을 발사합니다.", awakenedDescription: "유도 공 4개가 관통하며 피격 지점에 작은 폭발을 일으킵니다." },
  star: { name: "스타 스트라이크", awakenedName: "초신성 강하", icon: "★", color: "#fde68a", item: "scope", baseCooldown: 480, description: "수명이 긴 별 탄환 두 개를 발사합니다.", awakenedDescription: "거대한 별 5개가 벽을 튕기며 적을 반복 관통합니다." },
  ram: { name: "몸통 박치기", awakenedName: "붉은 군단", icon: "B", color: "#fb7185", item: "engine", baseCooldown: 210, description: "적을 향해 짧고 굵은 돌진 탄환을 발사합니다.", awakenedDescription: "세 방향 돌진체가 적을 관통하고 충돌 지점에서 폭발합니다." },
  charge: { name: "불가항력", awakenedName: "절대 돌파", icon: "➤", color: "#fb7185", item: "engine", baseCooldown: 360, description: "적을 향해 강력한 돌진 파동을 발사합니다.", awakenedDescription: "초대형 파동 3개가 화면 끝까지 모든 적을 뚫고 지나갑니다." },
  grapple: { name: "그랩", awakenedName: "천쇄", icon: "⌁", color: "#c4b5fd", item: "reel", baseCooldown: 260, description: "적들을 관통하는 그랩 창을 발사합니다.", awakenedDescription: "무한 관통 창이 적을 중심으로 끌어당기며 지나갑니다." },
  grapplePlus: { name: "강화 그랩", awakenedName: "삼중 포획망", icon: "≋", color: "#ddd6fe", item: "reel", baseCooldown: 390, description: "더 넓고 빠른 강화 그랩을 발사합니다.", awakenedDescription: "거대한 강화 그랩 3개가 부채꼴로 전장을 가릅니다." },
  poker: { name: "와일드 카드", awakenedName: "로열 플러시", icon: "A", color: "#fda4af", item: "deck", baseCooldown: 270, description: "서로 다른 피해를 가진 카드 다섯 장을 펼쳐 던집니다.", awakenedDescription: "카드 9장이 치명타와 상태 효과를 연속으로 발동합니다." },
  draw: { name: "드로우", awakenedName: "데스 드로우", icon: "J", color: "#fb7185", item: "deck", baseCooldown: 210, description: "특수 효과를 가진 카드 한 장을 빠르게 던집니다.", awakenedDescription: "유도 카드 3장이 적을 관통하며 카드별 효과를 강화합니다." },
  shadow: { name: "암살의 잔상", awakenedName: "무영참", icon: "✦", color: "#60a5fa", item: "cloak", baseCooldown: 420, description: "가까운 적에게 잔상을 남기는 범위 참격을 가합니다.", awakenedDescription: "적과 자신 위치에서 거대한 이중 참격이 발생하고 잠시 무적이 됩니다." },
  temper: { name: "강화 타격", awakenedName: "무한 단련", icon: "E", color: "#fdba74", item: "furnace", baseCooldown: 230, description: "시간에 따라 강해지는 무거운 타격을 발사합니다.", awakenedDescription: "시간 성장 제한이 해제되고 폭발하는 강화탄을 발사합니다." },
  forge: { name: "갓 웨폰", awakenedName: "신기 병장", icon: "†", color: "#fbbf24", item: "furnace", baseCooldown: 330, description: "회전하는 무기를 적에게 발사한 뒤 되돌립니다.", awakenedDescription: "다섯 개의 신기가 적을 추적하며 여러 번 관통합니다." },
  shock: { name: "충격파", awakenedName: "대지 붕괴", icon: "◉", color: "#94a3b8", item: "core", baseCooldown: 390, description: "주변 적에게 피해를 주고 밀어내는 충격파를 일으킵니다.", awakenedDescription: "화면 대부분을 덮는 충격파가 높은 피해와 긴 기절을 줍니다." },
  taunt: { name: "도발", awakenedName: "절대 도발", icon: "!", color: "#cbd5e1", item: "core", baseCooldown: 360, description: "주변 적에게 피해를 주고 잠시 느리게 만듭니다.", awakenedDescription: "전장 전체의 적을 중심으로 끌어당기고 크게 둔화시킵니다." },
  shield: { name: "야수의 방패", awakenedName: "불멸의 성채", icon: "⬟", color: "#e2e8f0", item: "core", baseCooldown: 600, description: "주변에 강력한 방패 폭발을 일으킵니다.", awakenedDescription: "2초 무적 후 초대형 폭발로 적을 기절시킵니다." },
  beam: { name: "천공 레이저", awakenedName: "천공 심판", icon: "┃", color: "#38bdf8", item: "lens", baseCooldown: 300, description: "적의 위치를 예고한 뒤 세로 레이저로 포격합니다.", awakenedDescription: "거대한 레이저 3개가 빠르게 연속 포격합니다." },
  slowBeam: { name: "슬로우 빔", awakenedName: "시간 절단선", icon: "═", color: "#7dd3fc", item: "lens", baseCooldown: 330, description: "적들을 관통하고 느리게 만드는 넓은 빔을 발사합니다.", awakenedDescription: "세 갈래 초대형 빔이 적을 강하게 둔화시키며 관통합니다." },
  wild: { name: "야생의 발톱", awakenedName: "백수의 난무", icon: "W", color: "#a3e635", item: "fang", baseCooldown: 240, description: "무작위 적 주변을 세 차례 할큅니다.", awakenedDescription: "일곱 번의 대형 할퀴기가 약한 적에게 치명적인 피해를 줍니다." },
  blood: { name: "핏빛 탄환", awakenedName: "혈월", icon: "◆", color: "#f43f5e", item: "chalice", baseCooldown: 300, description: "체력이 낮을수록 강해지는 피의 탄환을 발사합니다.", awakenedDescription: "거대한 관통 혈탄 3개가 적을 추적하고 높은 흡혈을 제공합니다." },
  fist: { name: "맨몸 난타", awakenedName: "투신 강림", icon: "F", color: "#fb923c", item: "knuckle", baseCooldown: 90, description: "가까운 적에게 빠른 범위 주먹 공격을 가합니다.", awakenedDescription: "초대형 연속 충격파가 짧은 주기로 전장을 쓸어냅니다." },
  clock: { name: "초침", awakenedName: "종말의 시계", icon: "◷", color: "#67e8f9", item: "chronometer", baseCooldown: 240, description: "바라보는 방향에 넓은 시간 참격을 휘두릅니다.", awakenedDescription: "네 방향으로 거대한 시간 참격을 연속 발동합니다." },
  replay: { name: "리플레이", awakenedName: "영겁 회귀", icon: "↶", color: "#f2c14e", item: "chronometer", baseCooldown: 540, description: "주변에 시간 폭발을 일으키고 체력을 조금 회복합니다.", awakenedDescription: "세 차례 시간 폭발과 큰 회복을 일으키며 잠시 무적이 됩니다." },
  rift: { name: "균열 레이저", awakenedName: "차원 붕괴선", icon: "R", color: "#a78bfa", item: "voidCore", baseCooldown: 280, description: "전장을 가로지르는 균열 광선을 생성합니다.", awakenedDescription: "여러 방향의 초대형 균열선이 전장을 반복 절단합니다." },
  void: { name: "보이드", awakenedName: "공허 특이점", icon: "◌", color: "#22d3ee", item: "voidCore", baseCooldown: 420, description: "적이 모인 위치에 공허 폭발을 일으킵니다.", awakenedDescription: "거대한 특이점이 적을 끌어당기며 연속 폭발합니다." },
  legion: { name: "일어나라!", awakenedName: "군단 강림", icon: "N", color: "#4ade80", item: "commandSeal", baseCooldown: 250, description: "전장 가장자리에서 소환수의 탄환을 발사합니다.", awakenedDescription: "전장 사방에서 강화 소환수 군단이 화살을 쏟아냅니다." },
  swordDance: { name: "원형검무", awakenedName: "절공검무", icon: "K", color: "#bae6fd", item: "swordScroll", baseCooldown: 270, description: "가까운 적 위치에 원형 베기를 남겨 범위 피해를 줍니다.", awakenedDescription: "맵을 가르는 검흔 5개가 연속으로 전장을 절단합니다." },
  deathSword: { name: "데스 소드", awakenedName: "로스트 엔젤", icon: "M", color: "#38bdf8", item: "demonSigil", baseCooldown: 300, description: "적을 관통하는 검푸른 암흑 검기를 발사합니다.", awakenedDescription: "세 갈래 암흑 검기가 적을 관통하고 입힌 피해 일부를 회복합니다." },
  artOrbit: { name: "예술의 궤도", awakenedName: "예술의 혼", icon: "A", color: "#f9a8d4", item: "prismInk", baseCooldown: 360, description: "벽에 튕기는 예술 구체가 긴 궤적을 남기며 적을 관통합니다.", awakenedDescription: "고속 예술 구체 4개가 긴 시간 맵을 가로지릅니다." },
  growingFaith: { name: "커져가는 신앙", awakenedName: "황금 십자가", icon: "H", color: "#facc15", item: "holyRelic", baseCooldown: 450, description: "맵 중앙의 십자가 빛이 적을 태우고 자신을 조금 회복합니다.", awakenedDescription: "커다란 황금 십자가가 여러 번 빛나며 전장을 정화합니다." },
  mageLightning: { name: "벼락", awakenedName: "천벌 기록", icon: "Z", color: "#facc15", item: "akashicTome", baseCooldown: 300, description: "가까운 적에게 낙뢰를 떨어뜨려 피해를 줍니다.", awakenedDescription: "연속 낙뢰가 여러 적을 강타하고 작은 폭발을 남깁니다." },
  mageFire: { name: "작열", awakenedName: "멸화 운석", icon: "火", color: "#fb923c", item: "akashicTome", baseCooldown: 480, description: "잠시 후 적 위치에 커다란 파이어 볼을 떨어뜨립니다.", awakenedDescription: "거대한 운석 3개가 넓은 범위를 불태웁니다." },
  mageSea: { name: "창해", awakenedName: "심해 성역", icon: "海", color: "#38bdf8", item: "akashicTome", baseCooldown: 600, description: "전장에 심해의 물결을 일으켜 적을 느리게 만들고 피해를 줍니다.", awakenedDescription: "맵 전체에 강한 심해 파동이 반복적으로 밀려옵니다." }
};

const SURVIVAL_ITEMS = {
  scope: { name: "룩 온 조준경", icon: "⌖", weapon: "pulse", description: "이제부터 모든 공이 적을 추적하여 공격합니다.", effect: "모든 공 유도" },
  engine: { name: "분노 엔진", icon: "▲", weapon: "charge", description: "이동속도가 15% 증가하고 돌진 계열 공격의 크기가 증가합니다.", effect: "이속 +15%" },
  reel: { name: "초장력 릴", icon: "∞", weapon: "grapple", description: "그랩 계열 공격의 폭이 약 30% 넓어집니다.", effect: "그랩 폭 +30%" },
  deck: { name: "왕의 덱", icon: "K", weapon: "poker", description: "카드가 일정 확률로 75%의 추가 피해를 줍니다.", effect: "카드 치명타" },
  cloak: { name: "심연의 망토", icon: "☾", weapon: "shadow", description: "암살의 잔상을 발동하면 잠깐 피해를 받지 않습니다.", effect: "짧은 무적" },
  furnace: { name: "영원의 용광로", icon: "♨", weapon: "forge", description: "갓 웨폰이 하나 더 생성되지만 각 무기의 피해는 낮아집니다.", effect: "무기 수 +1" },
  core: { name: "진동 코어", icon: "◈", weapon: "shock", description: "충격파 계열 공격이 적을 짧게 기절시킵니다.", effect: "짧은 기절" },
  lens: { name: "절멸 렌즈", icon: "◇", weapon: "beam", description: "천공 레이저를 두 번 포격하지만 각 포격의 피해는 감소합니다.", effect: "레이저 분할 포격" },
  fang: { name: "포식자의 송곳니", icon: "V", weapon: "wild", description: "체력이 절반 이하인 적에게 35% 추가 피해를 줍니다.", effect: "약한 적 추격" },
  chalice: { name: "핏빛 성배", icon: "♥", weapon: "blood", description: "입힌 피해의 12%를 회복합니다.", effect: "피해 흡혈 12%" },
  knuckle: { name: "투지의 너클", icon: "F", weapon: "fist", description: "체력이 절반 이하일 때 난타의 피해와 범위가 적당히 증가합니다.", effect: "위기 시 난타 강화" },
  chronometer: { name: "파손된 크로노미터", icon: "⌚", weapon: "clock", description: "시간 계열 공격의 범위가 커지고 발동할 때 체력을 조금 회복합니다.", effect: "시간 공격 + 회복" },
  voidCore: { name: "공허 핵", icon: "◉", weapon: "rift", description: "균열 계열 공격이 적을 중심으로 끌어당기고 더 오래 남습니다.", effect: "균열 흡인" },
  commandSeal: { name: "군주의 인장", icon: "♜", weapon: "legion", description: "소환 공격의 발사 수가 증가하고 적을 자동 추적합니다.", effect: "소환 군단 강화" },
  swordScroll: { name: "검무 비급", icon: "卷", weapon: "swordDance", description: "검무 계열 공격의 연속 베기 수가 증가합니다.", effect: "검무 연속 베기" },
  demonSigil: { name: "악마의 표식", icon: "M", weapon: "deathSword", description: "악마 계열 공격이 적을 둔화시키고 입힌 피해 일부를 회복합니다.", effect: "검기 둔화 + 흡혈" },
  prismInk: { name: "프리즘 물감", icon: "A", weapon: "artOrbit", description: "예술 구체의 수와 유지 시간이 증가합니다.", effect: "궤도 구체 강화" },
  holyRelic: { name: "성스러운 유물", icon: "H", weapon: "growingFaith", description: "신앙 계열 공격이 발동할 때 회복량과 빛의 횟수가 증가합니다.", effect: "신앙 회복 강화" },
  akashicTome: { name: "아카식 기록서", icon: "Z", weapon: "mageLightning", description: "대마법 계열 무기의 범위와 타격 횟수가 증가합니다.", effect: "원소 마법 강화" }
};

const SURVIVAL_SUBS = [
  { id: "heal", name: "응급 회복", icon: "+", description: "최대 체력의 20%를 즉시 회복합니다." },
  { id: "maxHp", name: "생명 확장", icon: "HP", description: "최대 체력이 12% 증가하고 같은 양을 회복합니다." },
  { id: "speed", name: "가속 신경", icon: "»", description: "이동속도가 영구적으로 8% 증가합니다." },
  { id: "power", name: "과충전", icon: "↑", description: "모든 피해가 영구적으로 7% 증가합니다." },
  { id: "cooldown", name: "시간 압축", icon: "⌛", description: "모든 무기의 공격주기가 6% 감소합니다." },
  { id: "magnet", name: "자기장 확장", icon: "⊙", description: "XP 흡수 범위가 35 증가합니다." },
  { id: "coin", name: "균열 주화", icon: "C", description: "이번 런의 코인 보상에 5C를 추가합니다." }
];

const SURVIVAL_DIFFICULTIES = {
  easy: {
    label: "EASY",
    enemyHp: 0.82,
    enemyDamage: 0.74,
    enemySpeed: 0.92,
    enemyXp: 0.92,
    spawnCount: 0.82,
    enemyCap: 0.82,
    spawnInterval: 1.2,
    bossPower: 0.78
  },
  normal: {
    label: "NORMAL",
    enemyHp: 1.42,
    enemyDamage: 1.34,
    enemySpeed: 1.1,
    enemyXp: 1.15,
    spawnCount: 1.28,
    enemyCap: 1.22,
    spawnInterval: 0.82,
    bossPower: 1.38
  },
  hard: {
    label: "HARD",
    enemyHp: 2.35,
    enemyDamage: 2.08,
    enemySpeed: 1.28,
    enemyXp: 1.35,
    spawnCount: 1.9,
    enemyCap: 1.68,
    spawnInterval: 0.55,
    bossPower: 2.3
  }
};

function selectSurvivalDifficulty(difficulty) {
  if (!SURVIVAL_DIFFICULTIES[difficulty]) return;
  selectedPveDifficulty = difficulty;
  ui.survivalEntryPanel.dataset.difficulty = difficulty;
  ui.pveDifficultyButtons.forEach(button => {
    const selected = button.dataset.pveDifficulty === difficulty;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", selected ? "true" : "false");
  });
}

function setPveSpeed(speed) {
  const value = speed === 2 ? 2 : 1;
  if (pveGame) pveGame.speedMultiplier = value;
  ui.pveSpeedButtons?.forEach(button => {
    const selected = Number(button.dataset.pveSpeed) === value;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-pressed", selected ? "true" : "false");
  });
}

async function startPveStage(stage) {
  stopPveGame();
  let pveRun = null;
  try {
    pveRun = await rpc("begin_pve_run", {
      session_token: appSessionToken,
      stage_code: "survival"
    });
  } catch (error) {
    try {
      pveRun = await rpc("begin_pve_run", {
        session_token: appSessionToken,
        stage_code: "1-1"
      });
    } catch {
      pveRun = { runId: null };
    }
  }
  const velocity = randomVelocity(5.8);
  const difficulty = SURVIVAL_DIFFICULTIES[selectedPveDifficulty] || SURVIVAL_DIFFICULTIES.easy;
  pveGame = {
    mode: "survival",
    stage: "SURVIVAL",
    difficultyId: selectedPveDifficulty,
    difficulty,
    runId: pveRun.runId || pveRun.run_id,
    seed: Date.now() % 100000,
    tick: 0,
    lastTime: performance.now(),
    accumulator: 0,
    speedMultiplier: 1,
    over: false,
    pausedForAugment: false,
    augmentRerolls: 2,
    currentAugmentChoices: [],
    pendingLevels: 0,
    level: 1,
    xp: 0,
    xpRequired: survivalXpRequired(1),
    kills: 0,
    bonusCoins: 0,
    spawnTimer: 105,
    nextMiniBossTick: 7200,
    nextBossTick: 18000,
    bossCount: 0,
    miniBossCount: 0,
    weapons: {},
    items: {},
    subs: {},
    xpOrbs: [],
    pickups: [],
    startingChoice: true,
    awakeningPaused: false,
    awakeningQueue: [],
    awakeningPlaying: false,
    activeWeaponId: "",
    reaperActive: false,
    reaperTicks: 0,
    reaper: null,
    player: {
      ...makeCharacterCombatState(DEFAULT_CHARACTER),
      name: "균열 생존자",
      x: pveCanvas.width / 2,
      y: pveCanvas.height / 2,
      vx: velocity.vx,
      vy: velocity.vy,
      hp: 200,
      maxHp: 200,
      radius: 28,
      damageMultiplier: 1,
      speedMultiplier: 1,
      cooldownMultiplier: 1,
      magnetRadius: 340,
      invulnerableTime: 120
    },
    enemies: [],
    projectiles: [],
    areaAttacks: [],
    damageTexts: [],
    floatingTexts: []
  };
  setPveSpeed(1);
  ui.pvePlayerLabel.textContent = `${currentUser.name} · ${difficulty.label}`;
  ui.pveResultOverlay.classList.remove("is-active");
  ui.pveAugmentOverlay.classList.remove("is-active");
  renderSurvivalBuild();
  updateSurvivalHud();
  showScreen("pveBattle");
  pveAnimationId = requestAnimationFrame(pveLoop);
  openStartingWeaponChoices();
}

function openPveCharacterSelect(stage) {
  if (!pveProgress.unlockedStages.includes(stage)) return;
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
  const before = pveGame.player.hp;
  pveGame.player.hp = Math.min(pveGame.player.maxHp, pveGame.player.hp + amount);
  const actualHealing = pveGame.player.hp - before;
  pveGame.player.healingDone += actualHealing;
  if (actualHealing <= 0) return;
  pveGame.floatingTexts.push({
    x: pveGame.player.x,
    y: pveGame.player.y - 40,
    text: `+${Math.round(actualHealing * 10) / 10}`,
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
  const actualDamage = Math.min(player.hp, amount);
  player.hp = Math.max(0, player.hp - amount);
  player.damageTaken += actualDamage;
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
  const actualDamage = Math.min(enemy.hp, amount);
  enemy.hp = Math.max(0, enemy.hp - amount);
  pveGame.player.damageDealt += actualDamage;
  addPveDamage(enemy.x, enemy.y - 30, Math.round(amount * 10) / 10);
  if (pveGame.player.kind === "vampire") healPvePlayer(actualDamage * 0.3);
}

function firePvePlayerShot(options = {}) {
  const target = nearestPveEnemy();
  if (!target) return;
  const angle = Math.atan2(target.y - pveGame.player.y, target.x - pveGame.player.x) + (options.angleOffset || 0);
  const blood = options.blood ?? pveGame.player.kind === "vampire";
  const speed = options.speed || (blood ? 15 : 11);
  const radius = options.radius || (blood ? 12 : 8);
  pveGame.projectiles.push({
    owner: "player",
    x: pveGame.player.x + Math.cos(angle) * (pveGame.player.radius + radius + 7),
    y: pveGame.player.y + Math.sin(angle) * (pveGame.player.radius + radius + 7),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius,
    damage: options.damage ?? 10,
    life: options.life || (blood ? 300 : 180),
    color: options.color || (blood ? "#ff174f" : pveGame.player.accent),
    blood,
    hitCooldown: 0,
    homing: Boolean(options.homing),
    star: Boolean(options.star),
    slow: Boolean(options.slow)
  });
}

function firePvePokerCard(options = {}) {
  const target = options.target || nearestPveEnemy();
  if (!target) return;
  const player = pveGame.player;
  const angle = Math.atan2(target.y - player.y, target.x - player.x) + (options.spread || 0);
  pveGame.pokerShots.push({
    target,
    rank: options.rank || "J",
    effect: options.effect || "",
    x: player.x,
    y: player.y,
    vx: 0,
    vy: 0,
    radius: 10,
    damage: options.damage ?? 0,
    life: options.life || 190,
    delay: options.delay || 0,
    spread: options.spread || 0,
    launched: false,
    angle
  });
}

function dealPvePokerAttack() {
  const player = pveGame.player;
  const target = nearestPveEnemy();
  if (!target) return;
  const ranks = ["A", "K", "Q", "J", "10", "9"];
  const hand = Array.from({ length: 5 }, () => ranks[pveRandomIndex(ranks.length)]);
  const counts = Object.values(hand.reduce((acc, rank) => {
    acc[rank] = (acc[rank] || 0) + 1;
    return acc;
  }, {})).sort((a, b) => b - a);
  let multiplier = 1;
  let label = "노페어";
  if (counts[0] === 5) { multiplier = 12; label = "파이브카드"; }
  else if (counts[0] === 4) { multiplier = 8; label = "포카드"; }
  else if (counts[0] === 3 && counts[1] === 2) { multiplier = 7; label = "풀하우스"; }
  else if (counts[0] === 3) { multiplier = 3; label = "쓰리페어"; }
  else if (counts[0] === 2 && counts[1] === 2) { multiplier = 5; label = "투페어"; }
  else if (counts[0] === 2) { multiplier = 2; label = "원페어"; }
  multiplier *= player.pokerBoostMultiplier;
  if (player.pokerBoostMultiplier > 1) {
    label = `${label} + 킹`;
    player.pokerBoostMultiplier = 1;
  }
  player.pokerHand = hand;
  player.pokerReveal = 95;
  player.pokerLabel = `${label}! 데미지 x${multiplier}`;
  hand.forEach((rank, index) => {
    firePvePokerCard({
      target,
      rank,
      damage: 2.25 * multiplier,
      delay: index * 9,
      spread: (index - 2) * 0.1
    });
  });
  addPveFloating(player.pokerLabel, "#f7f4eb");
}

function throwPveDrawCard() {
  const target = nearestPveEnemy();
  if (!target) return;
  const player = pveGame.player;
  const cards = ["JOKER", "A", "K", "Q", "J"];
  const type = cards[pveRandomIndex(cards.length)];
  const damageByType = {
    JOKER: pveRandomIndex(45) + 1,
    A: 7.5,
    K: 0,
    Q: 7.5,
    J: 4.5
  };
  firePvePokerCard({
    target,
    rank: type,
    effect: type,
    damage: damageByType[type],
    life: 170
  });
  addPveFloating(`드로우 ${type}`, player.accent);
}

function firePveSlowBeam() {
  const target = nearestPveEnemy();
  if (!target) return;
  const player = pveGame.player;
  const angle = Math.atan2(target.y - player.y, target.x - player.x);
  pveGame.beams.push({
    x1: player.x,
    y1: player.y,
    x2: player.x + Math.cos(angle) * 760,
    y2: player.y + Math.sin(angle) * 760,
    life: 36,
    delay: 18,
    hit: false,
    color: player.accent
  });
}

function launchPveGodWeapon(power) {
  const target = nearestPveEnemy();
  if (!target) return;
  const player = pveGame.player;
  const angle = Math.atan2(target.y - player.y, target.x - player.x);
  pveGame.weapons.push({
    target,
    x: player.x,
    y: player.y,
    vx: Math.cos(angle) * 13,
    vy: Math.sin(angle) * 13,
    damage: power,
    returning: false,
    hit: false,
    life: 150,
    color: player.accent
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
  if (player.stunTime > 0 || player.silenceTime > 0) return;
  if (type === "normal" && (player.kind === "vampire" || player.kind === "brawler")) return;
  if (type === "ultimate" && (player.kind === "wild" || player.kind === "brawler")) return;
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
      throwPveDrawCard();
      player.skillTimer = 600;
    } else if (player.kind === "stealth" && player.stealthTime > 0 && target) {
      const targetSpeed = Math.hypot(target.vx, target.vy);
      const distance = Math.hypot(target.x - player.x, target.y - player.y) || 1;
      const nx = targetSpeed > 0.2 ? target.vx / targetSpeed : (target.x - player.x) / distance;
      const ny = targetSpeed > 0.2 ? target.vy / targetSpeed : (target.y - player.y) / distance;
      player.x = target.x - nx * (target.radius + player.radius + 10);
      player.y = target.y - ny * (target.radius + player.radius + 10);
      player.vx = nx * 13;
      player.vy = ny * 13;
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
        const speed = Math.hypot(target.vx, target.vy) || target.baseSpeed || 5;
        target.vx = Math.cos(angle) * speed;
        target.vy = Math.sin(angle) * speed;
        target.silenceTime = 120;
      }
      player.skillTimer = 720;
      addPveFloating("도발!", player.accent);
    } else if (player.kind === "beamer") {
      firePveSlowBeam();
      player.stunTime = Math.max(player.stunTime, 18);
      player.skillTimer = 720;
      addPveFloating("슬로우 빔!", player.accent);
    } else if (player.kind === "wild") {
      player.chaseTime = 300;
      player.skillTimer = 1080;
      addPveFloating("추격!", player.accent);
    }
  } else {
    if (player.kind === "thrower") {
      firePvePlayerShot({ damage: 5, life: 1260, radius: 14, star: true, speed: 11.6, angleOffset: -0.18 });
      firePvePlayerShot({ damage: 5, life: 1260, radius: 14, star: true, speed: 11.6, angleOffset: 0.18 });
      player.ultimateTimer = 1800;
      addPveFloating("스타 스트라이크!", player.accent);
    } else if (player.kind === "charger") {
      const speed = Math.hypot(player.vx, player.vy) || 1;
      player.unstoppableDirectionX = player.vx / speed;
      player.unstoppableDirectionY = player.vy / speed;
      player.vx = 0;
      player.vy = 0;
      player.unstoppableWindup = 24;
      player.unstoppableTime = 0;
      player.unstoppableHits = [];
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
      player.shotTimer = Math.min(player.shotTimer, 60);
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
  const disabledByStatus = player.stunTime > 0 || player.silenceTime > 0;
  ui.pveNormalSkillButton.disabled = disabledByStatus || passiveNormal || normalCooldown > 0 || (player.kind === "stealth" && player.stealthTime <= 0);
  ui.pveUltimateSkillButton.disabled = disabledByStatus || passiveUltimate || ultimateCooldown > 0;
}

function firePveEnemyShot(enemy, angleOverride = null, options = {}) {
  const angle = angleOverride ?? Math.atan2(pveGame.player.y - enemy.y, pveGame.player.x - enemy.x);
  pveGame.projectiles.push({
    owner: "enemy",
    x: enemy.x,
    y: enemy.y,
    vx: Math.cos(angle) * (options.speed || 8),
    vy: Math.sin(angle) * (options.speed || 8),
    radius: options.radius || 9,
    damage: options.damage || 5,
    life: options.life || 220,
    color: options.color || "#ef476f",
    blood: false,
    hitCooldown: 0
  });
}

function createPveEnemyArea(x, y, radius, damageAmount, delay = 60, color = "#ff304f") {
  pveGame.enemyAreas.push({
    x: clamp(x, radius, pveCanvas.width - radius),
    y: clamp(y, radius, pveCanvas.height - radius),
    radius,
    damage: damageAmount,
    delay,
    life: delay + 26,
    hit: false,
    color
  });
}

function triggerPveBossPattern(enemy) {
  const enraged = enemy.hp <= enemy.maxHp * 0.5;
  const pattern = enemy.patternStep % 3;
  if (pattern === 0) {
    const count = enraged ? 16 : 12;
    for (let index = 0; index < count; index += 1) {
      firePveEnemyShot(enemy, index / count * Math.PI * 2, {
        speed: enraged ? 7.2 : 6.2,
        damage: 8,
        radius: 8,
        life: 260,
        color: "#ff416c"
      });
    }
    addPveFloating("균열 탄막", "#ff8aad");
  } else if (pattern === 1) {
    const player = pveGame.player;
    createPveEnemyArea(player.x, player.y, 72, 18, 62, "#ff304f");
    createPveEnemyArea(player.x + 115, player.y - 70, 62, 14, 78, "#ff6b6b");
    createPveEnemyArea(player.x - 115, player.y + 70, 62, 14, 78, "#ff6b6b");
    if (enraged) createPveEnemyArea(player.x, player.y + 135, 58, 14, 88, "#ff6b6b");
    addPveFloating("추적 붕괴", "#ff8aad");
  } else {
    const angle = Math.atan2(pveGame.player.y - enemy.y, pveGame.player.x - enemy.x);
    enemy.vx = Math.cos(angle) * (enraged ? 15 : 12);
    enemy.vy = Math.sin(angle) * (enraged ? 15 : 12);
    enemy.dashTime = enraged ? 85 : 65;
    addPveFloating("광폭 돌진", "#ff8aad");
  }
  enemy.patternStep += 1;
  enemy.patternTimer = enraged ? 145 : 190;
}

function stepPve() {
  if (!pveGame || pveGame.over) return;
  pveGame.tick += 1;
  const player = pveGame.player;
  const playerStunned = player.stunTime > 0;
  if (player.stunTime > 0) player.stunTime -= 1;
  if (player.silenceTime > 0) player.silenceTime -= 1;
  if (player.slowTime > 0) player.slowTime -= 1;
  if (player.hasteTime > 0) player.hasteTime -= 1;
  if (player.skillTimer > 0) player.skillTimer -= 1;
  if (player.ultimateTimer > 0) player.ultimateTimer -= 1;
  if (player.rageTime > 0) player.rageTime -= 1;
  if (player.unstoppableWindup > 0) {
    player.unstoppableWindup -= 1;
    player.vx = 0;
    player.vy = 0;
    if (player.unstoppableWindup <= 0) {
      player.vx = player.unstoppableDirectionX * 6.8;
      player.vy = player.unstoppableDirectionY * 6.8;
      player.unstoppableTime = 55;
      addPveFloating("불가항력!", player.accent);
    }
  } else if (player.unstoppableTime > 0) {
    player.unstoppableTime -= 1;
  }
  if (player.bloodPreludeTime > 0) player.bloodPreludeTime -= 1;
  if (player.chaseTime > 0) player.chaseTime -= 1;
  if (player.pokerReveal > 0) player.pokerReveal -= 1;
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
      player.hyperStealthActive = player.hyperStealthNext;
      player.hyperStealthNext = false;
      player.stealthTime = player.hyperStealthActive ? 240 : 180;
      player.stealthTimer = 420;
      addPveFloating(player.hyperStealthActive ? "하이퍼 은신!" : "은신", player.accent);
    }
    if (player.stealthTime <= 0) player.hyperStealthActive = false;
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
        launchPveGodWeapon(weapon.power);
        weapon.timer = 300;
      }
    });
  }
  if (player.kind === "beamer" && player.annihilatorTime > 0) player.annihilatorTime -= 1;

  const closest = nearestPveEnemy();
  if (player.chaseTime > 0 && closest) {
    const angle = Math.atan2(closest.y - player.y, closest.x - player.x);
    player.vx = Math.cos(angle) * Math.max(characterBaseSpeed(player) * 3, Math.hypot(player.vx, player.vy));
    player.vy = Math.sin(angle) * Math.max(characterBaseSpeed(player) * 3, Math.hypot(player.vx, player.vy));
  }
  const speedMultiplier = (player.rageTime > 0 ? 1.55 : 1)
    * (player.hasteTime > 0 ? 1.35 : 1)
    * (player.slowTime > 0 ? 0.58 : 1)
    * (player.kind === "wild" && closest && closest.hp <= closest.maxHp * 0.5 ? 3.5 : 1)
    * (player.bloodPreludeTime > 0 ? 2 : 1)
    * (player.unstoppableTime > 0 ? 3.525 : 1)
    * (player.chaseTime > 0 ? 3 : 1)
    * (player.kind === "brawler" ? 1 + player.idleAttackTime / 60 * 0.06 : 1);
  const targetSpeed = characterBaseSpeed(player) * speedMultiplier;
  const currentSpeed = Math.hypot(player.vx, player.vy);
  if (currentSpeed > 0) {
    player.vx = player.vx / currentSpeed * targetSpeed;
    player.vy = player.vy / currentSpeed * targetSpeed;
  } else {
    const velocity = pveVelocity(targetSpeed);
    player.vx = velocity.vx;
    player.vy = velocity.vy;
  }
  if (!playerStunned && player.shieldTime <= 0 && player.unstoppableWindup <= 0) {
    player.x += player.vx;
    player.y += player.vy;
  } else if (playerStunned) {
    player.vx *= 0.82;
    player.vy *= 0.82;
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
      dealPvePokerAttack();
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
    if (enemy.type === "dasher") {
      if (enemy.dashTime > 0) {
        enemy.dashTime -= 1;
      } else {
        enemy.dashTimer -= 1;
        if (enemy.dashTimer <= 0) {
          const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
          enemy.vx = Math.cos(angle) * 12;
          enemy.vy = Math.sin(angle) * 12;
          enemy.dashTime = 42;
          enemy.dashTimer = 180;
        } else {
          const speed = Math.hypot(enemy.vx, enemy.vy) || 1;
          enemy.vx = enemy.vx / speed * enemy.baseSpeed;
          enemy.vy = enemy.vy / speed * enemy.baseSpeed;
        }
      }
    }
    if (enemy.type === "bomber" && enemy.silenceTime <= 0) {
      enemy.bombTimer -= 1;
      if (enemy.bombTimer <= 0) {
        createPveEnemyArea(player.x, player.y, 58, 12, 72, "#d85cff");
        enemy.bombTimer = 240;
      }
    }
    if (enemy.type === "boss" && enemy.silenceTime <= 0) {
      if (enemy.dashTime > 0) {
        enemy.dashTime -= 1;
      } else {
        const speed = Math.hypot(enemy.vx, enemy.vy) || 1;
        enemy.vx = enemy.vx / speed * enemy.baseSpeed;
        enemy.vy = enemy.vy / speed * enemy.baseSpeed;
      }
      enemy.patternTimer -= 1;
      if (enemy.patternTimer <= 0) triggerPveBossPattern(enemy);
    }
    if (enemy.dashTime <= 0) {
      const speed = Math.hypot(enemy.vx, enemy.vy) || 1;
      const targetSpeed = enemy.baseSpeed * (enemy.slowTime > 0 ? 0.58 : 1);
      enemy.vx = enemy.vx / speed * targetSpeed;
      enemy.vy = enemy.vy / speed * targetSpeed;
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
    if (player.unstoppableTime > 0
      && !player.unstoppableHits.includes(enemy.id)
      && distance < player.radius + enemy.radius + 52) {
      damagePveEnemy(enemy, 40);
      player.unstoppableHits.push(enemy.id);
    }
    if (distance < player.radius + enemy.radius) {
      if (player.stealthTime > 0) {
        if (enemy.contactCooldown <= 0) {
          damagePveEnemy(enemy, player.hyperStealthActive ? 10 : 15);
          enemy.contactCooldown = 24;
        }
        return;
      }
      const nx = dx / (distance || 1);
      const ny = dy / (distance || 1);
      const overlap = player.radius + enemy.radius - distance;
      player.x += nx * overlap * 0.5;
      player.y += ny * overlap * 0.5;
      enemy.x -= nx * overlap * 0.5;
      enemy.y -= ny * overlap * 0.5;
      const playerNormalSpeed = player.vx * nx + player.vy * ny;
      const enemyNormalSpeed = enemy.vx * nx + enemy.vy * ny;
      player.vx += (enemyNormalSpeed - playerNormalSpeed) * nx;
      player.vy += (enemyNormalSpeed - playerNormalSpeed) * ny;
      enemy.vx += (playerNormalSpeed - enemyNormalSpeed) * nx;
      enemy.vy += (playerNormalSpeed - enemyNormalSpeed) * ny;
      if (enemy.contactCooldown <= 0) {
        damagePvePlayer(enemy.contactDamage);
        const contactDamage = player.kind === "charger" ? 10
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
        if (projectile.blood || (pveGame.player.kind === "thrower" && !projectile.star)) return false;
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
  pveGame.pokerShots = pveGame.pokerShots.filter(card => {
    card.delay -= 1;
    if (card.delay > 0) return true;
    if (!card.launched) {
      const target = card.target?.hp > 0 ? card.target : nearestPveEnemy();
      if (!target) return false;
      card.target = target;
      const angle = Math.atan2(target.y - player.y, target.x - player.x) + card.spread;
      card.x = player.x + Math.cos(angle) * (player.radius + 18);
      card.y = player.y + Math.sin(angle) * (player.radius + 18);
      card.vx = Math.cos(angle) * (card.effect ? 16.5 : 15.8);
      card.vy = Math.sin(angle) * (card.effect ? 16.5 : 15.8);
      card.launched = true;
    }
    card.life -= 1;
    card.x += card.vx;
    card.y += card.vy;
    const enemy = pveGame.enemies.find(item => item.hp > 0
      && Math.hypot(item.x - card.x, item.y - card.y) < item.radius + card.radius);
    if (enemy) {
      if (card.effect === "K") {
        player.pokerBoostMultiplier = 2;
        addPveFloating("킹 x2 준비", player.accent);
      } else {
        damagePveEnemy(enemy, card.damage);
        if (card.effect === "A") enemy.slowTime = Math.max(enemy.slowTime, 180);
        if (card.effect === "Q") player.hasteTime = Math.max(player.hasteTime, 180);
      }
      return false;
    }
    return card.life > 0
      && card.x > -40 && card.x < pveCanvas.width + 40
      && card.y > -40 && card.y < pveCanvas.height + 40;
  });
  pveGame.beams = pveGame.beams.filter(beam => {
    beam.delay -= 1;
    beam.life -= 1;
    if (beam.delay <= 0 && !beam.hit) {
      beam.hit = true;
      const lineDx = beam.x2 - beam.x1;
      const lineDy = beam.y2 - beam.y1;
      const lengthSquared = lineDx * lineDx + lineDy * lineDy || 1;
      pveGame.enemies.forEach(enemy => {
        if (enemy.hp <= 0) return;
        const t = clamp(((enemy.x - beam.x1) * lineDx + (enemy.y - beam.y1) * lineDy) / lengthSquared, 0, 1);
        const closestX = beam.x1 + lineDx * t;
        const closestY = beam.y1 + lineDy * t;
        if (Math.hypot(enemy.x - closestX, enemy.y - closestY) < enemy.radius + 42) {
          damagePveEnemy(enemy, 5);
          enemy.slowTime = Math.max(enemy.slowTime, 180);
        }
      });
    }
    return beam.life > 0;
  });
  pveGame.weapons = pveGame.weapons.filter(weapon => {
    weapon.life -= 1;
    if (!weapon.returning && (!weapon.target || weapon.target.hp <= 0)) {
      weapon.target = nearestPveEnemy();
      if (!weapon.target) weapon.returning = true;
    }
    const destination = weapon.returning ? player : weapon.target;
    const angle = Math.atan2(destination.y - weapon.y, destination.x - weapon.x);
    weapon.vx = Math.cos(angle) * 13;
    weapon.vy = Math.sin(angle) * 13;
    weapon.x += weapon.vx;
    weapon.y += weapon.vy;
    if (!weapon.returning
      && Math.hypot(weapon.target.x - weapon.x, weapon.target.y - weapon.y) < weapon.target.radius + 18) {
      if (!weapon.hit) damagePveEnemy(weapon.target, weapon.damage);
      weapon.hit = true;
      weapon.returning = true;
    }
    if (weapon.returning && Math.hypot(player.x - weapon.x, player.y - weapon.y) < player.radius + 14) {
      return false;
    }
    return weapon.life > 0;
  });
  pveGame.grapples = pveGame.grapples.filter(grapple => {
    grapple.length += grapple.speed;
    grapple.life -= 1;
    const endX = player.x + Math.cos(grapple.angle) * grapple.length;
    const endY = player.y + Math.sin(grapple.angle) * grapple.length;
    const enemy = pveGame.enemies.find(item => item.hp > 0
      && Math.hypot(item.x - endX, item.y - endY) < item.radius + 14);
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
  pveGame.enemyAreas = pveGame.enemyAreas.filter(attack => {
    attack.delay -= 1;
    attack.life -= 1;
    if (attack.delay <= 0 && !attack.hit) {
      attack.hit = true;
      if (Math.hypot(player.x - attack.x, player.y - attack.y) < player.radius + attack.radius) {
        damagePvePlayer(attack.damage);
      }
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
  if (player.rageTime > 0 || player.unstoppableTime > 0 || player.unstoppableWindup > 0 || player.hyperStealthActive) {
    pveCtx.save();
    const auraRadius = player.radius + (player.unstoppableTime > 0 ? 60 : 22);
    pveCtx.globalAlpha = player.unstoppableTime > 0 ? 0.75 : 0.38;
    pveCtx.strokeStyle = player.unstoppableTime > 0 ? "#ef476f" : player.hyperStealthActive ? "#8d7cff" : player.color;
    pveCtx.fillStyle = player.unstoppableTime > 0 ? "rgba(239,71,111,.18)" : "rgba(239,71,111,.1)";
    pveCtx.shadowColor = pveCtx.strokeStyle;
    pveCtx.shadowBlur = player.unstoppableTime > 0 ? 34 : 20;
    pveCtx.lineWidth = player.unstoppableTime > 0 ? 7 : 4;
    pveCtx.beginPath();
    pveCtx.arc(player.x, player.y, auraRadius + Math.sin(pveGame.tick * 0.28) * 5, 0, Math.PI * 2);
    pveCtx.fill();
    pveCtx.stroke();
    pveCtx.restore();
  }
  pveCtx.beginPath();
  pveCtx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  pveCtx.globalAlpha = player.stealthTime > 0 ? 0.36 : 1;
  pveCtx.fillStyle = player.hitFlash > 0 ? "#ffffff" : player.rageTime > 0 ? "#ff174f" : player.color;
  pveCtx.fill();
  pveCtx.beginPath();
  pveCtx.arc(player.x + 7, player.y - 7, 6, 0, Math.PI * 2);
  pveCtx.fillStyle = "#101319";
  pveCtx.fill();
  pveCtx.globalAlpha = 1;
  pveCtx.textAlign = "center";
  pveCtx.font = "800 13px Segoe UI";
  pveCtx.fillStyle = "#f7f4eb";
  pveCtx.fillText(currentUser?.name || "PLAYER", player.x, player.y - player.radius - 14);
  pveCtx.fillStyle = "#101319";
  pveCtx.fillRect(player.x - 34, player.y + player.radius + 10, 68, 7);
  pveCtx.fillStyle = player.accent;
  pveCtx.fillRect(player.x - 34, player.y + player.radius + 10, 68 * player.hp / player.maxHp, 7);
  if (player.shieldTime > 0) {
    pveCtx.save();
    pveCtx.strokeStyle = "#d5dde8";
    pveCtx.fillStyle = "rgba(213,221,232,.18)";
    pveCtx.lineWidth = 7;
    pveCtx.beginPath();
    pveCtx.arc(player.x, player.y, player.radius + 34, 0, Math.PI * 2);
    pveCtx.fill();
    pveCtx.stroke();
    pveCtx.restore();
  }
  player.godWeapons.forEach((weapon, index) => {
    const angle = pveGame.tick * 0.055 + (Math.PI * 2 * index) / player.godWeapons.length;
    const orbit = player.radius + 12 + Math.floor(index / 6) * 16;
    pveCtx.save();
    pveCtx.translate(player.x, player.y);
    pveCtx.rotate(angle);
    pveCtx.fillStyle = player.accent;
    pveCtx.fillRect(orbit, -5, 34, 10);
    pveCtx.fillStyle = "#101319";
    pveCtx.font = "900 9px Segoe UI";
    pveCtx.fillText(Math.floor(weapon.power), orbit + 17, 3);
    pveCtx.restore();
  });
  if (player.kind === "enhancer") {
    pveCtx.fillStyle = player.accent;
    pveCtx.font = "900 12px Segoe UI";
    pveCtx.fillText(`공격력 ${Math.floor(player.attackPower)}`, player.x, player.y + player.radius + 34);
  }
  if (player.canPoker && player.pokerHand.length) {
    const startX = player.x - 47;
    const cardY = player.y + player.radius + 28;
    player.pokerHand.forEach((rank, index) => {
      const revealed = player.pokerReveal < 90 - index * 12;
      const cardX = startX + index * 19;
      pveCtx.fillStyle = revealed ? "#f7f4eb" : "#252a34";
      pveCtx.fillRect(cardX, cardY, 16, 22);
      pveCtx.strokeStyle = revealed ? player.accent : "#3b4352";
      pveCtx.strokeRect(cardX, cardY, 16, 22);
      pveCtx.fillStyle = revealed ? "#101319" : "#aeb6c6";
      pveCtx.font = "900 8px Segoe UI";
      pveCtx.fillText(revealed ? rank : "?", cardX + 8, cardY + 11);
    });
  }
  pveGame.enemies.forEach(enemy => {
    if (enemy.type === "boss") {
      pveCtx.save();
      pveCtx.strokeStyle = "rgba(255,48,99,.72)";
      pveCtx.shadowColor = "#ff3063";
      pveCtx.shadowBlur = 24;
      pveCtx.lineWidth = 5;
      pveCtx.beginPath();
      pveCtx.arc(enemy.x, enemy.y, enemy.radius + 14 + Math.sin(pveGame.tick * 0.12) * 4, 0, Math.PI * 2);
      pveCtx.stroke();
      pveCtx.restore();
    }
    pveCtx.beginPath();
    pveCtx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    pveCtx.fillStyle = enemy.color;
    pveCtx.fill();
    if (enemy.type === "boss" || enemy.type === "miniboss") {
      pveCtx.fillStyle = "#f7f4eb";
      pveCtx.font = "900 12px Segoe UI";
      pveCtx.textAlign = "center";
      pveCtx.fillText(enemy.type === "boss" ? "BOSS" : "MINI BOSS", enemy.x, enemy.y - enemy.radius - 14);
    }
    const barWidth = enemy.type === "boss" ? 110 : enemy.type === "miniboss" ? 86 : 56;
    pveCtx.fillStyle = "#101319";
    pveCtx.fillRect(enemy.x - barWidth / 2, enemy.y + enemy.radius + 8, barWidth, 7);
    pveCtx.fillStyle = "#ef476f";
    pveCtx.fillRect(enemy.x - barWidth / 2, enemy.y + enemy.radius + 8, barWidth * enemy.hp / enemy.maxHp, 7);
  });
  pveGame.grapples.forEach(grapple => {
    const endX = player.x + Math.cos(grapple.angle) * grapple.length;
    const endY = player.y + Math.sin(grapple.angle) * grapple.length;
    pveCtx.save();
    pveCtx.strokeStyle = player.accent;
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
      drawPrismaticBeam(
        pveCtx,
        attack.x,
        0,
        attack.x,
        attack.type === "annihilator" ? attack.y : pveCanvas.height,
        attack.type === "annihilator" ? 26 : 38,
        attack.type === "annihilator" ? "#ff304f" : "#7de7ff",
        pveGame.tick,
        pveCtx.globalAlpha
      );
    }
    pveCtx.restore();
  });
  pveGame.beams.forEach(beam => {
    const alpha = beam.delay > 0 ? 0.35 : Math.min(1, beam.life / 24);
    if (beam.delay > 0) {
      pveCtx.save();
      pveCtx.globalAlpha = alpha;
      pveCtx.strokeStyle = beam.color;
      pveCtx.shadowColor = beam.color;
      pveCtx.shadowBlur = 12;
      pveCtx.lineWidth = 6;
      pveCtx.setLineDash([12, 10]);
      pveCtx.beginPath();
      pveCtx.moveTo(beam.x1, beam.y1);
      pveCtx.lineTo(beam.x2, beam.y2);
      pveCtx.stroke();
      pveCtx.restore();
    } else {
      drawPrismaticBeam(pveCtx, beam.x1, beam.y1, beam.x2, beam.y2, 34, beam.color, pveGame.tick, alpha);
    }
  });
  pveGame.weapons.forEach(weapon => {
    pveCtx.save();
    pveCtx.translate(weapon.x, weapon.y);
    pveCtx.rotate(Math.atan2(weapon.vy, weapon.vx));
    pveCtx.shadowColor = weapon.color;
    pveCtx.shadowBlur = 18;
    pveCtx.fillStyle = weapon.color;
    pveCtx.fillRect(-20, -5, 40, 10);
    pveCtx.fillStyle = "#f7f4eb";
    pveCtx.fillRect(8, -9, 10, 18);
    pveCtx.restore();
  });
  pveGame.enemyAreas.forEach(attack => {
    const warning = attack.delay > 0;
    pveCtx.save();
    pveCtx.globalAlpha = warning ? 0.34 + Math.sin(pveGame.tick * 0.3) * 0.12 : Math.min(1, attack.life / 20);
    pveCtx.strokeStyle = attack.color;
    pveCtx.fillStyle = `${attack.color}28`;
    pveCtx.shadowColor = attack.color;
    pveCtx.shadowBlur = warning ? 8 : 24;
    pveCtx.lineWidth = warning ? 3 : 9;
    pveCtx.setLineDash(warning ? [9, 7] : []);
    pveCtx.beginPath();
    pveCtx.arc(attack.x, attack.y, attack.radius, 0, Math.PI * 2);
    pveCtx.fill();
    pveCtx.stroke();
    pveCtx.restore();
  });
  pveGame.projectiles.forEach(projectile => {
    if (projectile.star) {
      pveCtx.save();
      pveCtx.translate(projectile.x, projectile.y);
      pveCtx.rotate(Math.atan2(projectile.vy, projectile.vx));
      pveCtx.fillStyle = projectile.color;
      pveCtx.beginPath();
      for (let index = 0; index < 10; index += 1) {
        const radius = index % 2 === 0 ? projectile.radius + 5 : projectile.radius * 0.48;
        const angle = -Math.PI / 2 + index * Math.PI / 5;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (index === 0) pveCtx.moveTo(x, y);
        else pveCtx.lineTo(x, y);
      }
      pveCtx.closePath();
      pveCtx.fill();
      pveCtx.restore();
      return;
    }
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
  pveGame.pokerShots.forEach(card => {
    if (card.delay > 0 || !card.launched) return;
    pveCtx.save();
    pveCtx.translate(card.x, card.y);
    pveCtx.rotate(Math.atan2(card.vy, card.vx));
    pveCtx.fillStyle = "#f7f4eb";
    pveCtx.fillRect(-12, -8, 24, 16);
    pveCtx.strokeStyle = "#ef476f";
    pveCtx.strokeRect(-12, -8, 24, 16);
    pveCtx.fillStyle = "#101319";
    pveCtx.font = "900 10px Segoe UI";
    pveCtx.fillText(card.rank, 0, 0);
    pveCtx.restore();
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

function survivalWeaponStats(id) {
  const entry = pveGame.weapons[id];
  const definition = SURVIVAL_WEAPONS[id];
  const stars = entry.stars;
  return {
    damageScale: (1 + (stars - 1) * 0.3) * pveGame.player.damageMultiplier * (entry.awakened ? 1.85 : 1),
    cooldown: Math.max(15, definition.baseCooldown * (1 - (stars - 1) * 0.085)
      * pveGame.player.cooldownMultiplier * (entry.awakened ? 0.58 : 1)),
    sizeScale: 1 + (stars - 1) * 0.075 + (entry.awakened ? 0.45 : 0)
  };
}

function spawnSurvivalProjectile(options) {
  pveGame.projectiles.push({
    owner: "survival",
    x: options.x ?? pveGame.player.x,
    y: options.y ?? pveGame.player.y,
    vx: options.vx,
    vy: options.vy,
    radius: options.radius || 8,
    damage: options.damage,
    life: options.life || 180,
    color: options.color || "#67e8f9",
    pierce: options.pierce || 0,
    bounce: Boolean(options.bounce),
    homing: Boolean(options.homing),
    slow: Boolean(options.slow),
    visual: options.visual || "orb",
    label: options.label || "",
    trail: options.trail || "",
    explosionRadius: options.explosionRadius || 0,
    explosionDamage: options.explosionDamage || 0,
    pullStrength: options.pullStrength || 0,
    cardEffect: options.cardEffect || "",
    sourceWeaponId: options.sourceWeaponId || pveGame.activeWeaponId || "",
    repeatHits: Boolean(options.repeatHits),
    hitIds: new Set(),
    hitCooldown: 0
  });
}

function fireSurvivalWeapon(id) {
  const target = nearestPveEnemy();
  if (!target) return;
  const projectileStart = pveGame.projectiles.length;
  const areaAttackStart = pveGame.areaAttacks.length;
  pveGame.activeWeaponId = id;
  const player = pveGame.player;
  const entry = pveGame.weapons[id];
  const stats = survivalWeaponStats(id);
  const angle = Math.atan2(target.y - player.y, target.x - player.x);
  const itemOwned = Boolean(pveGame.items[SURVIVAL_WEAPONS[id].item]);
  const projectile = (spread, speed, damage, radius, extra = {}) => {
    const shotAngle = angle + spread;
    spawnSurvivalProjectile({
      x: player.x + Math.cos(shotAngle) * (player.radius + radius + 5),
      y: player.y + Math.sin(shotAngle) * (player.radius + radius + 5),
      vx: Math.cos(shotAngle) * speed,
      vy: Math.sin(shotAngle) * speed,
      damage: damage * stats.damageScale,
      radius: radius * stats.sizeScale,
      ...extra
    });
  };

  if (id === "pulse") {
    const count = entry.awakened ? 4 : entry.stars >= 4 ? 2 : 1;
    for (let index = 0; index < count; index += 1) {
      projectile((index - (count - 1) / 2) * 0.1, 19, 12, 10, {
        color: "#67e8f9",
        homing: itemOwned,
        pierce: entry.awakened ? 2 : 0,
        life: 150,
        visual: "pulse",
        trail: "#67e8f9",
        explosionRadius: entry.awakened ? 52 : 0,
        explosionDamage: entry.awakened ? 6 * stats.damageScale : 0
      });
    }
  } else if (id === "star") {
    const count = entry.awakened ? 5 : 2;
    for (let index = 0; index < count; index += 1) {
      projectile((index - (count - 1) / 2) * 0.15, 11.8, 12, 14, {
        color: "#fde68a",
        homing: itemOwned,
        pierce: entry.awakened ? 8 : 2,
        life: entry.awakened ? 720 : 480,
        visual: "star",
        trail: "#fde68a",
        bounce: entry.awakened,
        repeatHits: entry.awakened
      });
    }
  } else if (id === "ram") {
    const count = entry.awakened ? 3 : 1;
    for (let index = 0; index < count; index += 1) {
      projectile((index - (count - 1) / 2) * 0.16, 15.5, 15, itemOwned ? 23 : 18, {
        color: "#fb7185",
        pierce: entry.awakened ? 8 : 2,
        life: 68,
        visual: "ram",
        trail: "#fb7185",
        explosionRadius: entry.awakened ? 64 : 0,
        explosionDamage: entry.awakened ? 8 * stats.damageScale : 0
      });
    }
  } else if (id === "charge") {
    const count = entry.awakened ? 3 : 1;
    for (let index = 0; index < count; index += 1) {
      projectile((index - (count - 1) / 2) * 0.11, 17.5, 22, itemOwned ? 33 : 24, {
        color: "#fb7185",
        pierce: entry.awakened ? 99 : 5,
        life: entry.awakened ? 110 : 80,
        visual: "ram",
        trail: "#ff304f"
      });
    }
  } else if (id === "grapple") {
    projectile(0, 20, 18, itemOwned ? 16 : 12, {
      color: "#c4b5fd",
      pierce: entry.awakened ? 99 : 7,
      life: 95,
      visual: "lance",
      trail: "#c4b5fd",
      pullStrength: entry.awakened ? 34 : 0
    });
  } else if (id === "grapplePlus") {
    const count = entry.awakened ? 3 : 1;
    for (let index = 0; index < count; index += 1) {
      projectile((index - (count - 1) / 2) * 0.12, 22, 22, itemOwned ? 22 : 17, {
        color: "#ddd6fe",
        pierce: entry.awakened ? 99 : 12,
        life: 115,
        visual: "lance",
        trail: "#ddd6fe",
        pullStrength: entry.awakened ? 42 : 12
      });
    }
  } else if (id === "poker") {
    const count = entry.awakened ? 9 : 5;
    const ranks = ["JOKER", "A", "K", "Q", "J"];
    for (let index = 0; index < count; index += 1) {
      const rank = ranks[pveRandomIndex(ranks.length)];
      const critical = itemOwned && pveRandomIndex(100) < 22;
      projectile((index - (count - 1) / 2) * 0.1, 15.8, 4.5 * (critical ? 1.75 : 1), 10, {
        color: critical ? "#fbbf24" : "#fda4af",
        pierce: entry.awakened ? 1 : 0,
        life: 130,
        visual: "card",
        label: rank,
        cardEffect: rank,
        trail: critical ? "#fbbf24" : "#fda4af"
      });
    }
  } else if (id === "draw") {
    const ranks = ["JOKER", "A", "K", "Q", "J"];
    const rank = ranks[pveRandomIndex(ranks.length)];
    const critical = itemOwned && pveRandomIndex(100) < 28;
    const count = entry.awakened ? 3 : 1;
    for (let index = 0; index < count; index += 1) {
      projectile((index - (count - 1) / 2) * 0.12, 17.2, 12 * (critical ? 1.75 : 1), 10, {
        color: critical ? "#fbbf24" : "#fb7185",
        homing: entry.awakened,
        pierce: entry.awakened ? 5 : 0,
        life: 150,
        visual: "card",
        label: rank,
        cardEffect: rank,
        trail: critical ? "#fbbf24" : "#fb7185"
      });
    }
  } else if (id === "shadow") {
    const radius = 90 * stats.sizeScale;
    pveGame.areaAttacks.push({
      x: target.x, y: target.y, radius, damage: 24 * stats.damageScale,
      delay: 8, life: 30, hit: false, color: "#60a5fa", type: "slash",
      stun: 0, survival: true
    });
    if (itemOwned) player.invulnerableTime = Math.max(player.invulnerableTime, 24);
    if (entry.awakened) {
      pveGame.areaAttacks.push({
        x: player.x, y: player.y, radius: 130, damage: 20 * stats.damageScale,
        delay: 18, life: 42, hit: false, color: "#8b5cf6", type: "slash",
        stun: 0, survival: true
      });
    }
  } else if (id === "temper") {
    const elapsedPower = entry.awakened ? 9 + pveGame.tick / 720 : Math.min(28, 7 + pveGame.tick / 900);
    projectile(0, 12.5, elapsedPower, 16, {
      color: "#fdba74",
      pierce: entry.awakened ? 10 : 2,
      life: 135,
      explosionRadius: entry.awakened ? 80 : 0,
      explosionDamage: entry.awakened ? elapsedPower * 0.45 * stats.damageScale : 0
    });
  } else if (id === "forge") {
    const count = (itemOwned ? 2 : 1) + (entry.awakened ? 3 : 0);
    for (let index = 0; index < count; index += 1) {
      projectile((index - (count - 1) / 2) * 0.16, 13.5, itemOwned ? 9 : 14, 10, {
        color: "#fbbf24",
        homing: true,
        pierce: entry.awakened ? 3 : 1,
        life: 220,
        visual: "blade",
        trail: "#fbbf24"
      });
    }
  } else if (id === "shock") {
    pveGame.areaAttacks.push({
      x: player.x, y: player.y,
      radius: (entry.awakened ? 240 : 145) * stats.sizeScale,
      damage: 18 * stats.damageScale, delay: 0, life: 34, hit: false,
      color: "#94a3b8", type: "shockwave", stun: itemOwned ? 36 : 0, survival: true
    });
  } else if (id === "taunt") {
    pveGame.areaAttacks.push({
      x: player.x, y: player.y, radius: (entry.awakened ? 520 : 125) * stats.sizeScale,
      damage: 10 * stats.damageScale, delay: 0, life: 28, hit: false,
      color: "#cbd5e1", type: "shockwave", stun: entry.awakened ? 45 : 0,
      slow: true, pull: entry.awakened ? 90 : 0, survival: true
    });
  } else if (id === "shield") {
    player.invulnerableTime = Math.max(player.invulnerableTime, entry.awakened ? 120 : 55);
    pveGame.areaAttacks.push({
      x: player.x, y: player.y, radius: (entry.awakened ? 290 : 205) * stats.sizeScale,
      damage: 34 * stats.damageScale, delay: 28, life: 62, hit: false,
      color: "#e2e8f0", type: "shockwave", stun: itemOwned ? 60 : 30, survival: true
    });
  } else if (id === "beam") {
    const count = entry.awakened ? 3 : itemOwned ? 2 : 1;
    for (let index = 0; index < count; index += 1) {
      pveGame.areaAttacks.push({
        x: target.x + (index - (count - 1) / 2) * 82, y: target.y,
        radius: (entry.awakened ? 100 : 62) * stats.sizeScale,
        damage: (itemOwned ? 20 : 28) * stats.damageScale, delay: 45 + index * 12, life: 72 + index * 12,
        hit: false, color: "#38bdf8", type: "laser", stun: 0, survival: true
      });
    }
  } else if (id === "slowBeam") {
    const count = entry.awakened ? 3 : 1;
    for (let index = 0; index < count; index += 1) {
      const beamAngle = angle + (index - (count - 1) / 2) * 0.12;
      const beamLength = Math.hypot(pveCanvas.width, pveCanvas.height) * 1.15;
      pveGame.areaAttacks.push({
        x: player.x,
        y: player.y,
        x1: player.x,
        y1: player.y,
        x2: player.x + Math.cos(beamAngle) * beamLength,
        y2: player.y + Math.sin(beamAngle) * beamLength,
        radius: (itemOwned ? 28 : 20) * stats.sizeScale,
        damage: 8 * stats.damageScale,
        delay: 12,
        life: 34,
        hit: false,
        color: "#7dd3fc",
        type: "lineLaser",
        slow: true,
        stun: 0,
        survival: true
      });
    }
  } else if (id === "wild") {
    const targets = pveGame.enemies.filter(enemy => enemy.hp > 0);
    const count = entry.awakened ? 7 : 3;
    for (let index = 0; index < count; index += 1) {
      const victim = targets[pveRandomIndex(targets.length)] || target;
      const execute = itemOwned && victim.hp <= victim.maxHp * 0.5 ? 1.35 : 1;
      pveGame.areaAttacks.push({
        x: victim.x + (pveRandomIndex(61) - 30), y: victim.y + (pveRandomIndex(61) - 30),
        radius: 58 * stats.sizeScale, damage: 13 * stats.damageScale * execute,
        delay: 16 + index * 5, life: 42 + index * 5, hit: false,
        color: "#a3e635", type: "slash", stun: 0, survival: true
      });
    }
  } else if (id === "blood") {
    const missing = 1 - player.hp / player.maxHp;
    const count = entry.awakened ? 3 : 1;
    for (let index = 0; index < count; index += 1) {
      projectile((index - (count - 1) / 2) * 0.14, 13 + missing * 8, 10 + missing * 24, entry.awakened ? 16 : 11, {
        color: "#f43f5e",
        homing: true,
        pierce: entry.awakened ? 8 : 3,
        life: 230,
        visual: "blood",
        trail: "#f43f5e"
      });
    }
  } else if (id === "fist") {
    const desperate = itemOwned && player.hp <= player.maxHp * 0.5;
    pveGame.areaAttacks.push({
      x: target.x,
      y: target.y,
      radius: (entry.awakened ? 150 : desperate ? 92 : 78) * stats.sizeScale,
      damage: (entry.awakened ? 24 : desperate ? 14 : 11) * stats.damageScale,
      delay: 0,
      life: 20,
      hit: false,
      color: "#fb923c",
      type: "shockwave",
      stun: 0,
      survival: true
    });
  } else if (id === "clock") {
    const count = entry.awakened ? 4 : 1;
    const beamLength = Math.hypot(pveCanvas.width, pveCanvas.height) * 0.72;
    for (let index = 0; index < count; index += 1) {
      const sweepAngle = angle + index * Math.PI * 2 / count;
      pveGame.areaAttacks.push({
        x: player.x,
        y: player.y,
        x1: player.x,
        y1: player.y,
        x2: player.x + Math.cos(sweepAngle) * beamLength,
        y2: player.y + Math.sin(sweepAngle) * beamLength,
        radius: (itemOwned ? 46 : 34) * stats.sizeScale,
        damage: 15 * stats.damageScale,
        delay: index * 5,
        life: 28 + index * 5,
        hit: false,
        color: "#67e8f9",
        type: "lineLaser",
        slow: true,
        survival: true
      });
    }
    if (itemOwned) healPvePlayer(player.maxHp * 0.012);
  } else if (id === "replay") {
    const count = entry.awakened ? 3 : 1;
    for (let index = 0; index < count; index += 1) {
      pveGame.areaAttacks.push({
        x: player.x,
        y: player.y,
        radius: (entry.awakened ? 220 : 130) * stats.sizeScale,
        damage: 22 * stats.damageScale,
        delay: 12 + index * 15,
        life: 40 + index * 15,
        hit: false,
        color: "#f2c14e",
        type: "shockwave",
        slow: true,
        survival: true
      });
    }
    healPvePlayer(player.maxHp * (entry.awakened ? 0.1 : itemOwned ? 0.045 : 0.025));
    if (entry.awakened) player.invulnerableTime = Math.max(player.invulnerableTime, 75);
  } else if (id === "rift") {
    const count = entry.awakened ? 5 : 2;
    const length = Math.hypot(pveCanvas.width, pveCanvas.height) * 1.2;
    for (let index = 0; index < count; index += 1) {
      const riftAngle = pveRandomIndex(628) / 100;
      const centerX = pveRandomIndex(pveCanvas.width);
      const centerY = pveRandomIndex(pveCanvas.height);
      pveGame.areaAttacks.push({
        x: centerX,
        y: centerY,
        x1: centerX - Math.cos(riftAngle) * length,
        y1: centerY - Math.sin(riftAngle) * length,
        x2: centerX + Math.cos(riftAngle) * length,
        y2: centerY + Math.sin(riftAngle) * length,
        radius: (itemOwned ? 28 : 20) * stats.sizeScale,
        damage: 17 * stats.damageScale,
        delay: 16 + index * 7,
        life: (itemOwned ? 52 : 38) + index * 7,
        hit: false,
        color: "#a78bfa",
        type: "lineLaser",
        pull: itemOwned ? 24 : 0,
        survival: true
      });
    }
  } else if (id === "void") {
    const count = entry.awakened ? 3 : 1;
    for (let index = 0; index < count; index += 1) {
      pveGame.areaAttacks.push({
        x: target.x,
        y: target.y,
        radius: (entry.awakened ? 210 : 125) * stats.sizeScale,
        damage: 24 * stats.damageScale,
        delay: 24 + index * 18,
        life: 54 + index * 18,
        hit: false,
        color: "#22d3ee",
        type: "shockwave",
        pull: itemOwned ? 80 : 38,
        stun: entry.awakened ? 18 : 0,
        survival: true
      });
    }
  } else if (id === "swordDance") {
    const cuts = entry.awakened ? 5 : itemOwned ? 3 : 1;
    for (let index = 0; index < cuts; index += 1) {
      const cutAngle = angle + (index - (cuts - 1) / 2) * 0.38;
      const cutX = entry.awakened
        ? target.x + Math.cos(cutAngle) * (index - 2) * 62
        : target.x;
      const cutY = entry.awakened
        ? target.y + Math.sin(cutAngle) * (index - 2) * 62
        : target.y;
      pveGame.areaAttacks.push({
        x: cutX,
        y: cutY,
        radius: (entry.awakened ? 118 : itemOwned ? 92 : 74) * stats.sizeScale,
        damage: (entry.awakened ? 20 : 13) * stats.damageScale,
        delay: 6 + index * (entry.awakened ? 6 : 9),
        life: 34 + index * 6,
        hit: false,
        color: "#bae6fd",
        type: "slash",
        stun: entry.awakened ? 10 : 0,
        survival: true
      });
      if (entry.awakened) {
        const length = Math.hypot(pveCanvas.width, pveCanvas.height) * 1.2;
        pveGame.areaAttacks.push({
          x: cutX,
          y: cutY,
          x1: cutX - Math.cos(cutAngle) * length,
          y1: cutY - Math.sin(cutAngle) * length,
          x2: cutX + Math.cos(cutAngle) * length,
          y2: cutY + Math.sin(cutAngle) * length,
          radius: 18 * stats.sizeScale,
          damage: 12 * stats.damageScale,
          delay: 10 + index * 6,
          life: 34 + index * 6,
          hit: false,
          color: "#e0f2fe",
          type: "lineLaser",
          survival: true
        });
      }
    }
  } else if (id === "deathSword") {
    const count = entry.awakened ? 3 : 1;
    const length = Math.hypot(pveCanvas.width, pveCanvas.height) * 1.25;
    for (let index = 0; index < count; index += 1) {
      const bladeAngle = angle + (index - (count - 1) / 2) * 0.16;
      pveGame.areaAttacks.push({
        x: player.x,
        y: player.y,
        x1: player.x,
        y1: player.y,
        x2: player.x + Math.cos(bladeAngle) * length,
        y2: player.y + Math.sin(bladeAngle) * length,
        radius: (entry.awakened ? 34 : itemOwned ? 26 : 20) * stats.sizeScale,
        damage: (entry.awakened ? 24 : 15) * stats.damageScale,
        delay: 4 + index * 7,
        life: 34 + index * 7,
        hit: false,
        color: index % 2 ? "#7c2d12" : "#38bdf8",
        type: "lineLaser",
        slow: itemOwned || entry.awakened,
        survival: true
      });
    }
  } else if (id === "artOrbit") {
    const count = entry.awakened ? 4 : itemOwned ? 2 : 1;
    for (let index = 0; index < count; index += 1) {
      const orbitAngle = angle + index * Math.PI * 2 / count + pveRandomIndex(70) / 100;
      spawnSurvivalProjectile({
        x: player.x + Math.cos(orbitAngle) * 34,
        y: player.y + Math.sin(orbitAngle) * 34,
        vx: Math.cos(orbitAngle) * (entry.awakened ? 10.8 : 7.4),
        vy: Math.sin(orbitAngle) * (entry.awakened ? 10.8 : 7.4),
        damage: (entry.awakened ? 12 : 8) * stats.damageScale,
        radius: (entry.awakened ? 16 : 12) * stats.sizeScale,
        life: entry.awakened ? 780 : itemOwned ? 560 : 360,
        color: "#f9a8d4",
        bounce: true,
        pierce: 99,
        repeatHits: true,
        visual: "orb",
        trail: "#f9a8d4"
      });
    }
  } else if (id === "growingFaith") {
    const pulses = entry.awakened ? 5 : itemOwned ? 3 : 1;
    const centerX = pveCanvas.width / 2;
    const centerY = pveCanvas.height / 2;
    for (let index = 0; index < pulses; index += 1) {
      const damage = (entry.awakened ? 14 : 8 + (entry.stars - 1) * 1.5) * stats.damageScale;
      pveGame.areaAttacks.push({
        x: centerX,
        y: centerY,
        x1: centerX,
        y1: 0,
        x2: centerX,
        y2: pveCanvas.height,
        radius: (entry.awakened ? 42 : 28) * stats.sizeScale,
        damage,
        delay: 8 + index * 16,
        life: 38 + index * 16,
        hit: false,
        color: "#facc15",
        type: "lineLaser",
        survival: true
      });
      pveGame.areaAttacks.push({
        x: centerX,
        y: centerY,
        x1: 0,
        y1: centerY,
        x2: pveCanvas.width,
        y2: centerY,
        radius: (entry.awakened ? 42 : 28) * stats.sizeScale,
        damage,
        delay: 8 + index * 16,
        life: 38 + index * 16,
        hit: false,
        color: "#fde68a",
        type: "lineLaser",
        survival: true
      });
    }
    healPvePlayer(player.maxHp * (entry.awakened ? 0.08 : itemOwned ? 0.045 : 0.02));
  } else if (id === "mageLightning") {
    const targets = pveGame.enemies.filter(enemy => !enemy.dead);
    const count = entry.awakened ? 6 : itemOwned ? 3 : 1;
    for (let index = 0; index < count; index += 1) {
      const victim = targets[pveRandomIndex(targets.length)] || target;
      pveGame.areaAttacks.push({
        x: victim.x,
        y: victim.y,
        radius: (entry.awakened ? 82 : 56) * stats.sizeScale,
        damage: (entry.awakened ? 15 : 9) * stats.damageScale,
        delay: 8 + index * 7,
        life: 34 + index * 7,
        hit: false,
        color: "#facc15",
        type: "laser",
        stun: itemOwned || entry.awakened ? 8 : 0,
        survival: true
      });
    }
  } else if (id === "mageFire") {
    const count = entry.awakened ? 3 : 1;
    for (let index = 0; index < count; index += 1) {
      const offsetX = entry.awakened ? (index - 1) * 120 : 0;
      pveGame.areaAttacks.push({
        x: clamp(target.x + offsetX, 70, pveCanvas.width - 70),
        y: target.y,
        radius: (entry.awakened ? 135 : itemOwned ? 104 : 86) * stats.sizeScale,
        damage: (entry.awakened ? 26 : 18) * stats.damageScale,
        delay: 70 + index * 12,
        life: 104 + index * 12,
        hit: false,
        color: "#fb923c",
        type: "shockwave",
        stun: 0,
        survival: true
      });
    }
  } else if (id === "mageSea") {
    const pulses = entry.awakened ? 5 : itemOwned ? 3 : 2;
    for (let index = 0; index < pulses; index += 1) {
      pveGame.areaAttacks.push({
        x: pveCanvas.width / 2,
        y: pveCanvas.height / 2,
        radius: (entry.awakened ? 620 : 430) * stats.sizeScale,
        damage: (entry.awakened ? 11 : 7) * stats.damageScale,
        delay: 12 + index * 18,
        life: 42 + index * 18,
        hit: false,
        color: "#38bdf8",
        type: "shockwave",
        slow: true,
        pull: itemOwned || entry.awakened ? 32 : 0,
        survival: true
      });
    }
  } else if (id === "legion") {
    const count = (itemOwned ? 5 : 3) + (entry.awakened ? 7 : 0);
    for (let index = 0; index < count; index += 1) {
      const edge = index % 4;
      const x = edge === 0 ? 10 : edge === 1 ? pveCanvas.width - 10 : pveRandomIndex(pveCanvas.width);
      const y = edge === 2 ? 10 : edge === 3 ? pveCanvas.height - 10 : pveRandomIndex(pveCanvas.height);
      const shotAngle = Math.atan2(target.y - y, target.x - x);
      spawnSurvivalProjectile({
        x,
        y,
        vx: Math.cos(shotAngle) * (entry.awakened ? 16 : 13),
        vy: Math.sin(shotAngle) * (entry.awakened ? 16 : 13),
        damage: (entry.awakened ? 13 : 8) * stats.damageScale,
        radius: entry.awakened ? 10 : 7,
        life: 220,
        color: index % 2 ? "#facc15" : "#4ade80",
        homing: itemOwned || entry.awakened,
        pierce: entry.awakened ? 3 : 0,
        visual: "lance",
        trail: index % 2 ? "#facc15" : "#4ade80"
      });
    }
  }
  pveGame.projectiles.slice(projectileStart).forEach(projectile => {
    if (projectile.owner !== "enemy") projectile.sourceWeaponId = id;
  });
  pveGame.areaAttacks.slice(areaAttackStart).forEach(attack => {
    attack.sourceWeaponId = id;
  });
  pveGame.activeWeaponId = "";
}

function spawnSurvivalEnemy() {
  const seconds = pveGame.tick / 60;
  const mode = pveGame.difficulty || SURVIVAL_DIFFICULTIES.easy;
  const lateSurge = seconds >= 420 ? 1.25 + Math.min(0.75, (seconds - 420) / 360) : 1;
  const endgameSurge = seconds >= 600 ? 1.85 + Math.min(1.35, (seconds - 600) / 300) : 1;
  const edge = pveRandomIndex(4);
  const margin = 30;
  const x = edge === 0 ? margin : edge === 1 ? pveCanvas.width - margin : 50 + pveRandomIndex(pveCanvas.width - 100);
  const y = edge === 2 ? margin : edge === 3 ? pveCanvas.height - margin : 50 + pveRandomIndex(pveCanvas.height - 100);
  const roll = pveRandomIndex(100);
  const type = seconds >= 600
    ? (roll < 16 ? "voidKnight" : roll < 30 ? "arcSniper" : roll < 43 ? "colossus" : roll < 56 ? "nightmare" : roll < 70 ? "riftReaver" : roll < 82 ? "eclipseSniper" : roll < 92 ? "bloodWraith" : "obsidianTitan")
    : seconds < 90 ? "melee"
    : seconds < 150 ? (roll < 82 ? "melee" : "dasher")
      : seconds < 240 ? (roll < 55 ? "melee" : roll < 78 ? "dasher" : roll < 92 ? "thrower" : "brute")
        : seconds < 420
          ? (roll < 30 ? "melee" : roll < 50 ? "dasher" : roll < 70 ? "thrower" : roll < 88 ? "brute" : "bomber")
          : (roll < 18 ? "melee" : roll < 40 ? "dasher" : roll < 61 ? "thrower" : roll < 80 ? "brute" : "bomber");
  const difficulty = 1 + Math.max(0, seconds - 80) / 300;
  const base = {
    melee: { hp: 17, speed: 1.85, radius: 20, damage: 5.5, xp: 2.2, color: "#ef476f" },
    dasher: { hp: 30, speed: 2.9, radius: 19, damage: 8, xp: 3.5, color: "#fb923c" },
    thrower: { hp: 25, speed: 1.7, radius: 21, damage: 5, xp: 4.5, color: "#a78bfa" },
    brute: { hp: 72, speed: 1.25, radius: 30, damage: 11, xp: 8, color: "#94a3b8" },
    bomber: { hp: 48, speed: 1.55, radius: 23, damage: 9, xp: 7, color: "#d946ef" },
    voidKnight: { hp: 190, speed: 2.28, radius: 29, damage: 24, xp: 18, color: "#6366f1" },
    arcSniper: { hp: 120, speed: 1.62, radius: 23, damage: 22, xp: 17, color: "#22d3ee" },
    colossus: { hp: 380, speed: 0.95, radius: 43, damage: 34, xp: 28, color: "#b45309" },
    nightmare: { hp: 170, speed: 3.32, radius: 25, damage: 28, xp: 23, color: "#e11d48" },
    riftReaver: { hp: 260, speed: 2.55, radius: 31, damage: 36, xp: 31, color: "#8b5cf6" },
    eclipseSniper: { hp: 150, speed: 1.55, radius: 24, damage: 30, xp: 29, color: "#38bdf8" },
    bloodWraith: { hp: 220, speed: 3.72, radius: 26, damage: 34, xp: 32, color: "#fb7185" },
    obsidianTitan: { hp: 620, speed: 0.82, radius: 50, damage: 52, xp: 52, color: "#111827" }
  }[type];
  const angle = Math.atan2(pveGame.player.y - y, pveGame.player.x - x);
  pveGame.enemies.push({
    id: `s-${pveGame.tick}-${pveGame.seed++}`,
    type, x, y,
    vx: Math.cos(angle) * base.speed,
    vy: Math.sin(angle) * base.speed,
    baseSpeed: base.speed * mode.enemySpeed
      * Math.min(1.92, (1 + Math.max(0, seconds - 150) / 900) * Math.sqrt(lateSurge))
      * (seconds >= 600 ? 1.08 : 1),
    radius: base.radius,
    hp: base.hp * difficulty * lateSurge * endgameSurge * mode.enemyHp,
    maxHp: base.hp * difficulty * lateSurge * endgameSurge * mode.enemyHp,
    contactDamage: base.damage * mode.enemyDamage
      * Math.min(4.2, (1 + Math.max(0, seconds - 60) / 420) * lateSurge * Math.sqrt(endgameSurge)),
    xpValue: base.xp * mode.enemyXp,
    color: base.color,
    contactCooldown: 0,
    attackTimer: type === "thrower" ? 150
      : type === "bomber" ? 210
        : type === "arcSniper" ? 105
          : type === "eclipseSniper" ? 90
          : type === "nightmare" ? 165
            : type === "bloodWraith" ? 132
              : type === "obsidianTitan" ? 150
                : Infinity,
    stunTime: 0,
    slowTime: 0
  });
}

function spawnSurvivalBoss() {
  pveGame.bossCount += 1;
  const count = pveGame.bossCount;
  const mode = pveGame.difficulty || SURVIVAL_DIFFICULTIES.easy;
  const hp = 680 * (1 + (count - 1) * 0.42) * mode.bossPower;
  pveGame.enemies.push({
    id: `boss-${count}-${pveGame.tick}`,
    type: "survivalBoss",
    name: "균열 파수꾼",
    x: pveCanvas.width / 2,
    y: 65,
    vx: 0,
    vy: 1.25,
    baseSpeed: (1.08 + count * 0.045) * mode.enemySpeed,
    radius: 46,
    hp,
    maxHp: hp,
    contactDamage: (14 + count * 2) * mode.enemyDamage,
    xpValue: (35 + count * 5) * mode.enemyXp,
    color: "#f43f5e",
    contactCooldown: 0,
    attackTimer: 120,
    stunTime: 0,
    slowTime: 0,
    boss: true
  });
  addPveFloating("균열 파수꾼 출현!", "#fda4af");
}

function spawnSurvivalMiniBoss() {
  pveGame.miniBossCount += 1;
  const count = pveGame.miniBossCount;
  const mode = pveGame.difficulty || SURVIVAL_DIFFICULTIES.easy;
  const hp = 220 * (1 + (count - 1) * 0.28) * mode.bossPower;
  pveGame.enemies.push({
    id: `mini-boss-${count}-${pveGame.tick}`,
    type: "survivalMiniBoss",
    name: "균열 집행자",
    x: pveCanvas.width - 70,
    y: 70 + pveRandomIndex(Math.max(1, pveCanvas.height - 140)),
    vx: -1,
    vy: 0,
    baseSpeed: (1.22 + count * 0.04) * mode.enemySpeed,
    radius: 36,
    hp,
    maxHp: hp,
    contactDamage: (9 + count) * mode.enemyDamage,
    xpValue: (35 + count * 5) * mode.enemyXp,
    color: "#f59e0b",
    contactCooldown: 0,
    attackTimer: 150,
    stunTime: 0,
    slowTime: 0,
    miniBoss: true
  });
  addPveFloating("미니보스 출현!", "#fbbf24");
}

function dropSurvivalPickup(x, y, type) {
  pveGame.pickups.push({
    id: `pickup-${pveGame.tick}-${pveGame.seed++}`,
    type,
    x: clamp(x, 30, pveCanvas.width - 30),
    y: clamp(y, 30, pveCanvas.height - 30),
    radius: 15,
    life: 900
  });
}

function dropSurvivalXp(enemy) {
  const count = enemy.xpValue >= 6 ? 2 : 1;
  for (let index = 0; index < count; index += 1) {
    pveGame.xpOrbs.push({
      x: enemy.x + (pveRandomIndex(25) - 12),
      y: enemy.y + (pveRandomIndex(25) - 12),
      value: enemy.xpValue / count,
      radius: 6 + Math.min(5, enemy.xpValue / 2)
    });
  }
}

function survivalXpRequired(level) {
  const base = 8 + level * 3.7 + level ** 1.2;
  if (level <= 30) return Math.floor(base);
  const lateLevel = level - 30;
  return Math.floor(base + lateLevel ** 2.15 * 4.8 + lateLevel * level * 1.35);
}

function gainSurvivalXp(amount) {
  pveGame.xp += amount;
  while (pveGame.xp >= pveGame.xpRequired) {
    pveGame.xp -= pveGame.xpRequired;
    pveGame.level += 1;
    pveGame.xpRequired = survivalXpRequired(pveGame.level);
    pveGame.pendingLevels += 1;
    healPvePlayer(pveGame.player.maxHp * 0.1);
    addPveFloating("LEVEL UP · 체력 10% 회복", "#67e8f9");
  }
  if (pveGame.pendingLevels > 0 && !pveGame.pausedForAugment) openSurvivalAugments();
}

function survivalChoicePool() {
  const ownedWeaponIds = Object.keys(pveGame.weapons);
  const weaponIds = Object.keys(SURVIVAL_WEAPONS).filter(id => {
    const owned = pveGame.weapons[id];
    return owned ? owned.stars < 5 : ownedWeaponIds.length < 6;
  });
  const itemIds = ownedWeaponIds.length < 2 ? [] : Object.keys(SURVIVAL_ITEMS).filter(id =>
    !pveGame.items[id]
    && Object.keys(pveGame.items).length < 6);
  const relatedItemIds = new Set(ownedWeaponIds.map(id => SURVIVAL_WEAPONS[id]?.item).filter(Boolean));
  const pool = [];
  weaponIds.forEach(id => {
    const weight = pveGame.weapons[id] ? 110 : 100;
    for (let count = 0; count < weight; count += 10) pool.push({ type: "weapon", id });
  });
  itemIds.forEach(id => {
    const weight = relatedItemIds.has(id) ? 46 : 38;
    for (let count = 0; count < weight; count += 1) pool.push({ type: "item", id });
  });
  SURVIVAL_SUBS.forEach(sub => pool.push({ type: "sub", id: sub.id }));
  return pool;
}

function makeSurvivalChoices() {
  const pool = survivalChoicePool();
  const choices = [];
  const primaryPool = pool.filter(choice => choice.type !== "sub");
  let guard = 0;
  while (choices.length < 3 && primaryPool.length && guard < 100) {
    guard += 1;
    const candidate = primaryPool[pveRandomIndex(primaryPool.length)];
    if (!candidate || choices.some(choice => choice.type === candidate.type && choice.id === candidate.id)) continue;
    choices.push(candidate);
  }
  const subPool = pool.filter(choice => choice.type === "sub");
  while (choices.length < 3 && subPool.length) {
    const candidate = subPool[pveRandomIndex(subPool.length)];
    if (choices.some(choice => choice.type === candidate.type && choice.id === candidate.id)) continue;
    choices.push(candidate);
  }
  return choices;
}

function describeSurvivalChoice(choice) {
  if (choice.type === "weapon") {
    const definition = SURVIVAL_WEAPONS[choice.id];
    const owned = pveGame.weapons[choice.id];
    const nextStar = owned ? owned.stars + 1 : 1;
    return {
      type: "무기",
      name: definition.name,
      icon: definition.icon,
      color: definition.color,
      level: `${"★".repeat(nextStar)}${"☆".repeat(5 - nextStar)}`,
      description: owned
        ? nextStar === 5 && pveGame.items[definition.item]
          ? `5성 완성 즉시 ${definition.awakenedName || "각성 무기"}로 진화합니다.`
          : `${nextStar}성 강화: 피해, 공격주기, 범위가 균형 있게 상승합니다.`
        : definition.description
    };
  }
  if (choice.type === "item") {
    const item = SURVIVAL_ITEMS[choice.id];
    const evolutionWeapons = Object.values(SURVIVAL_WEAPONS)
      .filter(weapon => weapon.item === choice.id)
      .map(weapon => weapon.name);
    return {
      type: "아이템",
      name: item.name,
      icon: item.icon,
      color: "#fbbf24",
      level: item.effect,
      description: item.description,
      evolution: evolutionWeapons.length ? `진화 가능 · ${evolutionWeapons.join(" / ")}` : ""
    };
  }
  const sub = SURVIVAL_SUBS.find(item => item.id === choice.id);
  return { type: "서브", name: sub.name, icon: sub.icon, color: "#94a3b8", level: "즉시 적용", description: sub.description };
}

function openSurvivalAugments() {
  if (!pveGame || pveGame.over) return;
  pveGame.pausedForAugment = true;
  pveGame.currentAugmentChoices = makeSurvivalChoices();
  renderSurvivalAugmentChoices();
  ui.pveAugmentReroll.classList.remove("is-hidden");
  updateAugmentRerollButton();
  ui.pveAugmentOverlay.classList.add("is-active");
  ui.pveAugmentOverlay.setAttribute("aria-hidden", "false");
}

function renderSurvivalAugmentChoices() {
  const choices = pveGame.currentAugmentChoices;
  ui.pveAugmentChoices.innerHTML = choices.map((choice, index) => {
    const view = describeSurvivalChoice(choice);
    return `
      <button class="augment-card" type="button" data-augment-index="${index}"
        style="--augment-color:${view.color}">
        <span class="augment-type">${view.type}</span>
        <div class="augment-graphic">${view.icon}</div>
        <strong>${view.name}</strong>
        <b>${view.level}</b>
        ${view.evolution ? `<em class="augment-evolution">${view.evolution}</em>` : ""}
        <p>${view.description}</p>
      </button>
    `;
  }).join("");
  ui.pveAugmentChoices.querySelectorAll("[data-augment-index]").forEach(button => {
    button.addEventListener("click", () => chooseSurvivalAugment(choices[Number(button.dataset.augmentIndex)]));
  });
}

function updateAugmentRerollButton() {
  if (!ui.pveAugmentReroll || !pveGame) return;
  ui.pveAugmentReroll.disabled = pveGame.augmentRerolls <= 0 || pveGame.startingChoice;
  ui.pveAugmentReroll.querySelector("b").textContent = String(pveGame.augmentRerolls);
}

function rerollSurvivalAugments() {
  if (!pveGame?.pausedForAugment || pveGame.startingChoice || pveGame.augmentRerolls <= 0) return;
  pveGame.augmentRerolls -= 1;
  pveGame.currentAugmentChoices = makeSurvivalChoices();
  renderSurvivalAugmentChoices();
  updateAugmentRerollButton();
}

function openStartingWeaponChoices() {
  if (!pveGame || pveGame.over) return;
  pveGame.pausedForAugment = true;
  const weaponIds = Object.keys(SURVIVAL_WEAPONS);
  const choices = [];
  while (choices.length < 3 && choices.length < weaponIds.length) {
    const id = weaponIds[pveRandomIndex(weaponIds.length)];
    if (!choices.some(choice => choice.id === id)) choices.push({ type: "weapon", id });
  }
  const header = ui.pveAugmentOverlay.querySelector("header");
  if (header) {
    header.querySelector("span").textContent = "STARTING WEAPON";
    header.querySelector("h2").textContent = "첫 무기 선택";
    header.querySelector("p").textContent = "이번 생존을 시작할 무기를 선택하세요.";
  }
  ui.pveAugmentChoices.innerHTML = choices.map((choice, index) => {
    const view = describeSurvivalChoice(choice);
    return `
      <button class="augment-card" type="button" data-augment-index="${index}"
        style="--augment-color:${view.color}">
        <span class="augment-type">${view.type}</span>
        <div class="augment-graphic">${view.icon}</div>
        <strong>${view.name}</strong>
        <b>${view.level}</b>
        ${view.evolution ? `<em class="augment-evolution">${view.evolution}</em>` : ""}
        <p>${view.description}</p>
      </button>
    `;
  }).join("");
  ui.pveAugmentReroll.classList.add("is-hidden");
  ui.pveAugmentOverlay.classList.add("is-active");
  ui.pveAugmentOverlay.setAttribute("aria-hidden", "false");
  ui.pveAugmentChoices.querySelectorAll("[data-augment-index]").forEach(button => {
    button.addEventListener("click", () => chooseSurvivalAugment(choices[Number(button.dataset.augmentIndex)]));
  });
}

function checkSurvivalAwakenings() {
  Object.entries(pveGame.weapons).forEach(([id, weapon]) => {
    const itemId = SURVIVAL_WEAPONS[id].item;
    if (weapon.stars >= 5 && pveGame.items[itemId] && !weapon.awakened) {
      weapon.awakened = true;
      queueSurvivalAwakening(id);
    }
  });
}

function queueSurvivalAwakening(id) {
  if (!pveGame) return;
  pveGame.awakeningQueue.push(id);
  playNextSurvivalAwakening();
}

function playNextSurvivalAwakening() {
  if (!pveGame || pveGame.awakeningPlaying || !pveGame.awakeningQueue.length) return;
  const id = pveGame.awakeningQueue.shift();
  const definition = SURVIVAL_WEAPONS[id];
  pveGame.awakeningPlaying = true;
  pveGame.awakeningPaused = true;
  ui.pveAwakeningName.textContent = definition.awakenedName || `${definition.name} 각성`;
  ui.pveAwakeningDescription.textContent = definition.awakenedDescription || "무기가 완전한 형태로 진화했습니다.";
  ui.pveAwakeningOverlay.classList.remove("is-active");
  void ui.pveAwakeningOverlay.offsetWidth;
  ui.pveAwakeningOverlay.classList.add("is-active");
  ui.pveAwakeningOverlay.setAttribute("aria-hidden", "false");
  addPveFloating(`${definition.awakenedName || definition.name} 각성!`, "#ffe28a");
  setTimeout(() => {
    if (!pveGame) return;
    ui.pveAwakeningOverlay.classList.remove("is-active");
    ui.pveAwakeningOverlay.setAttribute("aria-hidden", "true");
    pveGame.awakeningPlaying = false;
    pveGame.awakeningPaused = false;
    if (pveGame.awakeningQueue.length) {
      playNextSurvivalAwakening();
    } else if (pveGame.pendingLevels > 0 && !pveGame.pausedForAugment) {
      openSurvivalAugments();
    }
  }, 2250);
}

function chooseSurvivalAugment(choice) {
  if (!pveGame?.pausedForAugment) return;
  if (choice.type === "weapon") {
    const weapon = pveGame.weapons[choice.id];
    if (weapon) weapon.stars = Math.min(5, weapon.stars + 1);
    else pveGame.weapons[choice.id] = { stars: 1, awakened: false, timer: 20, damageDealt: 0 };
  } else if (choice.type === "item") {
    pveGame.items[choice.id] = true;
  } else {
    pveGame.subs[choice.id] = (pveGame.subs[choice.id] || 0) + 1;
    if (choice.id === "heal") healPvePlayer(pveGame.player.maxHp * 0.2);
    if (choice.id === "maxHp") {
      const gain = pveGame.player.maxHp * 0.12;
      pveGame.player.maxHp += gain;
      pveGame.player.hp += gain;
    }
    if (choice.id === "speed") pveGame.player.speedMultiplier *= 1.08;
    if (choice.id === "power") pveGame.player.damageMultiplier *= 1.07;
    if (choice.id === "cooldown") pveGame.player.cooldownMultiplier *= 0.94;
    if (choice.id === "magnet") pveGame.player.magnetRadius += 35;
    if (choice.id === "coin") pveGame.bonusCoins += 5;
  }
  checkSurvivalAwakenings();
  if (pveGame.startingChoice) {
    pveGame.startingChoice = false;
    const header = ui.pveAugmentOverlay.querySelector("header");
    if (header) {
      header.querySelector("span").textContent = "LEVEL UP";
      header.querySelector("h2").textContent = "증강 선택";
      header.querySelector("p").textContent = "이번 생존을 바꿀 하나를 선택하세요.";
    }
  } else {
    pveGame.pendingLevels = Math.max(0, pveGame.pendingLevels - 1);
  }
  pveGame.pausedForAugment = false;
  ui.pveAugmentOverlay.classList.remove("is-active");
  ui.pveAugmentOverlay.setAttribute("aria-hidden", "true");
  renderSurvivalBuild();
  if (pveGame.pendingLevels > 0 && !pveGame.awakeningPlaying) openSurvivalAugments();
}

function renderSurvivalBuild() {
  if (!pveGame || !ui.pveBuildList) return;
  const weapons = Object.entries(pveGame.weapons).map(([id, weapon]) => {
    const definition = SURVIVAL_WEAPONS[id];
    return `<div class="build-effect weapon ${weapon.awakened ? "is-awakened" : ""}" data-build-weapon="${id}">
      <span style="--effect-color:${definition.color}">${definition.icon}</span>
      <div>
        <strong>${weapon.awakened ? definition.awakenedName || definition.name : definition.name}</strong>
        <small>${weapon.awakened ? "각성" : `${weapon.stars}성`}</small>
        <small class="build-damage-stat">누적 피해 ${formatResultNumber(weapon.damageDealt || 0)}</small>
        <small class="build-live-stat"></small>
      </div>
    </div>`;
  });
  const items = Object.keys(pveGame.items).map(id => {
    const item = SURVIVAL_ITEMS[id];
    return `<div class="build-effect item"><span>${item.icon}</span><div><strong>${item.name}</strong><small>${item.effect}</small></div></div>`;
  });
  const subs = Object.entries(pveGame.subs).map(([id, count]) => {
    const sub = SURVIVAL_SUBS.find(item => item.id === id);
    return `<div class="build-effect sub"><span>${sub.icon}</span><div><strong>${sub.name}</strong><small>${count}중첩</small></div></div>`;
  });
  const section = (title, entries, emptyText, max = null) => `<section class="build-section">
    <h3>${title}<b>${entries.length}${max ? ` / ${max}` : ""}</b></h3>
    <div class="build-section-list">${entries.length ? entries.join("") : `<p>${emptyText}</p>`}</div>
  </section>`;
  ui.pveBuildList.innerHTML = [
    section("무기", weapons, "첫 무기를 선택하세요.", 6),
    section("아이템", items, "획득한 아이템이 없습니다.", 6),
    ...(subs.length ? [section("서브", subs, "")] : [])
  ].join("");
  updateSurvivalBuildStats();
}

function updateSurvivalBuildStats() {
  if (!pveGame || !ui.pveBuildList) return;
  Object.entries(pveGame.weapons).forEach(([id, weapon]) => {
    const damage = ui.pveBuildList.querySelector(`[data-build-weapon="${id}"] .build-damage-stat`);
    if (damage) damage.textContent = `누적 피해 ${formatResultNumber(weapon.damageDealt || 0)}`;
  });
  const changingStats = {
    temper: () => {
      const baseDamage = Math.min(28, 7 + pveGame.tick / 900);
      return `현재 피해 ${(baseDamage * survivalWeaponStats("temper").damageScale).toFixed(1)}`;
    },
    blood: () => {
      const missingHealth = 1 - pveGame.player.hp / pveGame.player.maxHp;
      const damage = (10 + missingHealth * 24) * survivalWeaponStats("blood").damageScale;
      return `현재 피해 ${damage.toFixed(1)}`;
    }
  };
  Object.entries(changingStats).forEach(([id, getText]) => {
    if (!pveGame.weapons[id]) return;
    const stat = ui.pveBuildList.querySelector(`[data-build-weapon="${id}"] .build-live-stat`);
    if (stat) stat.textContent = getText();
  });
}

function updateSurvivalHud() {
  if (!pveGame) return;
  const elapsed = formatBattleTime(pveGame.tick);
  ui.pveElapsedTime.textContent = elapsed;
  ui.pvePlayerHealthText.textContent = `${Math.ceil(pveGame.player.hp)} / ${Math.ceil(pveGame.player.maxHp)}`;
  ui.pvePlayerHealthBar.style.width = `${clamp(pveGame.player.hp / pveGame.player.maxHp, 0, 1) * 100}%`;
  ui.pveEnemyCount.textContent = String(pveGame.kills);
  ui.pveLevel.textContent = String(pveGame.level);
  ui.pveXpText.textContent = `${Math.floor(pveGame.xp)} / ${pveGame.xpRequired} XP`;
  ui.pveXpBar.style.width = `${clamp(pveGame.xp / pveGame.xpRequired, 0, 1) * 100}%`;
  updateSurvivalBuildStats();
}

function damageSurvivalEnemy(enemy, amount, sourceWeaponId = "") {
  const actual = Math.min(enemy.hp, amount);
  enemy.hp -= actual;
  pveGame.player.damageDealt += actual;
  if (sourceWeaponId && pveGame.weapons[sourceWeaponId]) {
    const weapon = pveGame.weapons[sourceWeaponId];
    weapon.damageDealt = (weapon.damageDealt || 0) + actual;
  }
  addPveDamage(enemy.x, enemy.y - enemy.radius, Math.round(actual * 10) / 10);
  if (pveGame.items.chalice) healPvePlayer(actual * 0.12);
  if (sourceWeaponId === "deathSword" && pveGame.items.demonSigil) healPvePlayer(actual * 0.1);
  if (enemy.hp <= 0 && !enemy.dead) {
    enemy.dead = true;
    pveGame.kills += 1;
    dropSurvivalXp(enemy);
    if (enemy.miniBoss) {
      dropSurvivalPickup(enemy.x - 22, enemy.y, "heal");
      dropSurvivalPickup(enemy.x + 22, enemy.y, "heal");
    }
    if (pveRandomIndex(100) < 5) {
      dropSurvivalPickup(enemy.x, enemy.y, pveRandomIndex(2) === 0 ? "freeze" : "heal");
    }
  }
}

function stepSurvivalPve() {
  if (!pveGame || pveGame.over || pveGame.pausedForAugment || pveGame.awakeningPaused) return;
  if (pveGame.reaperActive) {
    stepSurvivalReaper();
    return;
  }
  pveGame.tick += 1;
  const player = pveGame.player;
  if (player.invulnerableTime > 0) player.invulnerableTime -= 1;

  const seconds = pveGame.tick / 60;
  if (pveGame.tick >= 54000) {
    pveGame.tick = 54000;
    pveGame.reaperActive = true;
    pveGame.reaperTicks = 0;
    pveGame.reaper = {
      x: player.x < pveCanvas.width / 2 ? pveCanvas.width + 90 : -90,
      y: -110,
      radius: 54,
      attached: false,
      hitTimer: 0
    };
    pveGame.projectiles = [];
    pveGame.areaAttacks = [];
    addPveFloating("15:00 · 사신이 도착했습니다", "#ef4444");
    updateSurvivalHud();
    return;
  }
  if (pveGame.tick >= pveGame.nextMiniBossTick) {
    spawnSurvivalMiniBoss();
    pveGame.nextMiniBossTick += 7200;
  }
  if (pveGame.tick >= pveGame.nextBossTick) {
    spawnSurvivalBoss();
    pveGame.nextBossTick += 18000;
  }
  pveGame.spawnTimer -= 1;
  if (pveGame.spawnTimer <= 0) {
    const mode = pveGame.difficulty || SURVIVAL_DIFFICULTIES.easy;
    const lateRush = seconds >= 420;
    const endgame = seconds >= 600;
    const baseCount = endgame
      ? 2 + Math.floor((seconds - 600) / 150)
      : lateRush
      ? 5 + Math.floor((seconds - 420) / 90)
      : 1 + Math.floor(Math.max(0, seconds - 210) / 120);
    const count = Math.ceil(baseCount * mode.spawnCount);
    const baseEnemyCap = seconds < 90 ? 13
      : seconds < 180 ? 20
        : seconds < 420 ? 32 + Math.floor((seconds - 180) / 90) * 5
          : seconds < 600 ? 76 + Math.floor((seconds - 420) / 60) * 8
            : Math.min(64, 42 + Math.floor((seconds - 600) / 90) * 4);
    const enemyCap = Math.min(endgame ? 78 : 140, Math.floor(baseEnemyCap * mode.enemyCap));
    const availableSlots = Math.max(0, enemyCap - pveGame.enemies.filter(enemy => !enemy.dead).length);
    const waveLimit = Math.ceil((endgame ? 3 : lateRush ? 9 : 4) * mode.spawnCount);
    for (let index = 0; index < Math.min(waveLimit, count, availableSlots); index += 1) spawnSurvivalEnemy();
    const baseInterval = seconds < 90 ? 122
      : seconds < 180 ? 102
        : seconds < 420 ? Math.max(38, 82 - (seconds - 180) * 0.06)
          : seconds < 600 ? Math.max(16, 27 - (seconds - 420) * 0.02)
            : Math.max(44, 70 - (seconds - 600) * 0.035);
    pveGame.spawnTimer = Math.max(10, baseInterval * mode.spawnInterval);
  }

  Object.entries(pveGame.weapons).forEach(([id, weapon]) => {
    weapon.timer -= 1;
    if (weapon.timer <= 0) {
      fireSurvivalWeapon(id);
      weapon.timer = survivalWeaponStats(id).cooldown;
    }
  });

  const moveSpeed = 5.8 * player.speedMultiplier * (pveGame.items.engine ? 1.15 : 1);
  const currentSpeed = Math.hypot(player.vx, player.vy) || 1;
  player.vx = player.vx / currentSpeed * moveSpeed;
  player.vy = player.vy / currentSpeed * moveSpeed;
  player.x += player.vx;
  player.y += player.vy;
  bouncePveBody(player);

  pveGame.enemies.forEach(enemy => {
    if (enemy.dead) return;
    if (enemy.stunTime > 0) {
      enemy.stunTime -= 1;
      return;
    }
    const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    const speed = enemy.baseSpeed * (enemy.slowTime > 0 ? 0.58 : 1);
    enemy.vx = enemy.vx * 0.9 + Math.cos(angle) * speed * 0.1;
    enemy.vy = enemy.vy * 0.9 + Math.sin(angle) * speed * 0.1;
    enemy.x += enemy.vx;
    enemy.y += enemy.vy;
    if (enemy.slowTime > 0) enemy.slowTime -= 1;
    if (enemy.contactCooldown > 0) enemy.contactCooldown -= 1;
    if (enemy.attackTimer < Infinity) {
      enemy.attackTimer -= 1;
      if (enemy.attackTimer <= 0) {
        if (enemy.type === "survivalBoss") {
          const mode = pveGame.difficulty || SURVIVAL_DIFFICULTIES.easy;
          const bulletCount = pveGame.difficultyId === "hard" ? 14 : pveGame.difficultyId === "normal" ? 12 : 10;
          for (let index = 0; index < bulletCount; index += 1) {
            const shotAngle = index / bulletCount * Math.PI * 2 + pveGame.tick * 0.006;
            spawnSurvivalProjectile({
              x: enemy.x, y: enemy.y,
              vx: Math.cos(shotAngle) * 4.8,
              vy: Math.sin(shotAngle) * 4.8,
              damage: (9 + pveGame.bossCount) * mode.enemyDamage,
              radius: 9,
              color: "#fb7185",
              life: 220
            });
            pveGame.projectiles[pveGame.projectiles.length - 1].owner = "enemy";
          }
          enemy.attackTimer = pveGame.difficultyId === "hard" ? 135 : pveGame.difficultyId === "normal" ? 155 : 180;
        } else if (enemy.type === "survivalMiniBoss") {
          const mode = pveGame.difficulty || SURVIVAL_DIFFICULTIES.easy;
          const bulletCount = pveGame.difficultyId === "hard" ? 9 : pveGame.difficultyId === "normal" ? 7 : 6;
          for (let index = 0; index < bulletCount; index += 1) {
            const shotAngle = index / bulletCount * Math.PI * 2 + pveGame.tick * 0.004;
            spawnSurvivalProjectile({
              x: enemy.x,
              y: enemy.y,
              vx: Math.cos(shotAngle) * 4.2,
              vy: Math.sin(shotAngle) * 4.2,
              damage: (6 + pveGame.miniBossCount) * mode.enemyDamage,
              radius: 8,
              color: "#fbbf24",
              life: 190
            });
            pveGame.projectiles[pveGame.projectiles.length - 1].owner = "enemy";
          }
          enemy.attackTimer = pveGame.difficultyId === "hard" ? 140 : pveGame.difficultyId === "normal" ? 160 : 180;
        } else if (enemy.type === "nightmare") {
          const centerAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
          [-0.18, 0, 0.18].forEach(offset => {
            const shotAngle = centerAngle + offset;
            spawnSurvivalProjectile({
              x: enemy.x, y: enemy.y,
              vx: Math.cos(shotAngle) * 8.5,
              vy: Math.sin(shotAngle) * 8.5,
              damage: enemy.contactDamage * 0.55,
              radius: 8,
              color: enemy.color,
              life: 170
            });
            pveGame.projectiles[pveGame.projectiles.length - 1].owner = "enemy";
          });
          enemy.attackTimer = 165;
        } else if (enemy.type === "eclipseSniper") {
          const centerAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
          [-0.08, 0, 0.08].forEach(offset => {
            const shotAngle = centerAngle + offset;
            spawnSurvivalProjectile({
              x: enemy.x, y: enemy.y,
              vx: Math.cos(shotAngle) * 13.2,
              vy: Math.sin(shotAngle) * 13.2,
              damage: enemy.contactDamage * 0.82,
              radius: 7,
              color: enemy.color,
              life: 210,
              pierce: 1,
              trail: enemy.color
            });
            pveGame.projectiles[pveGame.projectiles.length - 1].owner = "enemy";
          });
          enemy.attackTimer = 90;
        } else if (enemy.type === "bloodWraith") {
          const centerAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
          for (let index = 0; index < 5; index += 1) {
            const shotAngle = centerAngle + (index - 2) * 0.19;
            spawnSurvivalProjectile({
              x: enemy.x, y: enemy.y,
              vx: Math.cos(shotAngle) * 9.4,
              vy: Math.sin(shotAngle) * 9.4,
              damage: enemy.contactDamage * 0.55,
              radius: 9,
              color: enemy.color,
              life: 150,
              trail: "#fb7185"
            });
            pveGame.projectiles[pveGame.projectiles.length - 1].owner = "enemy";
          }
          enemy.attackTimer = 132;
        } else if (enemy.type === "obsidianTitan") {
          pveGame.enemyAreas.push({
            x: player.x,
            y: player.y,
            radius: 86,
            damage: enemy.contactDamage * 0.72,
            delay: 34,
            life: 64,
            color: enemy.color,
            stun: 20
          });
          enemy.attackTimer = 150;
        } else {
          const shotAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
          spawnSurvivalProjectile({
            x: enemy.x, y: enemy.y,
            vx: Math.cos(shotAngle) * (enemy.type === "arcSniper" ? 10.5 : 7.5),
            vy: Math.sin(shotAngle) * (enemy.type === "arcSniper" ? 10.5 : 7.5),
            damage: enemy.contactDamage * 0.75,
            radius: enemy.type === "bomber" ? 12 : enemy.type === "arcSniper" ? 6 : 8,
            color: enemy.color,
            life: 180
          });
          pveGame.projectiles[pveGame.projectiles.length - 1].owner = "enemy";
          enemy.attackTimer = enemy.type === "bomber" ? 200 : enemy.type === "arcSniper" ? 105 : 150;
        }
      }
    }
    const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (distance < player.radius + enemy.radius && enemy.contactCooldown <= 0) {
      if (player.invulnerableTime <= 0) damagePvePlayer(enemy.contactDamage);
      damageSurvivalEnemy(enemy, 5);
      const nx = (enemy.x - player.x) / (distance || 1);
      const ny = (enemy.y - player.y) / (distance || 1);
      const overlap = player.radius + enemy.radius - distance;
      player.x -= nx * (overlap * 0.5 + 2);
      player.y -= ny * (overlap * 0.5 + 2);
      enemy.x += nx * (overlap * 0.5 + 2);
      enemy.y += ny * (overlap * 0.5 + 2);
      player.vx = -nx * 7.2;
      player.vy = -ny * 7.2;
      enemy.vx = nx * 6;
      enemy.vy = ny * 6;
      player.invulnerableTime = Math.max(player.invulnerableTime, 24);
      enemy.contactCooldown = 42;
    }
  });
  if (pveGame.over) return;

  pveGame.projectiles = pveGame.projectiles.filter(projectile => {
    projectile.life -= 1;
    if (projectile.homing && projectile.owner !== "enemy") {
      const target = nearestPveEnemy();
      if (target) {
        const speed = Math.hypot(projectile.vx, projectile.vy) || 1;
        const angle = Math.atan2(target.y - projectile.y, target.x - projectile.x);
        projectile.vx = projectile.vx * 0.9 + Math.cos(angle) * speed * 0.1;
        projectile.vy = projectile.vy * 0.9 + Math.sin(angle) * speed * 0.1;
      }
    }
    projectile.x += projectile.vx;
    projectile.y += projectile.vy;
    if (projectile.bounce) {
      const wallHit = projectile.x - projectile.radius < 0
        || projectile.x + projectile.radius > pveCanvas.width
        || projectile.y - projectile.radius < 0
        || projectile.y + projectile.radius > pveCanvas.height;
      bouncePveBody(projectile);
      if (wallHit && projectile.repeatHits) projectile.hitIds.clear();
    }
    if (projectile.owner === "enemy") {
      if (Math.hypot(player.x - projectile.x, player.y - projectile.y) < player.radius + projectile.radius) {
        if (player.invulnerableTime <= 0) damagePvePlayer(projectile.damage);
        return false;
      }
    } else {
      const enemy = pveGame.enemies.find(item => !item.dead
        && !projectile.hitIds.has(item.id)
        && Math.hypot(item.x - projectile.x, item.y - projectile.y) < item.radius + projectile.radius);
      if (enemy) {
        projectile.hitIds.add(enemy.id);
        let hitDamage = projectile.damage;
        if (projectile.cardEffect === "JOKER") {
          hitDamage *= 0.5 + pveRandomIndex(151) / 100;
        }
        damageSurvivalEnemy(enemy, hitDamage, projectile.sourceWeaponId);
        if (projectile.cardEffect === "A") enemy.slowTime = Math.max(enemy.slowTime, 210);
        if (projectile.cardEffect === "K") pveGame.player.damageMultiplier *= 1.003;
        if (projectile.cardEffect === "Q") healPvePlayer(pveGame.player.maxHp * 0.012);
        if (projectile.pullStrength) {
          const pullAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
          enemy.x += Math.cos(pullAngle) * projectile.pullStrength;
          enemy.y += Math.sin(pullAngle) * projectile.pullStrength;
        }
        if (projectile.explosionRadius > 0) {
          pveGame.areaAttacks.push({
            x: enemy.x,
            y: enemy.y,
            radius: projectile.explosionRadius,
            damage: projectile.explosionDamage,
            delay: 0,
            life: 20,
            hit: false,
            color: projectile.color,
            type: "shockwave",
            stun: 0,
            sourceWeaponId: projectile.sourceWeaponId,
            survival: true
          });
        }
        if (projectile.slow) enemy.slowTime = Math.max(enemy.slowTime, 150);
        if (projectile.pierce > 0) projectile.pierce -= 1;
        else return false;
      }
    }
    const inBounds = projectile.x > -50 && projectile.x < pveCanvas.width + 50
      && projectile.y > -50 && projectile.y < pveCanvas.height + 50;
    return projectile.life > 0 && (projectile.bounce || inBounds);
  });

  pveGame.areaAttacks = pveGame.areaAttacks.filter(attack => {
    attack.delay -= 1;
    attack.life -= 1;
    if (attack.delay <= 0 && !attack.hit) {
      attack.hit = true;
      pveGame.enemies.forEach(enemy => {
        if (enemy.dead) return;
        let hit;
        if (attack.type === "lineLaser") {
          const lineDx = attack.x2 - attack.x1;
          const lineDy = attack.y2 - attack.y1;
          const lengthSquared = lineDx * lineDx + lineDy * lineDy || 1;
          const t = clamp(((enemy.x - attack.x1) * lineDx + (enemy.y - attack.y1) * lineDy) / lengthSquared, 0, 1);
          const closestX = attack.x1 + lineDx * t;
          const closestY = attack.y1 + lineDy * t;
          hit = Math.hypot(enemy.x - closestX, enemy.y - closestY) < enemy.radius + attack.radius;
        } else {
          hit = attack.type === "laser"
            ? Math.abs(enemy.x - attack.x) < enemy.radius + attack.radius * 0.35
            : Math.hypot(enemy.x - attack.x, enemy.y - attack.y) < enemy.radius + attack.radius;
        }
        if (hit) {
          damageSurvivalEnemy(enemy, attack.damage, attack.sourceWeaponId);
          if (attack.stun) enemy.stunTime = Math.max(enemy.stunTime, attack.stun);
          if (attack.slow) enemy.slowTime = Math.max(enemy.slowTime, 150);
          if (attack.pull) {
            const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
            enemy.x += Math.cos(angle) * attack.pull;
            enemy.y += Math.sin(angle) * attack.pull;
          }
        }
      });
    }
    return attack.life > 0;
  });

  pveGame.xpOrbs.forEach(orb => {
    const dx = player.x - orb.x;
    const dy = player.y - orb.y;
    const distance = Math.hypot(dx, dy);
    if (distance < player.magnetRadius) {
      const speed = distance < 45 ? 12 : 4 + (player.magnetRadius - distance) / 25;
      orb.x += dx / (distance || 1) * speed;
      orb.y += dy / (distance || 1) * speed;
    }
    if (distance < player.radius + orb.radius + 8) {
      orb.collected = true;
      gainSurvivalXp(orb.value);
    }
  });
  pveGame.xpOrbs = pveGame.xpOrbs.filter(orb => !orb.collected);
  pveGame.pickups.forEach(pickup => {
    pickup.life -= 1;
    const dx = player.x - pickup.x;
    const dy = player.y - pickup.y;
    const distance = Math.hypot(dx, dy);
    const attractionRadius = pickup.type === "heal" ? 260 : 150;
    if (distance < attractionRadius) {
      const speed = pickup.type === "heal"
        ? distance < 55 ? 15 : 5.5 + (attractionRadius - distance) / 55
        : distance < 45 ? 11 : 3.5;
      pickup.x += dx / (distance || 1) * speed;
      pickup.y += dy / (distance || 1) * speed;
    }
    if (distance < player.radius + pickup.radius + 6) {
      pickup.collected = true;
      if (pickup.type === "heal") {
        healPvePlayer(player.maxHp * 0.3);
        addPveFloating("회복 아이템 · 체력 30%", "#86efac");
      } else {
        pveGame.enemies.forEach(target => {
          if (!target.dead) target.stunTime = Math.max(target.stunTime, 120);
        });
        addPveFloating("시간 정지 · 2초", "#a5f3fc");
      }
    }
  });
  pveGame.pickups = pveGame.pickups.filter(pickup => !pickup.collected && pickup.life > 0);
  pveGame.enemies = pveGame.enemies.filter(enemy => !enemy.dead);
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
  updateSurvivalHud();
}

function stepSurvivalReaper() {
  if (!pveGame || pveGame.over) return;
  pveGame.reaperTicks += 1;
  const player = pveGame.player;
  const reaper = pveGame.reaper;
  if (!reaper) return;

  const playerSpeed = Math.max(3.2, Math.hypot(player.vx, player.vy));
  player.x += player.vx / (Math.hypot(player.vx, player.vy) || 1) * playerSpeed;
  player.y += player.vy / (Math.hypot(player.vx, player.vy) || 1) * playerSpeed;
  if (player.x < player.radius || player.x > pveCanvas.width - player.radius) {
    player.vx *= -1;
    player.x = clamp(player.x, player.radius, pveCanvas.width - player.radius);
  }
  if (player.y < player.radius || player.y > pveCanvas.height - player.radius) {
    player.vy *= -1;
    player.y = clamp(player.y, player.radius, pveCanvas.height - player.radius);
  }

  if (!reaper.attached) {
    const dx = player.x - reaper.x;
    const dy = player.y - reaper.y;
    const distance = Math.hypot(dx, dy) || 1;
    const approachSpeed = Math.min(8.4, 1.35 + pveGame.reaperTicks / 105);
    reaper.x += dx / distance * approachSpeed;
    reaper.y += dy / distance * approachSpeed;
    if (distance <= player.radius + reaper.radius * 0.58) {
      reaper.attached = true;
      reaper.hitTimer = 0;
      addPveFloating("사신에게 붙잡혔습니다", "#ff5878");
    }
  } else {
    reaper.x += (player.x - reaper.x) * 0.34;
    reaper.y += (player.y - 18 - reaper.y) * 0.34;
    reaper.hitTimer -= 1;
  }

  if (reaper.attached && reaper.hitTimer <= 0) {
    reaper.hitTimer = 9;
    const damage = Math.max(10, player.maxHp * 0.055);
    const actual = Math.min(player.hp, damage);
    player.hp = Math.max(0, player.hp - damage);
    player.damageTaken += actual;
    addPveDamage(player.x + pveRandomIndex(31) - 15, player.y - 28, Math.round(actual));
  }
  updateSurvivalHud();
  if (player.hp <= 0) {
    player.hp = 0;
    finishSurvivalPve(true);
  }
}

function drawSurvivalPve() {
  pveCtx.clearRect(0, 0, pveCanvas.width, pveCanvas.height);
  pveCtx.fillStyle = "#070d15";
  pveCtx.fillRect(0, 0, pveCanvas.width, pveCanvas.height);
  pveCtx.strokeStyle = "rgba(91, 207, 255, 0.055)";
  for (let x = 0; x <= pveCanvas.width; x += 50) {
    pveCtx.beginPath(); pveCtx.moveTo(x, 0); pveCtx.lineTo(x, pveCanvas.height); pveCtx.stroke();
  }
  for (let y = 0; y <= pveCanvas.height; y += 50) {
    pveCtx.beginPath(); pveCtx.moveTo(0, y); pveCtx.lineTo(pveCanvas.width, y); pveCtx.stroke();
  }
  const player = pveGame.player;
  pveGame.xpOrbs.forEach(orb => {
    pveCtx.save();
    pveCtx.fillStyle = "#22d3ee";
    pveCtx.shadowColor = "#67e8f9";
    pveCtx.shadowBlur = 8;
    pveCtx.beginPath();
    pveCtx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
    pveCtx.fill();
    pveCtx.restore();
  });
  pveGame.pickups.forEach(pickup => {
    pveCtx.save();
    pveCtx.translate(pickup.x, pickup.y);
    pveCtx.rotate(pveGame.tick * 0.012);
    pveCtx.globalCompositeOperation = "lighter";
    pveCtx.shadowColor = pickup.type === "heal" ? "#4ade80" : "#67e8f9";
    pveCtx.shadowBlur = 32;
    pveCtx.fillStyle = pickup.type === "heal" ? "#16a34a" : "#071827";
    pveCtx.strokeStyle = pickup.type === "heal" ? "#bbf7d0" : "#a5f3fc";
    pveCtx.lineWidth = 3;
    pveCtx.beginPath();
    pveCtx.arc(0, 0, pickup.radius + Math.sin(pveGame.tick * 0.08) * 2, 0, Math.PI * 2);
    pveCtx.fill();
    pveCtx.stroke();
    pveCtx.globalAlpha = 0.45;
    pveCtx.setLineDash([5, 6]);
    pveCtx.beginPath();
    pveCtx.arc(0, 0, pickup.radius + 9, 0, Math.PI * 2);
    pveCtx.stroke();
    pveCtx.globalAlpha = 1;
    pveCtx.setLineDash([]);
    if (pickup.type === "heal") {
      pveCtx.fillStyle = "#f0fdf4";
      pveCtx.fillRect(-4, -11, 8, 22);
      pveCtx.fillRect(-11, -4, 22, 8);
    } else {
      pveCtx.strokeStyle = "#e0f2fe";
      pveCtx.lineWidth = 2;
      pveCtx.beginPath();
      pveCtx.arc(0, 0, 8, 0, Math.PI * 2);
      pveCtx.moveTo(0, 0);
      pveCtx.lineTo(0, -6);
      pveCtx.moveTo(0, 0);
      pveCtx.lineTo(5, 3);
      pveCtx.stroke();
    }
    pveCtx.restore();
  });
  pveGame.areaAttacks.forEach(attack => {
    const warning = attack.delay > 0;
    pveCtx.save();
    pveCtx.globalAlpha = warning ? 0.35 : Math.min(1, attack.life / 20);
    pveCtx.strokeStyle = attack.color;
    pveCtx.fillStyle = `${attack.color}24`;
    pveCtx.lineWidth = attack.type === "lineLaser"
      ? (warning ? Math.max(3, attack.radius * 0.25) : attack.radius * 2)
      : (warning ? 3 : 8);
    pveCtx.setLineDash(warning ? [9, 7] : []);
    pveCtx.beginPath();
    if (attack.type === "lineLaser") {
      if (warning) {
        pveCtx.moveTo(attack.x1, attack.y1);
        pveCtx.lineTo(attack.x2, attack.y2);
        pveCtx.stroke();
      } else {
        drawPrismaticBeam(
          pveCtx,
          attack.x1,
          attack.y1,
          attack.x2,
          attack.y2,
          attack.radius * 2,
          attack.color,
          pveGame.tick,
          pveCtx.globalAlpha
        );
      }
    } else {
      pveCtx.arc(attack.x, attack.y, attack.radius, 0, Math.PI * 2);
      pveCtx.fill();
      pveCtx.stroke();
    }
    if (!warning && attack.type === "laser") {
      drawPrismaticBeam(
        pveCtx,
        attack.x,
        0,
        attack.x,
        pveCanvas.height,
        attack.radius * 0.8,
        attack.color,
        pveGame.tick,
        pveCtx.globalAlpha
      );
    }
    pveCtx.restore();
  });
  pveGame.projectiles.forEach(projectile => {
    pveCtx.save();
    const angle = Math.atan2(projectile.vy, projectile.vx);
    const speed = Math.hypot(projectile.vx, projectile.vy);
    drawCheapTrail(
      pveCtx,
      projectile.x,
      projectile.y,
      projectile.vx,
      projectile.vy,
      projectile.radius,
      projectile.trail || projectile.color,
      projectile.visual === "star" || projectile.visual === "lance" ? 0.78 : 0.5
    );
    pveCtx.translate(projectile.x, projectile.y);
    pveCtx.rotate(angle);
    pveCtx.fillStyle = projectile.color;
    pveCtx.shadowColor = projectile.color;
    pveCtx.shadowBlur = 24;
    pveCtx.globalCompositeOperation = "lighter";
    if (projectile.visual === "card") {
      pveCtx.fillStyle = "#f7f4eb";
      pveCtx.strokeStyle = projectile.color;
      pveCtx.lineWidth = 2;
      pveCtx.fillRect(-15, -10, 30, 20);
      pveCtx.strokeRect(-15, -10, 30, 20);
      pveCtx.fillStyle = projectile.color;
      pveCtx.font = "900 9px Segoe UI";
      pveCtx.textAlign = "center";
      pveCtx.textBaseline = "middle";
      pveCtx.fillText(projectile.label, 0, 0);
    } else if (projectile.visual === "blood") {
      pveCtx.beginPath();
      pveCtx.moveTo(projectile.radius + 9, 0);
      pveCtx.lineTo(-projectile.radius, -projectile.radius * 0.62);
      pveCtx.lineTo(-projectile.radius * 0.32, 0);
      pveCtx.lineTo(-projectile.radius, projectile.radius * 0.62);
      pveCtx.closePath();
      pveCtx.fill();
    } else if (projectile.visual === "lance") {
      pveCtx.beginPath();
      pveCtx.moveTo(projectile.radius + 13, 0);
      pveCtx.lineTo(-projectile.radius, -projectile.radius * 0.42);
      pveCtx.lineTo(-projectile.radius * 0.55, 0);
      pveCtx.lineTo(-projectile.radius, projectile.radius * 0.42);
      pveCtx.closePath();
      pveCtx.fill();
    } else if (projectile.visual === "blade") {
      pveCtx.fillRect(-projectile.radius, -3, projectile.radius * 2, 6);
      pveCtx.beginPath();
      pveCtx.moveTo(projectile.radius + 8, 0);
      pveCtx.lineTo(projectile.radius - 2, -7);
      pveCtx.lineTo(projectile.radius - 2, 7);
      pveCtx.closePath();
      pveCtx.fill();
    } else if (projectile.visual === "ram") {
      pveCtx.beginPath();
      pveCtx.moveTo(projectile.radius + 8, 0);
      pveCtx.lineTo(-projectile.radius * 0.8, -projectile.radius);
      pveCtx.lineTo(-projectile.radius * 0.35, 0);
      pveCtx.lineTo(-projectile.radius * 0.8, projectile.radius);
      pveCtx.closePath();
      pveCtx.fill();
    } else if (projectile.visual === "star") {
      pveCtx.beginPath();
      for (let point = 0; point < 10; point += 1) {
        const radius = point % 2 === 0 ? projectile.radius : projectile.radius * 0.44;
        const pointAngle = -Math.PI / 2 + point * Math.PI / 5;
        const x = Math.cos(pointAngle) * radius;
        const y = Math.sin(pointAngle) * radius;
        if (point === 0) pveCtx.moveTo(x, y);
        else pveCtx.lineTo(x, y);
      }
      pveCtx.closePath();
      pveCtx.fill();
    } else {
      pveCtx.beginPath();
      pveCtx.arc(0, 0, projectile.radius, 0, Math.PI * 2);
      pveCtx.fill();
      if (projectile.visual === "pulse") {
        pveCtx.strokeStyle = "#d9fbff";
        pveCtx.lineWidth = 2;
        pveCtx.beginPath();
        pveCtx.arc(0, 0, projectile.radius + 4, 0, Math.PI * 2);
        pveCtx.stroke();
      }
    }
    pveCtx.restore();
  });
  pveGame.enemies.forEach(enemy => {
    const endgameType = ["riftReaver", "eclipseSniper", "bloodWraith", "obsidianTitan"].includes(enemy.type);
    if (enemy.boss || enemy.miniBoss) {
      pveCtx.save();
      pveCtx.strokeStyle = enemy.boss ? "#fda4af" : "#fde68a";
      pveCtx.shadowColor = enemy.boss ? "#f43f5e" : "#f59e0b";
      pveCtx.shadowBlur = 24;
      pveCtx.lineWidth = enemy.boss ? 5 : 4;
      pveCtx.beginPath();
      pveCtx.arc(enemy.x, enemy.y, enemy.radius + 10 + Math.sin(pveGame.tick * 0.1) * 3, 0, Math.PI * 2);
      pveCtx.stroke();
      pveCtx.fillStyle = enemy.boss ? "#fda4af" : "#fde68a";
      pveCtx.font = "900 12px Segoe UI";
      pveCtx.textAlign = "center";
      pveCtx.fillText(enemy.boss ? "BOSS" : "MINI BOSS", enemy.x, enemy.y - enemy.radius - 17);
      pveCtx.restore();
    }
    if (endgameType) {
      pveCtx.save();
      pveCtx.globalCompositeOperation = "lighter";
      pveCtx.strokeStyle = enemy.type === "obsidianTitan" ? "#f9fafb" : enemy.color;
      pveCtx.shadowColor = enemy.color;
      pveCtx.shadowBlur = enemy.type === "obsidianTitan" ? 34 : 24;
      pveCtx.lineWidth = enemy.type === "obsidianTitan" ? 5 : 3;
      pveCtx.setLineDash(enemy.type === "bloodWraith" ? [8, 9] : []);
      pveCtx.lineDashOffset = -pveGame.tick * 0.9;
      pveCtx.beginPath();
      pveCtx.arc(enemy.x, enemy.y, enemy.radius + 9 + Math.sin(pveGame.tick * 0.12) * 3, 0, Math.PI * 2);
      pveCtx.stroke();
      pveCtx.fillStyle = enemy.type === "obsidianTitan" ? "#f9fafb" : enemy.color;
      pveCtx.font = "900 10px Segoe UI";
      pveCtx.textAlign = "center";
      pveCtx.fillText(enemy.type === "obsidianTitan" ? "TITAN" : "ELITE", enemy.x, enemy.y - enemy.radius - 13);
      pveCtx.restore();
    }
    pveCtx.fillStyle = enemy.color;
    pveCtx.beginPath();
    pveCtx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    pveCtx.fill();
    const hpRate = clamp(enemy.hp / enemy.maxHp, 0, 1);
    pveCtx.fillStyle = "rgba(0,0,0,.65)";
    const barWidth = enemy.boss ? 130 : enemy.miniBoss ? 100 : enemy.radius * 2;
    pveCtx.fillRect(enemy.x - barWidth / 2, enemy.y + enemy.radius + 6, barWidth, enemy.boss || enemy.miniBoss ? 8 : 5);
    pveCtx.fillStyle = "#ef476f";
    pveCtx.fillRect(enemy.x - barWidth / 2, enemy.y + enemy.radius + 6, barWidth * hpRate, enemy.boss || enemy.miniBoss ? 8 : 5);
  });
  pveCtx.save();
  if (player.invulnerableTime > 0) {
    pveCtx.strokeStyle = "#8b5cf6";
    pveCtx.shadowColor = "#8b5cf6";
    pveCtx.shadowBlur = 22;
    pveCtx.lineWidth = 5;
    pveCtx.beginPath();
    pveCtx.arc(player.x, player.y, player.radius + 12, 0, Math.PI * 2);
    pveCtx.stroke();
  }
  pveCtx.fillStyle = "#3dd6d0";
  pveCtx.beginPath();
  pveCtx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  pveCtx.fill();
  pveCtx.fillStyle = "#071018";
  pveCtx.beginPath();
  pveCtx.arc(player.x + 7, player.y - 7, 5, 0, Math.PI * 2);
  pveCtx.fill();
  pveCtx.restore();
  if (pveGame.reaperActive) {
    const reaper = pveGame.reaper;
    const pulse = (reaper?.attached ? 0.5 : 0.16) + Math.sin(pveGame.reaperTicks * 0.18) * 0.06;
    pveCtx.save();
    pveCtx.fillStyle = `rgba(25, 0, 8, ${pulse})`;
    pveCtx.fillRect(0, 0, pveCanvas.width, pveCanvas.height);
    pveCtx.translate(reaper?.x ?? player.x, reaper?.y ?? Math.max(90, player.y - 135));
    pveCtx.shadowColor = "#ef4444";
    pveCtx.shadowBlur = reaper?.attached ? 52 : 32;
    pveCtx.fillStyle = "#07070a";
    pveCtx.beginPath();
    pveCtx.arc(0, 0, 48, Math.PI, 0);
    pveCtx.lineTo(60, 82);
    pveCtx.lineTo(-60, 82);
    pveCtx.closePath();
    pveCtx.fill();
    pveCtx.strokeStyle = "#ef4444";
    pveCtx.lineWidth = 4;
    pveCtx.beginPath();
    pveCtx.moveTo(-36, 12);
    pveCtx.lineTo(36, 12);
    pveCtx.stroke();
    pveCtx.rotate(-0.45 + Math.sin(pveGame.reaperTicks * 0.08) * 0.08);
    pveCtx.strokeStyle = "#f7f4eb";
    pveCtx.lineWidth = 6;
    pveCtx.beginPath();
    pveCtx.moveTo(22, 18);
    pveCtx.lineTo(82, 86);
    pveCtx.stroke();
    pveCtx.strokeStyle = "#ff426c";
    pveCtx.lineWidth = 10;
    pveCtx.beginPath();
    pveCtx.arc(74, 76, 42, Math.PI * 0.76, Math.PI * 1.56);
    pveCtx.stroke();
    pveCtx.restore();
  }
  pveGame.damageTexts.forEach(text => {
    pveCtx.globalAlpha = text.life / 45;
    pveCtx.fillStyle = text.color;
    pveCtx.font = "900 18px Segoe UI";
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
  const stepMultiplier = pveGame.speedMultiplier || 1;
  while (pveGame.accumulator >= FIXED_STEP_MS) {
    for (let step = 0; step < stepMultiplier; step += 1) {
      if (!pveGame || pveGame.over) break;
      if (pveGame.mode === "survival") stepSurvivalPve();
      else stepPve();
    }
    pveGame.accumulator -= FIXED_STEP_MS;
  }
  if (pveGame.mode === "survival") drawSurvivalPve();
  else drawPve();
  if (pveGame && !pveGame.over) pveAnimationId = requestAnimationFrame(pveLoop);
}

async function finishPve(won) {
  if (!pveGame || pveGame.over) return;
  if (pveGame.mode === "survival") {
    await finishSurvivalPve();
    return;
  }
  const completedStage = pveGame.stage;
  const completedRunId = pveGame.runId;
  const player = pveGame.player;
  const elapsed = formatBattleTime(pveGame.tick);
  pveGame.over = true;
  setResultCharacter(ui.pveResultCharacterOrb, player);
  ui.pveResultTimeTop.textContent = elapsed;
  ui.pveResultTime.textContent = elapsed;
  ui.pveResultEyebrow.textContent = won ? "MISSION COMPLETE" : "MISSION FAILED";
  ui.pveResultTitle.textContent = won ? "승리!" : "패배";
  ui.pveResultText.textContent = won ? `${completedStage} 스테이지 클리어` : `${completedStage} 공략 실패`;
  ui.pveResultPlayerName.textContent = currentUser.name;
  ui.pveResultCharacterName.textContent = player.name;
  ui.pveResultReward.textContent = won ? "정산 중" : "보상 없음";
  ui.pveResultRewardLabel.textContent = won ? "클리어 보상" : "다시 도전하세요";
  ui.pveResultDamageDealt.textContent = formatResultNumber(player.damageDealt);
  ui.pveResultDamageTaken.textContent = formatResultNumber(player.damageTaken);
  ui.pveResultHealing.textContent = formatResultNumber(player.healingDone);
  ui.pveResultHealth.textContent = `${Math.ceil(player.hp)} / ${player.maxHp}`;
  ui.pveResultOverlay.querySelector(".battle-result")?.classList.toggle("is-defeat", !won);
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
    const firstClear = data.firstClear || data.first_clear;
    ui.pveResultText.textContent = `${completedStage} 스테이지 클리어${firstClear ? " · 최초 클리어" : ""}`;
    ui.pveResultReward.textContent = `+${data.reward ?? 10}C`;
    ui.pveResultRewardLabel.textContent = firstClear ? "최초 클리어 보상" : "클리어 보상";
    await loadPveProgress();
    renderLobby();
  } catch (error) {
    ui.pveResultText.textContent = `${completedStage} 클리어 · 보상 오류`;
    ui.pveResultReward.textContent = "정산 실패";
    ui.pveResultRewardLabel.textContent = error.message;
  } finally {
    ui.pveResultButton.disabled = false;
  }
}

async function finishSurvivalPve(cleared = false) {
  if (!pveGame || pveGame.over) return;
  const player = pveGame.player;
  const elapsedSeconds = Math.floor(pveGame.tick / 60);
  const elapsed = formatBattleTime(pveGame.tick);
  const earlyIntervals = Math.floor(Math.min(elapsedSeconds, 300) / 30);
  const midIntervals = Math.floor(Math.min(Math.max(elapsedSeconds - 300, 0), 300) / 30);
  const lateIntervals = Math.floor(Math.max(elapsedSeconds - 600, 0) / 30);
  const expectedReward = Math.min(1000, earlyIntervals * 5 + midIntervals * 12
    + lateIntervals * 18 + Math.floor(elapsedSeconds / 300) * 50
    + (cleared ? 50 : 0) + pveGame.bonusCoins);
  pveGame.over = true;
  pveGame.pausedForAugment = false;
  ui.pveAugmentOverlay.classList.remove("is-active");
  ui.pveResultTimeTop.textContent = elapsed;
  ui.pveResultTime.textContent = elapsed;
  ui.pveResultEyebrow.textContent = cleared ? "VOID SURVIVED" : "SURVIVAL ENDED";
  ui.pveResultTitle.textContent = cleared ? "클리어!" : "생존 종료";
  ui.pveResultText.textContent = cleared
    ? `15분 ${pveGame.difficulty.label} 생존 성공 · LV.${pveGame.level} · ${pveGame.kills}마리 처치`
    : `${pveGame.difficulty.label} · LV.${pveGame.level} · ${pveGame.kills}마리 처치`;
  ui.pveResultPlayerName.textContent = currentUser.name;
  ui.pveResultCharacterName.textContent = "균열 생존자";
  ui.pveResultCharacterOrb.textContent = "M";
  ui.pveResultCharacterOrb.style.setProperty("--result-color", "#3dd6d0");
  ui.pveResultCharacterOrb.style.setProperty("--result-accent", "#67e8f9");
  ui.pveResultReward.textContent = `+${expectedReward}C`;
  ui.pveResultRewardLabel.textContent = cleared ? "15분 클리어 보상 포함" : "생존 시간 보상 정산 중";
  ui.pveResultDamageDealt.textContent = formatResultNumber(player.damageDealt);
  ui.pveResultDamageTaken.textContent = formatResultNumber(player.damageTaken);
  ui.pveResultHealing.textContent = formatResultNumber(player.healingDone);
  ui.pveResultHealth.textContent = `0 / ${Math.ceil(player.maxHp)}`;
  ui.pveResultButton.textContent = "다시 준비하기";
  ui.pveResultOverlay.querySelector(".battle-result")?.classList.toggle("is-defeat", !cleared);
  ui.pveResultOverlay.classList.add("is-active");

  if (!pveGame.runId) {
    ui.pveResultRewardLabel.textContent = "서버 SQL 적용 후 보상이 저장됩니다";
    return;
  }
  ui.pveResultButton.disabled = true;
  try {
    let data;
    try {
      data = await rpc("complete_survival_run", {
        session_token: appSessionToken,
        run_id: pveGame.runId,
        client_seconds: elapsedSeconds,
        bonus_coins: pveGame.bonusCoins,
        damage_dealt: Math.floor(player.damageDealt || 0)
      });
    } catch {
      data = await rpc("complete_pve_run", {
        session_token: appSessionToken,
        run_id: pveGame.runId
      });
    }
    currentUser = normalizePlayer(data.user);
    players = players.map(item => item.id === currentUser.id ? currentUser : item);
    ui.pveResultReward.textContent = `+${data.reward ?? expectedReward}C`;
    ui.pveResultRewardLabel.textContent = cleared ? "15분 클리어 보상 포함" : "생존 시간 보상";
    renderLobby();
  } catch (error) {
    ui.pveResultRewardLabel.textContent = `보상 저장 실패: ${error.message}`;
  } finally {
    ui.pveResultButton.disabled = false;
  }
}

function stopPveGame() {
  if (pveAnimationId) cancelAnimationFrame(pveAnimationId);
  pveAnimationId = null;
  ui.pveAwakeningOverlay?.classList.remove("is-active");
  ui.pveAwakeningOverlay?.setAttribute("aria-hidden", "true");
  pveGame = null;
}

function returnToPveSelect() {
  stopPveGame();
  ui.pveResultOverlay.classList.remove("is-active");
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
  ui.resultBox.classList.remove("is-promotion", "is-defeat");
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
  setAccountModalOpen(false);
  showScreen("auth");
}

ui.loginButton.addEventListener("click", () => authenticate("login"));
window.addEventListener("pagehide", abandonMatchPresence);
ui.logoutButton.addEventListener("click", logout);
ui.accountSettingsButton.addEventListener("click", () => setAccountModalOpen(true));
ui.accountModalCloseButton.addEventListener("click", () => setAccountModalOpen(false));
ui.accountCancelButton.addEventListener("click", () => setAccountModalOpen(false));
ui.accountSaveButton.addEventListener("click", saveAccountChanges);
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
[ui.accountCurrentUsername, ui.accountCurrentPassword, ui.accountNewUsername, ui.accountNewPassword, ui.accountNewPasswordConfirm].forEach(input => {
  input.addEventListener("keydown", event => {
    if (event.key === "Enter") saveAccountChanges();
  });
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
ui.rankedMatchButton?.addEventListener("click", () => startMatchmaking("ranked"));
ui.casualMatchButton?.addEventListener("click", () => startMatchmaking("casual"));
ui.backFromPvpQueueButton?.addEventListener("click", () => {
  ui.pvpModeButton.classList.remove("is-selected");
  renderLobby();
  showScreen("lobby");
});
ui.matchSoundVolume?.addEventListener("input", () => {
  soundSettings.matchVolume = Math.max(0, Math.min(1, Number(ui.matchSoundVolume.value) / 100));
  saveSoundSettings();
  updateSoundSettingsUi();
});
ui.testMatchSoundButton?.addEventListener("click", playMatchFoundSound);
ui.cancelMatchButton.addEventListener("click", cancelMatchmaking);
ui.pveModeButton.addEventListener("click", selectPveMode);
ui.pveDifficultyButtons.forEach(button => {
  button.addEventListener("click", () => selectSurvivalDifficulty(button.dataset.pveDifficulty));
});
ui.backFromPveButton.addEventListener("click", () => {
  stopPveGame();
  renderLobby();
  showScreen("lobby");
});
ui.pveStageButtons.forEach(button => {
  button.addEventListener("click", () => {
    selectedPveMapStage = button.dataset.pveStage;
    renderPveWorldMap();
  });
});
ui.pveStageStartButton.addEventListener("click", () => {
  ui.pveStageStartButton.disabled = true;
  startPveStage("survival").finally(() => {
    ui.pveStageStartButton.disabled = false;
  });
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
ui.codexTypeButtons.forEach(button => {
  button.addEventListener("click", () => setCodexType(button.dataset.codexType));
});
ui.normalSkillButton.addEventListener("click", () => useSkill("normal"));
ui.ultimateSkillButton.addEventListener("click", () => useSkill("ultimate"));
ui.pveNormalSkillButton.addEventListener("click", () => usePveSkill("normal"));
ui.pveUltimateSkillButton.addEventListener("click", () => usePveSkill("ultimate"));
ui.pveAugmentReroll.addEventListener("click", rerollSurvivalAugments);
ui.pveSpeedButtons?.forEach(button => {
  button.addEventListener("click", () => setPveSpeed(Number(button.dataset.pveSpeed)));
});
ui.rankingModeButtons?.forEach(button => {
  button.addEventListener("click", () => {
    rankingMode = button.dataset.rankingMode === "pve" ? "pve" : "pvp";
    loadRankings();
  });
});
document.addEventListener("keydown", event => {
  if (screens.pveBattle.classList.contains("is-active") && pveGame) {
    if (pveGame.mode === "survival") return;
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

updateSoundSettingsUi();

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

