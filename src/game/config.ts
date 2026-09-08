// ============================================================
// PEAK COMMANDO — Configuración General
// Valores numéricos centrales del diseño
// ============================================================

export const GAME_CONFIG = {
  maxPlayers: 9,

  prototype: {
    botsDefault: 3,
    allowBots: true,
  },

  movement: {
    walkSpeed: 5.5,
    runSpeed: 11.0,
    crouchSpeed: 2.8,
    crawlSpeed: 1.5,

    staminaMax: 200,
    sprintStaminaPerSec: 14,
    jumpStaminaCost: 20,
    climbStaminaPerSec: 22,
    staminaRegenPerSec: 28,

    fallDamageStart: 6,
    fallDamageLethal: 12,
  },

  camera: {
    defaultMode: 'third' as 'third' | 'first',
    allowToggle: true,
    thirdPersonDistance: 7.5,
    sensitivity: 0.0022,
  },

  inventory: {
    weaponSlots: 8,
    consumableSlots: 4,
  },

  world: {
    mapLength: 2400,
    mapWidth: 1100,

    spawn: { x: 0, y: 0, z: -720 },
    exit: { x: 0, y: 0, z: 720 },

    mainPathLength: 1440,
    naturalBorders: true,
  },

  routes: {
    minLanes: 3,
    crossLinks: true,
    irreversibleDrops: true,
    optionalReturn: true,
  },

  dungeons: {
    candidateSockets: 12,
    activeDungeons: 8,
    spacing: 160,
    crossPathMax: 320,
    legendaryChance: 0.08,
    eraDungeonRequired: true,
  },

  time: {
    initial: 420,
    max: 999,

    fragmentDeposit: 8,
    fragmentScore: 10,

    controlBase: 60,
    controlPerFragment: 4,
    controlScoreStep: 250,

    bossRewardHalfMax: true,

    upgradeShopPauses: true,
  },

  score: {
    fragment: 10,
    normalEnemy: 5,
    specialEnemy: 15,
    miniBoss: 50,
    dungeon: 100,
    boss: 250,
    prank: 5,
  },

  revive: {
    downedBleedout: 45,
    reviveDuration: 3,
    deadReviveUsesControlPoint: true,
  },

  cheats: {
    enable: true,
  },
} as const;

export type Vec3 = {
  x: number;
  y: number;
  z: number;
};
