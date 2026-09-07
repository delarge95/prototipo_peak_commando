// ============================================================
// PEAK COMMANDO — Selección de Mazmorras
// Selecciona mazmorras activas y asigna arquetipos/dificultad
// No amarra rutas específicas a arquetipos específicos.
// ============================================================

import {
  DungeonArchetype,
  DungeonDifficulty,
  DungeonSocket,
  EraLayout,
} from '../world/eraLayout';

export interface AssignedDungeon {
  socket: DungeonSocket;
  archetype: DungeonArchetype;
  difficulty: DungeonDifficulty;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(array: T[], rng: () => number): T[] {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function pickWeighted(
  weights: Record<string, number>,
  rng: () => number
): string {
  const entries = Object.entries(weights);
  const total = entries.reduce((acc, [, value]) => acc + value, 0);

  let roll = rng() * total;

  for (const [key, value] of entries) {
    roll -= value;
    if (roll <= 0) {
      return key;
    }
  }

  return entries[0][0];
}

/**
 * Selecciona mazmorras activas y asigna arquetipos.
 * Garantiza variedad mínima: al menos una de cada tipo base.
 */
export function assignDungeons(
  layout: EraLayout,
  seed: number,
  activeCount = 8
): AssignedDungeon[] {
  const rng = mulberry32(seed);

  const selectedSockets = shuffle(layout.dungeonSockets, rng).slice(
    0,
    Math.min(activeCount, layout.dungeonSockets.length)
  );

  const archetypes: DungeonArchetype[] = [];

  // Garantizar variedad mínima.
  archetypes.push('exterminio');
  archetypes.push('fortaleza');
  archetypes.push('sigilo');

  if (layout.era && Math.random() < 1) {
    archetypes.push('era');
  }

  if (rng() < 0.08) {
    archetypes.push('legendaria');
  }

  while (archetypes.length < selectedSockets.length) {
    const roll = rng();

    if (roll < 0.35) {
      archetypes.push('exterminio');
    } else if (roll < 0.65) {
      archetypes.push('fortaleza');
    } else if (roll < 0.9) {
      archetypes.push('sigilo');
    } else {
      archetypes.push('era');
    }
  }

  const shuffledArchetypes = shuffle(archetypes, rng);

  return selectedSockets.map((socket, index) => {
    const difficulty = pickWeighted(
      socket.difficultyBias,
      rng
    ) as DungeonDifficulty;

    return {
      socket,
      archetype: shuffledArchetypes[index],
      difficulty,
    };
  });
}
