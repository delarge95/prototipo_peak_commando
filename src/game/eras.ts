// ============================================================
// PEAK COMMANDO — Definiciones de Era (data-driven)
// Equivalente en Unity: EraDefinition : ScriptableObject
// Cada era aporta: paleta de blocking, props, armas, enemigos,
// jefe, nombres de mazmorras y líneas de muerte absurdas.
// ============================================================

import { ItemType } from './items';

export type WeaponDef = {
  name: string;
  dmg: number;
  range: number;
  rate: number; // segundos entre golpes
  color: number;
  len: number;
  itemId?: ItemType;
};

export type EnemyDef = {
  name: string;
  color: number;
  size: number;
  hp: number;
  dmg: number;
  speed: number;
};

export type EraDef = {
  id: number;
  numeral: string;
  name: string;
  short: string;
  contexts: string[];
  sky: number;
  fog: number;
  light: number;
  groundTop: number;
  groundTop2: number;
  groundSide: number;
  accent: number;
  propStyle: "jungle" | "medieval" | "west" | "modern" | "future";
  weapons: WeaponDef[];
  enemies: EnemyDef[]; // normales (rojos / naranjas)
  brute: EnemyDef & { detect: number }; // el durmiente de la mazmorra de sigilo
  boss: { name: string; color: number; size: number; hp: number; dmg: number };
  dungeonNames: [string, string, string]; // fácil / media / difícil
  dungeonTypes: ["arena", "stealth", "fortress"];
  ambient: "ash" | "leaf" | "sand" | "rain" | "neon";
  ambientColor: number;
  killLines: string[];
  flavor: string;
};

export const CONSUMABLES = [
  { key: "1", name: "Cáscara de plátano", desc: "Tírala y reza. Resbala enemigos, aliados… y a ti." },
  { key: "2", name: "Granada fétida", desc: "Atrae a todos los enemigos del área durante 6 s." },
  { key: "3", name: "Adrenalina", desc: "+50% velocidad durante 6 s. El corazón aguanta lo que quiera." },
  { key: "4", name: "Queso apestoso", desc: "Atrae enemigos medievales. Huele mal pero funciona." },
  { key: "5", name: "Dinamita", desc: "Explosivo clásico. Cuenta atrás incluida." },
  { key: "6", name: "Batería portátil", desc: "+15 segundos al cronómetro." },
] as const;

export const ERAS: EraDef[] = [
  {
    id: 0,
    numeral: "I",
    name: "ERA PREHISTÓRICA",
    short: "Prehistoria",
    contexts: ["Selva de Helechos", "Valle Volcánico", "Glaciar de Huesos"],
    sky: 0x8fbf9f,
    fog: 0x8fbf9f,
    light: 0xfff3d6,
    groundTop: 0x4d7a3a,
    groundTop2: 0x578a42,
    groundSide: 0x6b4a2f,
    accent: 0xff7a1a,
    propStyle: "jungle",
    weapons: [
      { name: "Garrote del Alba", dmg: 16, range: 2.3, rate: 0.5, color: 0x8a5a33, len: 1.1 },
      { name: "Lanza de Hueso", dmg: 14, range: 3.1, rate: 0.6, color: 0xe8e0c8, len: 1.6 },
      { name: "Hacha de Piedra", dmg: 23, range: 2.1, rate: 0.78, color: 0x8a8f8a, len: 1.0 },
      { name: "Antorcha Rugiente", dmg: 12, range: 2.5, rate: 0.45, color: 0xff7a1a, len: 1.0 },
    ],
    enemies: [
      { name: "Raptor", color: 0xe23b2e, size: 1.05, hp: 42, dmg: 10, speed: 4.3 },
      { name: "Dientes de Sable", color: 0xff7a1a, size: 1.3, hp: 58, dmg: 14, speed: 4.8 },
    ],
    brute: { name: "Ogro de las Cavernas", color: 0xb02818, size: 2.1, hp: 150, dmg: 32, speed: 5.6, detect: 7 },
    boss: { name: "REXÓN, TIRANO DEL VALLE", color: 0xd1271c, size: 4.4, hp: 430, dmg: 30 },
    dungeonNames: ["Cueva de Huesos", "Madriguera Veloz", "Fortaleza del Volcán"],
    dungeonTypes: ["arena", "stealth", "fortress"],
    ambient: "ash",
    ambientColor: 0x3d332a,
    killLines: [
      "mandó al raptor de vuelta al Cretácico",
      "convirtió a Dientes de Sable en alfombra",
      "le explicó la cadena alimenticia al revés",
      "hizo sopa de dinosaurio en 3 golpes",
    ],
    flavor: "La era donde el fuego era tecnología punta.",
  },
  {
    id: 1,
    numeral: "II",
    name: "ERA MEDIEVAL",
    short: "Medievo",
    contexts: ["Reino de Ceniza", "Bosque del Rey Loco", "Tierras del Pacto Roto"],
    sky: 0x9aa7c7,
    fog: 0x9aa7c7,
    light: 0xf4f0ff,
    groundTop: 0x4f6b3f,
    groundTop2: 0x59764a,
    groundSide: 0x5a5f66,
    accent: 0xd4a62a,
    propStyle: "medieval",
    weapons: [
      { name: "Espada de Acero", dmg: 18, range: 2.7, rate: 0.55, color: 0xc9ced6, len: 1.4 },
      { name: "Hacha de Guerra", dmg: 27, range: 2.2, rate: 0.82, color: 0x8a8f8a, len: 1.2 },
      { name: "Maza Bendita", dmg: 21, range: 2.4, rate: 0.66, color: 0xd4a62a, len: 1.1 },
      { name: "Lanza de Torneo", dmg: 16, range: 3.5, rate: 0.7, color: 0x8a5a33, len: 1.9 },
    ],
    enemies: [
      { name: "Escudero Esqueleto", color: 0xe23b2e, size: 1.0, hp: 48, dmg: 11, speed: 3.9 },
      { name: "Orco Saqueador", color: 0xff7a1a, size: 1.4, hp: 74, dmg: 16, speed: 4.2 },
    ],
    brute: { name: "Gólem de la Cripta", color: 0xa32618, size: 2.3, hp: 180, dmg: 36, speed: 5.0, detect: 6.5 },
    boss: { name: "COLOSO CABALLERO NEGRO", color: 0xc01f14, size: 4.2, hp: 500, dmg: 34 },
    dungeonNames: ["Ermita en Ruinas", "Torre del Centinela", "Cripta del Dragón"],
    dungeonTypes: ["arena", "stealth", "fortress"],
    ambient: "leaf",
    ambientColor: 0x6f8f4e,
    killLines: [
      "envió al escudero a la otra cruzada",
      "partió al orco como pan de hogaza",
      "declaró nulo el contrato feudal a golpes",
      "le dio el último sacramento, con maza",
    ],
    flavor: "Honor, acero y un dragón que no pidió permiso.",
  },
  {
    id: 2,
    numeral: "III",
    name: "VIEJO OESTE",
    short: "Oeste",
    contexts: ["Cañón del Buitre", "Pueblo Polvoriento", "Llanura de los Forajidos"],
    sky: 0xe8b56a,
    fog: 0xe8b56a,
    light: 0xfff0d0,
    groundTop: 0xc9974f,
    groundTop2: 0xd1a05a,
    groundSide: 0x8a5a33,
    accent: 0xa33b2a,
    propStyle: "west",
    weapons: [
      { name: "Culata de Revólver", dmg: 15, range: 2.2, rate: 0.4, color: 0x7a5230, len: 0.8 },
      { name: "Cuchillo Búfalo", dmg: 20, range: 2.1, rate: 0.5, color: 0xc9ced6, len: 0.9 },
      { name: "Hierro de Marcar", dmg: 18, range: 2.4, rate: 0.6, color: 0xff7a1a, len: 1.0 },
      { name: "Tronco de Escopeta", dmg: 24, range: 2.5, rate: 0.72, color: 0x8a5a33, len: 1.2 },
    ],
    enemies: [
      { name: "Forajido", color: 0xe23b2e, size: 1.0, hp: 45, dmg: 11, speed: 4.4 },
      { name: "Cazarrecompensas", color: 0xff7a1a, size: 1.2, hp: 62, dmg: 15, speed: 4.6 },
    ],
    brute: { name: "Jack Dinamita (dormido)", color: 0xb02818, size: 2.0, hp: 165, dmg: 34, speed: 5.8, detect: 7.5 },
    boss: { name: "EL GRANDE DE TOMBSTONE", color: 0xd1271c, size: 4.5, hp: 540, dmg: 36 },
    dungeonNames: ["Mina Abandonada", "Cantina del Cuervo", "Fuerte Pólvora"],
    dungeonTypes: ["arena", "stealth", "fortress"],
    ambient: "sand",
    ambientColor: 0xd1a05a,
    killLines: [
      "le silbó la balada del ataúd al forajido",
      "cobró la recompensa del cazarrecompensas",
      "mandó a Jack a dormir la siesta eterna",
      "hizo un duelo al amanecer… a las 3 del mediodía",
    ],
    flavor: "Este pueblo se quedó pequeño para dos comandos.",
  },
  {
    id: 3,
    numeral: "IV",
    name: "GUERRA MODERNA",
    short: "Moderna",
    contexts: ["Zona de Exclusión", "Puerto en Ruinas", "Frente de Hormigón"],
    sky: 0x7d8a94,
    fog: 0x7d8a94,
    light: 0xf0f4f4,
    groundTop: 0x5c6b52,
    groundTop2: 0x66755c,
    groundSide: 0x4a4f45,
    accent: 0x8fa05a,
    propStyle: "modern",
    weapons: [
      { name: "Cuchillo Táctico", dmg: 16, range: 2.0, rate: 0.35, color: 0x3a3f3a, len: 0.8 },
      { name: "Culata de Fusil", dmg: 20, range: 2.6, rate: 0.6, color: 0x4a4f45, len: 1.3 },
      { name: "Pala de Trinchera", dmg: 25, range: 2.2, rate: 0.7, color: 0x6a705c, len: 1.1 },
      { name: "Machete de Selva", dmg: 18, range: 2.4, rate: 0.48, color: 0x9aa08a, len: 1.2 },
    ],
    enemies: [
      { name: "Soldado Renegado", color: 0xe23b2e, size: 1.05, hp: 55, dmg: 13, speed: 4.5 },
      { name: "Dron de Asalto", color: 0xff7a1a, size: 1.15, hp: 68, dmg: 16, speed: 5.2 },
    ],
    brute: { name: "Juggernaut Dormido", color: 0xa32618, size: 2.3, hp: 210, dmg: 40, speed: 5.2, detect: 6 },
    boss: { name: "TANQUE 'MACHACATOR-3000'", color: 0xb01d12, size: 4.7, hp: 620, dmg: 40 },
    dungeonNames: ["Búnker 7", "Nido de Francotirador", "Fuerte Misil"],
    dungeonTypes: ["arena", "stealth", "fortress"],
    ambient: "rain",
    ambientColor: 0x9fb4c4,
    killLines: [
      "dio de baja al renegado, papeleo incluido",
      "desmontó el dron pieza a pieza",
      "apagó al Juggernaut… permanentemente",
      "pidió apoyo aéreo y se lo dio con las manos",
    ],
    flavor: "Hormigón, óxido y cero reglas de enfrentamiento.",
  },
  {
    id: 4,
    numeral: "V",
    name: "ERA FUTURISTA",
    short: "Futuro",
    contexts: ["Neo-Colmena 9", "Anillo Orbital Caído", "Sector Neón"],
    sky: 0x101c2e,
    fog: 0x101c2e,
    light: 0xbfe8ff,
    groundTop: 0x23304a,
    groundTop2: 0x2a3a58,
    groundSide: 0x10161f,
    accent: 0x35e0ff,
    propStyle: "future",
    weapons: [
      { name: "Hoja de Plasma", dmg: 26, range: 2.6, rate: 0.45, color: 0x35e0ff, len: 1.4 },
      { name: "Martillo de Energía", dmg: 34, range: 2.2, rate: 0.85, color: 0xff3bd4, len: 1.2 },
      { name: "Katana Iónica", dmg: 22, range: 3.0, rate: 0.55, color: 0x7dffb0, len: 1.7 },
      { name: "Guantelete de Arco", dmg: 18, range: 2.0, rate: 0.3, color: 0xffe24a, len: 0.9 },
    ],
    enemies: [
      { name: "Dron Cazador", color: 0xe23b2e, size: 1.1, hp: 60, dmg: 14, speed: 5.4 },
      { name: "Androide de Choque", color: 0xff7a1a, size: 1.3, hp: 82, dmg: 18, speed: 4.7 },
    ],
    brute: { name: "Centinela Letárgico", color: 0xa32618, size: 2.4, hp: 230, dmg: 44, speed: 5.4, detect: 6.5 },
    boss: { name: "SEÑOR DE LA GUERRA ZX-9", color: 0xc0120a, size: 4.9, hp: 720, dmg: 44 },
    dungeonNames: ["Cámara de Datos", "Reactor Inestable", "Hangar de Mechas"],
    dungeonTypes: ["arena", "stealth", "fortress"],
    ambient: "neon",
    ambientColor: 0x35e0ff,
    killLines: [
      "formateó al dron cazador en FAT32",
      "desenchufó al androide de un tortazo",
      "puso al Centinela en modo avión eterno",
      "le hizo un hard reset al ZX-9… con el puño",
    ],
    flavor: "El futuro es brillante. Y está lleno de láseres.",
  },
];

export const TOTAL_ERAS = ERAS.length;

export const ABSURD_DEATHS = [
  { cause: "void", line: "Se cayó al vacío. La isla seguirá adelante sin él." },
  { cause: "banana", line: "Resbaló con una cáscara de plátano. Con violencia letal." },
  { cause: "time", line: "El tiempo colapsó. La línea temporal lo escupió." },
  { cause: "push", line: "Su compañero lo empujó 'sin querer'. Spoiler: fue con querer." },
  { cause: "boss", line: "El jefe lo convirtió en confeti cúbico." },
  { cause: "brute", line: "El sigilo duró exactamente 4 segundos." },
];
