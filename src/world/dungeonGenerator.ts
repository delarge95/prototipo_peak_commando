// ============================================================
// PEAK COMMANDO — Generador de Mazmorras Multi-Habitación
// Genera mazmorras con 2-6 habitaciones conectadas
// Tipos: campamentos, fortalezas, ruinas, nidos, instalaciones
// Tamaño mínimo 10x mayor que las mazmorras originales
// ============================================================

import { EraDef } from '../game/eras';
import { DungeonArchetype, DungeonDifficulty } from '../world/eraLayout';

export type RoomDef = {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  type: 'entrance' | 'corridor' | 'main' | 'treasure' | 'boss' | 'tower' | 'courtyard' | 'crypt';
  rotation: number;
  hasRoof: boolean;
  hasWalls: boolean;
};

export interface DungeonLayout {
  rooms: RoomDef[];
  connections: Array<{ from: number; to: number; type: 'door' | 'arch' | 'bridge' | 'ramp' }>;
  entrance: RoomDef;
  exit?: RoomDef;
  archetype: DungeonArchetype;
  difficulty: DungeonDifficulty;
}

const ROOM_SIZES = {
  small: { min: 18, max: 26 },
  medium: { min: 28, max: 40 },
  large: { min: 42, max: 60 },
  huge: { min: 65, max: 90 },
  massive: { min: 95, max: 130 },
};

const NUM_ROOMS_BY_DIFFICULTY = {
  easy: { min: 2, max: 3 },
  medium: { min: 3, max: 4 },
  hard: { min: 4, max: 5 },
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Genera una disposición de habitaciones para una mazmorra.
 * @param numRooms Número de habitaciones (2-6)
 * @param baseX Posición X base de la mazmorra
 * @param baseZ Posición Z base de la mazmorra
 * @param archetype Tipo de mazmorra (afecta layout)
 * @param difficulty Dificultad (afecta tamaño y número de habitaciones)
 */
export function generateDungeonLayout(
  numRooms: number,
  baseX: number,
  baseZ: number,
  archetype: DungeonArchetype,
  difficulty: DungeonDifficulty,
  rng: () => number
): DungeonLayout {
  const rooms: RoomDef[] = [];
  const connections: Array<{ from: number; to: number; type: 'door' | 'arch' | 'bridge' | 'ramp' }> = [];
  
  // Determinar número de habitaciones según dificultad
  const roomRange = NUM_ROOMS_BY_DIFFICULTY[difficulty];
  const targetRooms = Math.max(
    roomRange.min,
    Math.min(roomRange.max, numRooms)
  );
  
  // Las legendarias tienen 1-2 habitaciones extra
  if (archetype === 'legendaria') {
    numRooms = targetRooms + 1 + Math.floor(rng() * 2);
  } else {
    numRooms = targetRooms;
  }
  
  // Determinar tamaño base según dificultad
  let sizeMultiplier = 1;
  if (difficulty === 'hard') sizeMultiplier = 1.5;
  else if (difficulty === 'medium') sizeMultiplier = 1.25;
  
  // Las legendarias son MASSIVE
  if (archetype === 'legendaria') {
    sizeMultiplier *= 1.8;
  }
  
  // Dirección principal de expansión
  const primaryAxis = rng() > 0.5 ? 'z' : 'x';
  const secondaryAxis = primaryAxis === 'z' ? 'x' : 'z';
  
  // ==================== HABITACIÓN DE ENTRADA ====================
  const entranceSize = lerp(ROOM_SIZES.medium.min, ROOM_SIZES.medium.max, rng()) * sizeMultiplier;
  rooms.push({
    x: baseX,
    z: baseZ,
    width: entranceSize,
    depth: entranceSize,
    height: lerp(6, 12, rng()),
    type: 'entrance',
    rotation: 0,
    hasRoof: archetype !== 'exterminio' && rng() > 0.3,
    hasWalls: archetype === 'fortaleza' || archetype === 'sigilo' || rng() > 0.4,
  });
  
  // ==================== GENERAR HABITACIONES RESTANTES ====================
  let currentRoom = 0;
  let positionOffset = { x: 0, z: 0 };
  let cumulativeRotation = 0;
  
  for (let i = 1; i < numRooms; i++) {
    const isLast = i === numRooms - 1;
    const isMain = i === Math.floor(numRooms / 2);
    
    // Rotación acumulativa para crear patrones interesantes
    if (i > 1 && rng() > 0.6) {
      cumulativeRotation += (rng() > 0.5 ? 1 : -1) * (Math.PI / 4);
    }
    
    // Determinar tamaño y tipo de habitación
    let roomSize: number;
    let roomType: RoomDef['type'] = 'corridor';
    let roomHeight = lerp(5, 10, rng());
    let hasRoof = archetype !== 'exterminio' && rng() > 0.25;
    let hasWalls = archetype === 'fortaleza' || archetype === 'sigilo' || rng() > 0.35;
    
    if (isLast && archetype === 'exterminio') {
      // Arena final para exterminio
      roomSize = lerp(ROOM_SIZES.huge.min, ROOM_SIZES.huge.max, rng()) * sizeMultiplier;
      roomType = 'main';
      roomHeight = lerp(4, 8, rng());
      hasRoof = false;
      hasWalls = rng() > 0.5;
    } else if (isLast && archetype === 'fortaleza') {
      // Torre del homenaje o patio final
      roomType = rng() > 0.5 ? 'tower' : 'courtyard';
      roomSize = lerp(ROOM_SIZES.large.min, ROOM_SIZES.large.max, rng()) * sizeMultiplier * (roomType === 'tower' ? 0.7 : 1.3);
      roomHeight = roomType === 'tower' ? lerp(20, 35, rng()) : lerp(4, 8, rng());
      hasRoof = roomType === 'tower' && rng() > 0.3;
      hasWalls = roomType === 'courtyard';
    } else if (isLast && archetype === 'sigilo') {
      // Cripta o cámara del tesoro
      roomType = 'crypt';
      roomSize = lerp(ROOM_SIZES.large.min, ROOM_SIZES.large.max, rng()) * sizeMultiplier;
      roomHeight = lerp(8, 15, rng());
      hasRoof = true;
      hasWalls = true;
    } else if (isLast) {
      // Habitación principal estándar
      roomSize = lerp(ROOM_SIZES.large.min, ROOM_SIZES.large.max, rng()) * sizeMultiplier;
      roomType = 'main';
    } else if (archetype === 'legendaria' && isLast) {
      // Cámara del tesoro legendaria
      roomSize = lerp(ROOM_SIZES.massive.min, ROOM_SIZES.massive.max, rng()) * sizeMultiplier;
      roomType = 'treasure';
      roomHeight = lerp(15, 25, rng());
      hasRoof = true;
      hasWalls = true;
    } else if (isMain) {
      // Habitación intermedia principal
      roomSize = lerp(ROOM_SIZES.medium.min, ROOM_SIZES.medium.max, rng()) * sizeMultiplier * 1.15;
      roomType = 'main';
    } else {
      // Habitaciones de conexión
      roomSize = lerp(ROOM_SIZES.small.min, ROOM_SIZES.small.max, rng()) * sizeMultiplier;
      roomType = 'corridor';
    }
    
    // Calcular posición con rotación aplicada
    const gap = lerp(4, 12, rng());
    const prevRoom = rooms[currentRoom];
    
    let newX = positionOffset.x;
    let newZ = positionOffset.z;
    
    if (primaryAxis === 'z') {
      newZ += prevRoom.depth / 2 + gap + roomSize / 2;
      // Variación lateral
      const lateralOffset = (rng() - 0.5) * roomSize * 0.7;
      newX = positionOffset.x + lateralOffset * Math.cos(cumulativeRotation);
      newZ += lateralOffset * Math.sin(cumulativeRotation);
    } else {
      newX += prevRoom.width / 2 + gap + roomSize / 2;
      const lateralOffset = (rng() - 0.5) * roomSize * 0.7;
      newZ = positionOffset.z + lateralOffset * Math.cos(cumulativeRotation);
      newX += lateralOffset * Math.sin(cumulativeRotation);
    }
    
    positionOffset = { x: newX, z: newZ };
    
    rooms.push({
      x: baseX + positionOffset.x,
      z: baseZ + positionOffset.z,
      width: roomSize,
      depth: roomSize,
      height: roomHeight,
      type: roomType,
      rotation: cumulativeRotation,
      hasRoof,
      hasWalls,
    });
    
    // Determinar tipo de conexión
    let connectionType: 'door' | 'arch' | 'bridge' | 'ramp' = 'door';
    if (archetype === 'fortaleza' && rng() > 0.6) connectionType = 'arch';
    else if (rooms[currentRoom].height !== roomHeight && Math.abs(rooms[currentRoom].height - roomHeight) > 3) {
      connectionType = 'ramp';
    } else if (rng() > 0.7) {
      connectionType = 'bridge';
    }
    
    connections.push({ from: currentRoom, to: i, type: connectionType });
    currentRoom = i;
  }
  
  // ==================== HABITACIONES ESPECIALES POR ARQUETIPO ====================
  
  // FORTALEZA: Torres defensivas laterales
  if (archetype === 'fortaleza' && numRooms >= 3 && rng() > 0.3) {
    const numTowers = 1 + Math.floor(rng() * 2);
    for (let t = 0; t < numTowers; t++) {
      const parentIdx = 1 + Math.floor(rng() * (numRooms - 2));
      const parentRoom = rooms[parentIdx];
      const towerSize = lerp(ROOM_SIZES.small.min, ROOM_SIZES.small.max, rng()) * sizeMultiplier * 0.6;
      
      const offsetAngle = (t / numTowers) * Math.PI + (rng() - 0.5) * 0.5;
      const distance = parentRoom.width / 2 + 8 + towerSize / 2;
      const towerX = parentRoom.x + Math.cos(offsetAngle) * distance;
      const towerZ = parentRoom.z + Math.sin(offsetAngle) * distance;
      
      rooms.push({
        x: towerX,
        z: towerZ,
        width: towerSize,
        depth: towerSize,
        height: lerp(18, 30, rng()),
        type: 'tower',
        rotation: offsetAngle,
        hasRoof: rng() > 0.4,
        hasWalls: true,
      });
      
      connections.push({ from: parentIdx, to: rooms.length - 1, type: 'bridge' });
    }
  }
  
  // SIGILO: Ramificaciones ocultas
  if (archetype === 'sigilo' && numRooms >= 3 && rng() > 0.25) {
    const parentIdx = Math.floor(numRooms / 2);
    const parentRoom = rooms[parentIdx];
    const branchSize = lerp(ROOM_SIZES.small.min, ROOM_SIZES.small.max, rng()) * sizeMultiplier * 0.65;
    
    const branchAngle = (rng() - 0.5) * Math.PI;
    const distance = parentRoom.width / 2 + 6 + branchSize / 2;
    const branchX = parentRoom.x + Math.cos(branchAngle) * distance;
    const branchZ = parentRoom.z + Math.sin(branchAngle) * distance;
    
    rooms.push({
      x: branchX,
      z: branchZ,
      width: branchSize,
      depth: branchSize,
      height: lerp(6, 12, rng()),
      type: 'crypt',
      rotation: branchAngle,
      hasRoof: true,
      hasWalls: true,
    });
    
    connections.push({ from: parentIdx, to: rooms.length - 1, type: 'door' });
  }
  
  // EXTERMINIO: Patio de arena adicional
  if (archetype === 'exterminio' && numRooms >= 2 && rng() > 0.4) {
    const parentIdx = 0;
    const parentRoom = rooms[parentIdx];
    const arenaSize = lerp(ROOM_SIZES.large.min, ROOM_SIZES.large.max, rng()) * sizeMultiplier * 0.9;
    
    const arenaX = parentRoom.x + (rng() > 0.5 ? 1 : -1) * (parentRoom.width / 2 + 10 + arenaSize / 2);
    const arenaZ = parentRoom.z + (rng() - 0.5) * arenaSize * 0.5;
    
    rooms.push({
      x: arenaX,
      z: arenaZ,
      width: arenaSize,
      depth: arenaSize,
      height: lerp(3, 6, rng()),
      type: 'courtyard',
      rotation: 0,
      hasRoof: false,
      hasWalls: rng() > 0.3,
    });
    
    connections.push({ from: parentIdx, to: rooms.length - 1, type: 'arch' });
  }
  
  // LEGENDARIA: Cámaras adicionales del tesoro
  if (archetype === 'legendaria' && numRooms >= 4) {
    const numBonus = 1 + Math.floor(rng() * 2);
    for (let b = 0; b < numBonus; b++) {
      const parentIdx = Math.floor((b + 1) * (numRooms / (numBonus + 1)));
      const parentRoom = rooms[Math.min(parentIdx, numRooms - 1)];
      const vaultSize = lerp(ROOM_SIZES.medium.min, ROOM_SIZES.medium.max, rng()) * sizeMultiplier * 0.7;
      
      const vaultAngle = (b / numBonus) * Math.PI * 2;
      const distance = parentRoom.width / 2 + 12 + vaultSize / 2;
      const vaultX = parentRoom.x + Math.cos(vaultAngle) * distance;
      const vaultZ = parentRoom.z + Math.sin(vaultAngle) * distance;
      
      rooms.push({
        x: vaultX,
        z: vaultZ,
        width: vaultSize,
        depth: vaultSize,
        height: lerp(10, 18, rng()),
        type: 'treasure',
        rotation: vaultAngle,
        hasRoof: true,
        hasWalls: true,
      });
      
      connections.push({ from: Math.min(parentIdx, numRooms - 1), to: rooms.length - 1, type: 'door' });
    }
  }
  
  return {
    rooms,
    connections,
    entrance: rooms[0],
    exit: rooms[rooms.length - 1],
    archetype,
    difficulty,
  };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

/**
 * Calcula los límites totales de la mazmorra
 */
export function getDungeonBounds(layout: DungeonLayout): { minX: number; maxX: number; minZ: number; maxZ: number } {
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  
  for (const room of layout.rooms) {
    const halfW = room.width / 2;
    const halfD = room.depth / 2;
    
    minX = Math.min(minX, room.x - halfW);
    maxX = Math.max(maxX, room.x + halfW);
    minZ = Math.min(minZ, room.z - halfD);
    maxZ = Math.max(maxZ, room.z + halfD);
  }
  
  return { minX, maxX, minZ, maxZ };
}

/**
 * Obtiene puntos de spawn para enemigos dentro de la mazmorra
 */
export function getEnemySpawnPoints(layout: DungeonLayout, rng: () => number): Array<{ x: number; z: number }> {
  const spawns: Array<{ x: number; z: number }> = [];
  
  // Excluir la habitación de entrada para spawns
  for (let i = 1; i < layout.rooms.length; i++) {
    const room = layout.rooms[i];
    const margin = 3;
    const usableWidth = room.width - margin * 2;
    const usableDepth = room.depth - margin * 2;
    
    // 1-3 spawns por habitación dependiendo del tamaño
    const numSpawns = Math.floor((room.width * room.depth) / 400) + 1;
    
    for (let s = 0; s < numSpawns; s++) {
      spawns.push({
        x: room.x + (rng() - 0.5) * usableWidth,
        z: room.z + (rng() - 0.5) * usableDepth,
      });
    }
  }
  
  return spawns;
}

/**
 * Obtiene posiciones para cofres/recompensas
 */
export function getTreasurePositions(layout: DungeonLayout): Array<{ x: number; z: number; type: 'main' | 'hidden' }> {
  const treasures: Array<{ x: number; z: number; type: 'main' | 'hidden' }> = [];
  
  // Tesoro principal en la última habitación
  if (layout.exit) {
    treasures.push({
      x: layout.exit.x,
      z: layout.exit.z + layout.exit.depth * 0.25,
      type: 'main',
    });
  }
  
  // Tesoros ocultos en habitaciones intermedias (50% chance)
  for (let i = 1; i < layout.rooms.length - 1; i++) {
    if (Math.random() > 0.5) {
      const room = layout.rooms[i];
      treasures.push({
        x: room.x + (room.width * 0.3) * (Math.random() > 0.5 ? 1 : -1),
        z: room.z - room.depth * 0.3,
        type: 'hidden',
      });
    }
  }
  
  return treasures;
}
