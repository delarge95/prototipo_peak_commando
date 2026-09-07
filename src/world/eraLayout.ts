// ============================================================
// PEAK COMMANDO — Layout de Era con Sockets de Mazmorra
// Define la estructura base de cada era con 12 sockets candidatos
// ============================================================

import { GAME_CONFIG, Vec3 } from '../game/config';

export type EraId = 'prehistoria' | 'medieval' | 'oeste' | 'moderna' | 'futuro';

export type DungeonArchetype =
  | 'exterminio'
  | 'fortaleza'
  | 'sigilo'
  | 'era'
  | 'legendaria';

export type DungeonDifficulty =
  | 'easy'
  | 'medium'
  | 'hard';

export interface DungeonSocket {
  id: string;
  position: Vec3;
  difficultyBias: Record<DungeonDifficulty, number>;
  archetypeBias?: Partial<Record<DungeonArchetype, number>>;
}

export interface EraLayout {
  era: EraId;
  spawn: Vec3;
  exit: Vec3;
  bossPosition: Vec3;
  dungeonSockets: DungeonSocket[];
}

function socket(
  id: string,
  x: number,
  z: number,
  difficultyBias: Record<DungeonDifficulty, number>,
  archetypeBias?: Partial<Record<DungeonArchetype, number>>
): DungeonSocket {
  return {
    id,
    position: { x, y: 0, z },
    difficultyBias,
    archetypeBias,
  };
}

/**
 * Layout base de una era.
 * A = spawn (sur).
 * B = jefe/salida (norte).
 * 12 sockets distribuidos en el mapa semiabierto.
 */
export function createEraLayout(era: EraId): EraLayout {
  return {
    era,
    spawn: { ...GAME_CONFIG.world.spawn },
    exit: { ...GAME_CONFIG.world.exit },
    bossPosition: { x: 0, y: 0, z: 720 },

    dungeonSockets: [
      // Fila sur (cerca del spawn)
      socket('socket_01', -280, -560, { easy: 0.6, medium: 0.3, hard: 0.1 }),
      socket('socket_02', 0, -560, { easy: 0.7, medium: 0.25, hard: 0.05 }),
      socket('socket_03', 280, -560, { easy: 0.55, medium: 0.35, hard: 0.1 }),

      // Fila centro-sur
      socket('socket_04', -380, -320, { easy: 0.25, medium: 0.55, hard: 0.2 }),
      socket('socket_05', 0, -320, { easy: 0.4, medium: 0.5, hard: 0.1 }),
      socket('socket_06', 380, -320, { easy: 0.2, medium: 0.55, hard: 0.25 }),

      // Fila centro-norte
      socket('socket_07', -380, -80, { easy: 0.15, medium: 0.55, hard: 0.3 }),
      socket('socket_08', 380, -80, { easy: 0.1, medium: 0.5, hard: 0.4 }),

      // Fila norte (cerca del jefe)
      socket('socket_09', -380, 160, { easy: 0.1, medium: 0.45, hard: 0.45 }),
      socket('socket_10', 0, 160, { easy: 0.2, medium: 0.55, hard: 0.25 }),
      socket('socket_11', 380, 160, { easy: 0.1, medium: 0.4, hard: 0.5 }),

      // Socket final (muy cerca del jefe, difícil)
      socket('socket_12', 0, 400, { easy: 0.05, medium: 0.35, hard: 0.6 }),
    ],
  };
}
