// ============================================================
// PEAK COMMANDO — Motor del prototipo (Three.js)
// Espejo web de la arquitectura propuesta para Unity:
//   IslandAssembler · DungeonGenerator · TimeDirector ·
//   LocomotionController · MeleeSystem · ConsumableSystem ·
//   ReviveSystem · CorpseDragSystem · AbsurdDeathDirector
// ============================================================
import * as THREE from "three";
import { ERAS, TOTAL_ERAS, ABSURD_DEATHS, type EraDef, type WeaponDef, type EnemyDef } from "./eras";
import { sfx } from "./audio";

export type Phase = "menu" | "playing" | "paused" | "transition" | "over" | "victory";

export type HudData = {
  phase: Phase;
  eraIdx: number;
  eraNum: string;
  eraName: string;
  context: string;
  time: number;
  score: number;
  frags: number;
  hp: number;
  stam: number;
  crouch: boolean;
  sprint: boolean;
  rush: boolean;
  compHp: number;
  compDown: boolean;
  weapon: string;
  cons: [number, number, number];
  bossName: string | null;
  bossHp: number;
  bossMax: number;
  prompt: string | null;
  revivePct: number;
  hurt: number;
  carry: boolean;
  deathLine: string;
  stats: { kills: number; deposited: number; eras: number };
  transition: { num: string; name: string; context: string } | null;
};

export type FeedItem = { id: number; text: string; tone: "info" | "good" | "bad" | "fun" };

type Callbacks = { onHud: (h: HudData) => void; onFeed: (f: FeedItem) => void };

type Collider = { minX: number; maxX: number; minZ: number; maxZ: number; top: number };

type Enemy = {
  group: THREE.Group;
  body: THREE.Mesh;
  bodyMat: THREE.MeshLambertMaterial;
  def: EnemyDef;
  kind: "normal" | "brute" | "boss";
  hp: number;
  maxHp: number;
  pos: THREE.Vector3;
  kb: THREE.Vector3;
  home: THREE.Vector3;
  waypoint: THREE.Vector3;
  state: "patrol" | "chase" | "sleep";
  attackCd: number;
  slamCd: number;
  flash: number;
  stun: number;
  aggro: boolean;
  dead: boolean;
  attract: THREE.Vector3 | null;
  attractT: number;
  wakeRot: number;
};

type Corpse = { mesh: THREE.Mesh; pos: THREE.Vector3; name: string };
type Frag = { mesh: THREE.Mesh; pos: THREE.Vector3; base: number; phase: number; taken: boolean };
type ControlPoint = { group: THREE.Group; core: THREE.Mesh; coreMat: THREE.MeshLambertMaterial; pos: THREE.Vector3; used: boolean };
type Chest = { group: THREE.Group; lid: THREE.Mesh; pos: THREE.Vector3; opened: boolean };
type Banana = { mesh: THREE.Mesh; pos: THREE.Vector3; t: number; dead: boolean };
type Stink = { mesh: THREE.Mesh; cloud: THREE.Mesh | null; pos: THREE.Vector3; vel: THREE.Vector3; t: number; landed: boolean };
type Particle = { mesh: THREE.Mesh; vel: THREE.Vector3; life: number; maxLife: number };

const CELL = 2;
const N = 65;
const ORIGIN = -64;
const ISLAND_R = 62;
const G = 23;
const JUMP_V = 8.7;
const STEP_UP = 0.95;

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp(t, 0, 1);

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class PeakCommandoGame {
  private canvas: HTMLCanvasElement;
  private cb: Callbacks;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private raf = 0;
  private disposed = false;

  private hemi: THREE.HemisphereLight;
  private dir: THREE.DirectionalLight;

  private islandGroup = new THREE.Group();
  private worldGroup = new THREE.Group();
  private heights = new Int8Array(N * N);
  private colliders: Collider[] = [];

  private keys = new Set<string>();
  private interactPressed = false;
  private pointerLockBroken = false;

  // --- run state ---
  private phase: Phase = "menu";
  private eraIdx = 0;
  private context = "";
  private timeLeft = 150;
  private score = 0;
  private frags = 0;
  private runId = 1;
  private kills = 0;
  private deposited = 0;
  private erasCleared = 0;
  private menuAngle = 0;
  private transT = 0;
  private transInfo: HudData["transition"] = null;
  private hurtCounter = 0;
  private hbT = 0;
  private hudT = 0;
  private elapsed = 0;

  // --- player ---
  private pPos = new THREE.Vector3(0, 2, 14);
  private pVel = new THREE.Vector3();
  private yaw = 0;
  private pitch = 0;
  private pHp = 100;
  private stam = 100;
  private grounded = false;
  private crouching = false;
  private sprinting = false;
  private weapon: WeaponDef | null = null;
  private cons: [number, number, number] = [1, 0, 0];
  private attackCd = 0;
  private swingT = 0;
  private invulnT = 0;
  private adrenalineT = 0;
  private pushCd = 0;
  private pDead = false;
  private deathLine = "";
  private shakeT = 0;
  private shakeAmp = 0;
  private camH = 1.55;

  // --- companion ---
  private cPos = new THREE.Vector3(2, 2, 14);
  private cVel = new THREE.Vector3();
  private cHp = 100;
  private cDown = false;
  private cDownT = 0;
  private cAttackCd = 0;
  private cPushT = 0;
  private compGroup!: THREE.Group;
  private compBody!: THREE.Mesh;

  // --- entities ---
  private enemies: Enemy[] = [];
  private corpses: Corpse[] = [];
  private fragsList: Frag[] = [];
  private cps: ControlPoint[] = [];
  private chests: Chest[] = [];
  private bananas: Banana[] = [];
  private stinks: Stink[] = [];
  private particles: Particle[] = [];
  private particlePool: Particle[] = [];
  private ambient!: THREE.InstancedMesh;
  private ambientSpd: number[] = [];
  private era!: EraDef;

  private portalInner!: THREE.Mesh;
  private portalInnerMat!: THREE.MeshBasicMaterial;
  private portalActive = false;
  private portalPos = new THREE.Vector3();
  private boss: Enemy | null = null;
  private lastCPPos = new THREE.Vector3(0, 2, 14);
  private carried: Corpse | null = null;
  private revivePct = 0;
  private prompt: string | null = null;
  private interactKind: string | null = null;
  private interactObj: Enemy | Corpse | ControlPoint | Chest | null = null;

  private weaponGroup = new THREE.Group();
  private weaponMesh: THREE.Mesh | null = null;
  private camShake = new THREE.Vector3();

  constructor(canvas: HTMLCanvasElement, cb: Callbacks) {
    this.canvas = canvas;
    this.cb = cb;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 700);
    this.camera.rotation.order = "YXZ";
    this.scene.add(this.camera);
    this.camera.add(this.weaponGroup);

    this.hemi = new THREE.HemisphereLight(0xfff3d6, 0x334433, 1.05);
    this.dir = new THREE.DirectionalLight(0xfff3d6, 1.15);
    this.dir.position.set(34, 55, 22);
    this.scene.add(this.hemi, this.dir);
    this.scene.add(this.islandGroup, this.worldGroup);

    this.buildCompanion();
    this.buildIsland(0, true);
    this.phase = "menu";

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("resize", this.onResize);
    document.addEventListener("pointerlockchange", this.onLockChange);
    document.addEventListener("pointerlockerror", this.onLockError);
    document.addEventListener("mousedown", this.onMouseDown);
    this.onResize();
    this.pushHud();
    this.loop();
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("pointerlockchange", this.onLockChange);
    document.removeEventListener("pointerlockerror", this.onLockError);
    document.removeEventListener("mousedown", this.onMouseDown);
    this.renderer.dispose();
  }

  // ============================ public API ============================
  startRun() {
    sfx.unlock();
    this.runId++;
    this.score = 0; this.frags = 0; this.kills = 0; this.deposited = 0; this.erasCleared = 0;
    this.timeLeft = 150;
    this.pHp = 100; this.stam = 100;
    this.weapon = null; this.cons = [1, 0, 0];
    this.adrenalineT = 0; this.pDead = false; this.deathLine = "";
    this.carried = null; this.revivePct = 0;
    this.eraIdx = 0;
    this.buildIsland(0);
    this.phase = "playing";
    this.lockPointer();
    this.feed("OPERACIÓN CRONOS: reúne fragmentos azules, descarga tiempo y tumba al jefe.", "info");
    this.pushHud();
  }

  pause() {
    if (this.phase !== "playing") return;
    this.phase = "paused";
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
    this.pushHud();
  }

  resume() {
    if (this.phase !== "paused") return;
    sfx.unlock();
    this.phase = "playing";
    this.lockPointer();
    this.pushHud();
  }

  toMenu() {
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
    this.phase = "menu";
    this.compGroup.visible = false;
    this.pushHud();
  }

  /** Cheat de prototipo: salta a la siguiente era para revisar todo el contenido. */
  private cheatNextEra() {
    if (this.phase !== "playing") return;
    this.feed("CHEAT: salto temporal adelantado → siguiente era.", "fun");
    this.completeEra();
  }

  // ============================ input ============================
  private lockPointer() {
    try {
      const r = this.canvas.requestPointerLock() as unknown as Promise<void> | undefined;
      if (r && typeof r.catch === "function") r.catch(() => { this.pointerLockBroken = true; });
    } catch {
      this.pointerLockBroken = true;
    }
    window.setTimeout(() => {
      if (document.pointerLockElement !== this.canvas) this.pointerLockBroken = true;
    }, 700);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) return;
    this.keys.add(e.code);
    if (this.phase !== "playing") return;
    if (e.code === "KeyE") this.interactPressed = true;
    if (e.code === "KeyF") this.tryPush();
    if (e.code === "Digit1") this.useConsumable(0);
    if (e.code === "Digit2") this.useConsumable(1);
    if (e.code === "Digit3") this.useConsumable(2);
    if (e.code === "Escape") this.pause();
    // --- cheats de prototipo (para revisar el contenido) ---
    if (e.code === "KeyN") this.cheatNextEra();
    if (e.code === "KeyT") {
      this.timeLeft = Math.min(999, this.timeLeft + 120);
      this.feed("CHEAT: +120 s al cronómetro. El tiempo es vuestro.", "fun");
      sfx.deposit();
    }
    if (e.code === "KeyH") {
      this.pHp = 100; this.stam = 100; this.cHp = 100;
      if (this.cDown) { this.cDown = false; this.compGroup.rotation.z = 0; }
      this.feed("CHEAT: escuadrón a plena salud.", "fun");
      sfx.revive();
    }
  };
  private onKeyUp = (e: KeyboardEvent) => this.keys.delete(e.code);

  private onMouseMove = (e: MouseEvent) => {
    if (this.phase !== "playing") return;
    const locked = document.pointerLockElement === this.canvas;
    // Si el entorno no soporta pointer lock (iframes, permisos), el cursor girando la cámara actúa como fallback.
    if (!locked && !this.pointerLockBroken) return;
    this.yaw -= e.movementX * 0.0024;
    this.pitch = clamp(this.pitch - e.movementY * 0.0024, -1.45, 1.45);
  };

  private onMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    if (this.phase !== "playing") return;
    if (document.pointerLockElement !== this.canvas) {
      if (!this.pointerLockBroken) this.lockPointer();
      else this.tryAttack();
      return;
    }
    this.tryAttack();
  };

  private onLockChange = () => {
    if (this.pointerLockBroken) return;
    if (document.pointerLockElement !== this.canvas && this.phase === "playing") this.pause();
  };

  private onLockError = () => {
    this.pointerLockBroken = true;
  };

  private onResize = () => {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  };

  // ============================ world building ============================
  private cellIdx(x: number, z: number): number {
    const i = Math.round((x - ORIGIN) / CELL);
    const j = Math.round((z - ORIGIN) / CELL);
    if (i < 0 || j < 0 || i >= N || j >= N) return -1;
    return i + j * N;
  }

  private terrainAt(x: number, z: number): number {
    const idx = this.cellIdx(x, z);
    if (idx < 0) return -100;
    const h = this.heights[idx];
    return h < 0 ? -100 : h;
  }

  private flatten(cx: number, cz: number, hw: number, hd: number, h: number) {
    for (let x = cx - hw; x <= cx + hw; x += 1) {
      for (let z = cz - hd; z <= cz + hd; z += 1) {
        const idx = this.cellIdx(x, z);
        if (idx >= 0) this.heights[idx] = h;
      }
    }
  }

  private clearIsland() {
    for (const root of [this.islandGroup, this.worldGroup]) {
      root.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((mm) => mm.dispose());
        else if (mat) mat.dispose();
      });
      root.clear();
    }
    this.colliders = [];
    this.enemies = []; this.corpses = []; this.fragsList = []; this.cps = [];
    this.chests = []; this.bananas = []; this.stinks = [];
    this.particles = []; this.particlePool = [];
    this.boss = null; this.portalActive = false; this.carried = null;
    this.prompt = null; this.interactKind = null; this.interactObj = null;
  }

  private buildIsland(eraIdx: number, isMenu = false) {
    this.clearIsland();
    this.eraIdx = eraIdx;
    this.era = ERAS[eraIdx];
    const era = this.era;
    const rng = mulberry32(eraIdx * 7919 + 17 + this.runId * 131);
    this.context = era.contexts[Math.floor(rng() * era.contexts.length)];

    this.scene.background = new THREE.Color(era.sky);
    this.scene.fog = new THREE.Fog(era.fog, eraIdx === 4 ? 45 : 70, eraIdx === 4 ? 230 : 310);
    this.hemi.color.set(era.light);
    this.dir.color.set(era.light);
    this.dir.intensity = eraIdx === 4 ? 0.75 : 1.15;

    // --- heightmap ---
    this.heights.fill(-1);
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const x = ORIGIN + i * CELL, z = ORIGIN + j * CELL;
        const d = Math.hypot(x, z);
        if (d <= ISLAND_R) this.heights[i + j * N] = 0;
      }
    }
    const bumps = 7;
    for (let b = 0; b < bumps; b++) {
      const a = rng() * Math.PI * 2, dist = 10 + rng() * 40;
      const bx = Math.cos(a) * dist, bz = Math.sin(a) * dist;
      const r = 8 + rng() * 8, hMax = 2 + Math.floor(rng() * 3);
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const idx = i + j * N;
        if (this.heights[idx] < 0) continue;
        const x = ORIGIN + i * CELL, z = ORIGIN + j * CELL;
        const d = Math.hypot(x - bx, z - bz);
        if (d < r) this.heights[idx] = Math.max(this.heights[idx], Math.min(4, Math.round(hMax * (1 - d / r))));
      }
    }

    // --- reserved spots ---
    const spotAt = (deg: number, dist: number) => {
      const a = (deg * Math.PI) / 180;
      return new THREE.Vector3(Math.cos(a) * dist, 0, Math.sin(a) * dist);
    };
    // 7 mazmorras repartidas por la isla (estilo mundo abierto), el jefe al norte
    const dunSpots = [
      spotAt(85 + rng() * 10, 28),
      spotAt(130 + rng() * 10, 38),
      spotAt(175 + rng() * 10, 30),
      spotAt(220 + rng() * 10, 40),
      spotAt(265 + rng() * 10, 27),
      spotAt(310 + rng() * 10, 38),
      spotAt(355 + rng() * 10, 30),
    ];
    const bossSpot = spotAt(30, 46);
    const cpSpots = [
      spotAt(205, 24),
      spotAt(150, 40),
      spotAt(258, 42),
      spotAt(332, 46),
      spotAt(62, 40),
    ];
    const spawnSpot = spotAt(205, 38);
    const landmarkSpots = [spotAt(55, 20), spotAt(152, 22), spotAt(243, 20), spotAt(332, 19)];
    for (const s of dunSpots) this.flatten(s.x, s.z, 8.5, 8.5, 0);
    this.flatten(bossSpot.x, bossSpot.z, 15, 15, 0);
    for (const s of cpSpots) this.flatten(s.x, s.z, 2.6, 2.6, 0);
    this.flatten(spawnSpot.x, spawnSpot.z, 3.2, 3.2, 0);
    for (const s of landmarkSpots) this.flatten(s.x, s.z, 5, 5, 0);
    for (const b of [0, 1, 2, 3, 4, 5]) {
      const bh = Math.max(1, Math.round(2 + rng() * 1.6));
      const ba = rng() * Math.PI * 2, bd = 30 + rng() * 20;
      this.flatten(Math.cos(ba) * bd, Math.sin(ba) * bd, 2.2, 2.2, bh);
    }

    this.buildTerrain(era, rng);
    this.buildProps(era, rng, [...dunSpots, bossSpot, ...cpSpots, spawnSpot, ...landmarkSpots]);
    this.buildLandmarks(landmarkSpots, era, rng);
    const archetypes: Array<"arena" | "stealth" | "fortress" | "treasure"> =
      ["arena", "stealth", "fortress", "treasure", "arena", "stealth", "fortress"];
    const tiers = [0, 1, 2, 3, 1, 2, 2];
    archetypes.forEach((t, i) => this.buildDungeon(t, dunSpots[i], tiers[i], era, rng));
    this.buildBossArena(bossSpot, era);
    for (const s of cpSpots) this.buildControlPoint(s, era);
    for (let k = 0; k < 12; k++) this.scatterFrag(rng);
    for (let k = 0; k < 4; k++) this.buildLootCrate(rng, era);
    for (let k = 0; k < 16; k++) this.spawnOpenEnemy(rng, [...dunSpots, bossSpot, spawnSpot], era);
    this.buildAmbient(era, rng);

    // --- player & companion placement ---
    const th = this.terrainAt(spawnSpot.x, spawnSpot.z);
    this.pPos.set(spawnSpot.x, Math.max(th, 0) + 0.02, spawnSpot.z);
    this.pVel.set(0, 0, 0);
    const toC = Math.atan2(-spawnSpot.x, -spawnSpot.z);
    this.yaw = toC; this.pitch = 0;
    this.camH = 1.55;
    this.cPos.set(spawnSpot.x + 1.6, Math.max(th, 0) + 0.02, spawnSpot.z + 1.2);
    this.cVel.set(0, 0, 0);
    this.cHp = 100; this.cDown = false; this.cDownT = 0;
    this.lastCPPos.copy(cpSpots[0]).setY(this.terrainAt(cpSpots[0].x, cpSpots[0].z));
    this.compGroup.visible = !isMenu;
    this.compGroup.position.copy(this.cPos);
    this.updateWeaponMesh();

    if (isMenu) {
      this.camera.position.set(96, 42, 0);
      this.camera.lookAt(0, 2, 0);
    } else {
      this.feed(`DESPLIEGUE: ${era.name} — «${this.context}»`, "info");
    }
  }

  private buildTerrain(era: EraDef, rng: () => number) {
    const cells: number[] = [];
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const idx = i + j * N;
      if (this.heights[idx] >= 0) cells.push(idx);
    }
    const topGeo = new THREE.BoxGeometry(CELL, 1, CELL);
    const sideGeo = new THREE.BoxGeometry(CELL * 0.98, 1, CELL * 0.98);
    const white = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const topMesh = new THREE.InstancedMesh(topGeo, white, cells.length);
    const sideMesh = new THREE.InstancedMesh(sideGeo, white, cells.length * 2);
    const m = new THREE.Matrix4();
    const col = new THREE.Color();
    const c1 = new THREE.Color(era.groundTop), c2 = new THREE.Color(era.groundTop2);
    const side = new THREE.Color(era.groundSide), sideDark = new THREE.Color(era.groundSide).multiplyScalar(0.72);
    cells.forEach((idx, k) => {
      const i = idx % N, j = Math.floor(idx / N);
      const x = ORIGIN + i * CELL, z = ORIGIN + j * CELL;
      const h = this.heights[idx];
      const jit = (rng() - 0.5) * 0.07;
      m.makeTranslation(x, h - 0.5 + jit, z);
      topMesh.setMatrixAt(k, m);
      col.copy(rng() > 0.5 ? c1 : c2);
      col.multiplyScalar(0.94 + rng() * 0.12);
      topMesh.setColorAt(k, col);
      m.makeTranslation(x, h - 1.5, z);
      sideMesh.setMatrixAt(k * 2, m);
      sideMesh.setColorAt(k * 2, side);
      m.makeTranslation(x, h - 2.5, z);
      sideMesh.setMatrixAt(k * 2 + 1, m);
      sideMesh.setColorAt(k * 2 + 1, sideDark);
    });
    if (topMesh.instanceColor) topMesh.instanceColor.needsUpdate = true;
    if (sideMesh.instanceColor) sideMesh.instanceColor.needsUpdate = true;
    this.islandGroup.add(topMesh, sideMesh);
  }

  private box(w: number, h: number, d: number, color: number, x: number, y: number, z: number, opts: { collide?: boolean; emissive?: number; parent?: THREE.Object3D } = {}): THREE.Mesh {
    const mat = new THREE.MeshLambertMaterial({ color });
    if (opts.emissive) { mat.emissive = new THREE.Color(color); mat.emissiveIntensity = opts.emissive; }
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    (opts.parent ?? this.worldGroup).add(mesh);
    if (opts.collide !== false) {
      this.colliders.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2, top: y + h / 2 });
    }
    return mesh;
  }

  private reservedOk(x: number, z: number, reserved: THREE.Vector3[], minD: number) {
    return reserved.every((s) => Math.hypot(x - s.x, z - s.z) > minD);
  }

  private buildProps(era: EraDef, rng: () => number, reserved: THREE.Vector3[]) {
    const count = 70;
    let placed = 0, guard = 0;
    while (placed < count && guard++ < 1600) {
      const a = rng() * Math.PI * 2, d = 5 + rng() * 54;
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (!this.reservedOk(x, z, reserved, 9)) continue;
      const th = this.terrainAt(x, z);
      if (th < 0) continue;
      this.buildOneProp(era, rng, x, th, z);
      placed++;
    }
  }

  private buildOneProp(era: EraDef, rng: () => number, x: number, th: number, z: number) {
    const style = era.propStyle;
    if (style === "jungle") {
      const h = 2.2 + rng() * 2.4;
      this.box(0.55, h, 0.55, 0x6b4a2f, x, th + h / 2, z);
      this.box(1.9, 1.1, 1.9, 0x2f6b33, x, th + h + 0.4, z, { collide: false });
      this.box(1.2, 0.9, 1.2, 0x3a7d3f, x + (rng() - 0.5), th + h + 1.2, z + (rng() - 0.5), { collide: false });
    } else if (style === "medieval") {
      const roll = rng();
      if (roll < 0.45) {
        this.box(1.4, 2.6, 1.4, 0x7d828a, x, th + 1.3, z);
        this.box(1.7, 0.5, 1.7, 0x6a6f78, x, th + 2.85, z, { collide: false });
      } else if (roll < 0.75) {
        const h = 2 + rng() * 2;
        this.box(0.5, h, 0.5, 0x5a4630, x, th + h / 2, z);
        this.box(1.7, 1, 1.7, 0x33663c, x, th + h + 0.4, z, { collide: false });
      } else {
        this.box(2.4, 0.8, 1.1, 0x7d828a, x, th + 0.4, z);
        this.box(1.1, 0.8, 2.4, 0x7d828a, x + 0.5, th + 0.4, z + 0.4, { collide: false });
      }
    } else if (style === "west") {
      const roll = rng();
      if (roll < 0.5) {
        const h = 1.8 + rng() * 1.6;
        this.box(0.6, h, 0.6, 0x3f7a3a, x, th + h / 2, z);
        this.box(0.9, 0.45, 0.45, 0x3f7a3a, x + 0.65, th + h * 0.55, z, { collide: false });
        this.box(0.45, 0.8, 0.45, 0x469041, x + 0.85, th + h * 0.55 + 0.5, z, { collide: false });
      } else if (roll < 0.8) {
        this.box(1.6, 1.5, 0.5, 0x7a5230, x, th + 0.75, z);
        this.box(0.5, 2.4, 0.5, 0x7a5230, x - 0.55, th + 1.2, z + 0.1, { collide: false });
      } else {
        this.box(1.8, 1.2, 1.6, 0xb08850, x, th + 0.6, z);
      }
    } else if (style === "modern") {
      const roll = rng();
      if (roll < 0.4) {
        this.box(2.6, 1, 0.7, 0x9a9f9c, x, th + 0.5, z);
      } else if (roll < 0.75) {
        const h = 3 + rng() * 4;
        this.box(3.4, h, 3, 0x5a605c, x, th + h / 2, z);
        this.box(3.5, 0.4, 3.1, 0x494e4a, x, th + h + 0.2, z, { collide: false });
      } else {
        this.box(1.2, 0.7, 0.9, 0xb0a46a, x, th + 0.35, z);
        this.box(1.2, 0.7, 0.9, 0xb0a46a, x + 0.3, th + 1.0, z + 0.2, { collide: false });
      }
    } else {
      const roll = rng();
      if (roll < 0.55) {
        const h = 3.5 + rng() * 4;
        this.box(0.7, h, 0.7, 0x1a2438, x, th + h / 2, z);
        this.box(0.9, 0.5, 0.9, era.accent, x, th + h + 0.2, z, { collide: false, emissive: 0.9 });
      } else if (roll < 0.85) {
        const h = 2.5 + rng() * 5;
        this.box(2.6, h, 2.2, 0x232f47, x, th + h / 2, z);
        this.box(2.7, 0.35, 2.3, 0x35e0ff, x, th + h * 0.6, z, { collide: false, emissive: 0.7 });
      } else {
        this.box(1.6, 1.1, 1.6, 0x182236, x, th + 0.55, z);
        this.box(0.5, 0.5, 0.5, 0xff3bd4, x, th + 1.4, z, { collide: false, emissive: 1 });
      }
    }
  }

  // ---------------- landmarks (silueta de mundo abierto) ----------------
  private buildLandmarks(spots: THREE.Vector3[], era: EraDef, rng: () => number) {
    spots.forEach((s, i) => {
      const kind = (i + Math.floor(rng() * 3)) % 3;
      if (kind === 0) {
        // Atalaya alta: se ve desde toda la isla
        const h = 11 + rng() * 5;
        this.box(4.4, 2, 4.4, 0x4c463c, s.x, 1, s.z);
        this.box(2.8, h, 2.8, 0x5d564a, s.x, 2 + h / 2, s.z);
        this.box(4, 0.7, 4, 0x4c463c, s.x, 2 + h + 0.35, s.z);
        this.box(0.5, 1.6, 0.5, era.accent, s.x, 2 + h + 1.4, s.z, { collide: false, emissive: 0.9 });
        this.box(0.12, 2.6, 0.12, 0x3a3f3a, s.x + 1.3, 2 + h + 1.9, s.z, { collide: false });
        this.box(1.1, 0.6, 0.08, era.accent, s.x + 1.9, 2 + h + 2.8, s.z, { collide: false });
      } else if (kind === 1) {
        // Meseta con santuario y escalera tallada
        this.box(10, 4, 10, 0x57503f, s.x, 2, s.z);
        this.box(4, 1, 2.4, 0x57503f, s.x, 0.5, s.z + 6, { collide: false });
        this.box(4, 2, 1.6, 0x57503f, s.x, 1, s.z + 5.4);
        this.box(4, 3, 1, 0x57503f, s.x, 1.5, s.z + 4.9, { collide: false });
        this.box(2.6, 3.2, 2.6, 0x6a6355, s.x, 4 + 1.6, s.z - 1);
        this.box(3, 0.5, 3, era.accent, s.x, 4 + 3.4, s.z - 1, { collide: false, emissive: 0.55 });
        this.box(0.7, 0.7, 0.7, 0x35e0ff, s.x, 4 + 4, s.z - 1, { collide: false, emissive: 1 });
      } else {
        // Arco colosal en ruinas
        this.box(1.6, 7, 1.6, 0x5d564a, s.x - 3.4, 3.5, s.z);
        this.box(1.6, 7, 1.6, 0x5d564a, s.x + 3.4, 3.5, s.z);
        this.box(9, 1.3, 2, 0x6a6355, s.x, 7.6, s.z, { collide: false });
        this.box(1.2, 1.2, 1.2, 0x4c463c, s.x + 5.4, 0.6, s.z + 1.6, { collide: false });
        this.box(1.5, 0.9, 1.1, 0x4c463c, s.x - 5.2, 0.45, s.z - 1.2, { collide: false });
        this.box(0.8, 0.8, 0.8, era.accent, s.x, 0.4, s.z + 2.6, { collide: false, emissive: 0.7 });
      }
    });
  }

  // ---------------- dungeons ----------------
  private wallRect(cx: number, cz: number, w: number, d: number, h: number, th: number, color: number, gapSide: number) {
    const hw = w / 2, hd = d / 2, t = 0.6;
    const seg = (x: number, z: number, sw: number, sd: number) => this.box(sw, h, sd, color, x, th + h / 2, z);
    if (gapSide !== 0) seg(cx, cz - hd, w, t);
    else { seg(cx - hw / 2 - 0.4, cz - hd, hw - 1.6, t); seg(cx + hw / 2 + 0.4, cz - hd, hw - 1.6, t); }
    if (gapSide !== 2) seg(cx, cz + hd, w, t);
    else { seg(cx - hw / 2 - 0.4, cz + hd, hw - 1.6, t); seg(cx + hw / 2 + 0.4, cz + hd, hw - 1.6, t); }
    if (gapSide !== 3) seg(cx - hw, cz, t, d);
    else { seg(cx - hw, cz - hd / 2 - 0.4, t, hd - 1.6); seg(cx - hw, cz + hd / 2 + 0.4, t, hd - 1.6); }
    if (gapSide !== 1) seg(cx + hw, cz, t, d);
    else { seg(cx + hw, cz - hd / 2 - 0.4, t, hd - 1.6); seg(cx + hw, cz + hd / 2 + 0.4, t, hd - 1.6); }
  }

  private banner(x: number, y: number, z: number, color: number, label: number) {
    this.box(0.16, 2.6, 0.16, 0x3a3f3a, x, y + 1.3, z, { collide: false });
    this.box(1.4, 0.7, 0.12, color, x, y + 2.1, z, { collide: false });
    this.box(0.5, 0.3, 0.14, label, x, y + 2.1, z + 0.02, { collide: false, emissive: 0.5 });
  }

  private buildDungeon(type: "arena" | "stealth" | "fortress" | "treasure", spot: THREE.Vector3, tier: number, era: EraDef, rng: () => number) {
    const x = spot.x, z = spot.z;
    const th = 0;
    const wallColor = era.propStyle === "future" ? 0x1a2438 : era.propStyle === "west" ? 0x8a5a33 : era.propStyle === "medieval" ? 0x6a6f78 : era.propStyle === "modern" ? 0x6f756c : 0x5d4a33;
    const diffColor = tier === 0 ? 0x6fae4e : tier === 1 ? 0xffb02e : tier === 3 ? 0xff3bd4 : 0xff4438;

    if (type === "arena") {
      this.wallRect(x, z, 10, 10, 1.5, th, wallColor, 1);
      this.banner(x - 5.6, th, z + 5.6, era.accent, diffColor);
      this.buildChestAt(x + 3.4, z - 3.4, 0);
      this.addFrag(x - 3.5, 0, z + 3.5);
      for (let k = 0; k < 2; k++) this.spawnEnemy(era, "normal", x + (rng() - 0.5) * 5, z + (rng() - 0.5) * 5, new THREE.Vector3(x, 0, z));
    } else if (type === "stealth") {
      this.wallRect(x, z, 8.4, 8.4, 3, th, wallColor, 3);
      this.banner(x - 5, th, z - 5, era.accent, diffColor);
      this.buildChestAt(x + 2.9, z + 2.9, 0);
      this.addFrag(x + 3, 0, z - 3);
      this.addFrag(x - 1, 0, z + 3.2);
      this.spawnEnemy(era, "brute", x - 0.5, z - 0.5, new THREE.Vector3(x, 0, z));
      this.box(1.1, 0.5, 1.1, 0x4a3f2a, x - 3, th + 0.25, z + 2.5, { collide: false });
    } else if (type === "treasure") {
      // Cámara legendaria: sin desafío, puro botín
      this.wallRect(x, z, 8.4, 8.4, 2.4, th, wallColor, 0);
      this.banner(x - 5, th, z - 5, 0xff3bd4, 0xff3bd4);
      this.buildChestAt(x - 2.4, z + 2.2, 0);
      this.buildChestAt(x + 2.4, z + 2.2, 0);
      this.buildChestAt(x, z - 2.2, 0);
      this.addFrag(x, 0, z + 0.4);
      this.addFrag(x - 2.4, 0, z - 0.6);
      this.addFrag(x + 2.4, 0, z - 0.6);
      this.box(1.4, 0.35, 1.4, 0xffd76a, x, th + 0.18, z, { collide: false, emissive: 0.6 });
    } else {
      this.wallRect(x, z, 13, 10.5, 2.7, th, wallColor, 2);
      this.banner(x - 7.2, th, z - 5.8, era.accent, diffColor);
      const tx = x + 3.2, tz = z - 2.2;
      this.box(4, 2.7, 4, wallColor, tx, th + 1.35, tz);
      this.box(4.4, 0.35, 4.4, diffColor, tx, th + 2.88, tz, { collide: false });
      for (let s = 0; s < 4; s++) {
        const top = 0.68 * (4 - s);
        this.box(1.15, top, 1.15, wallColor, tx, th + top / 2, tz + 2.1 + s * 1.05, { collide: true });
      }
      this.buildChestAt(tx, tz, 2.7);
      this.addFrag(tx - 1.2, 2.7, tz + 1.2);
      this.spawnEnemy(era, "normal", x - 3.5, z + 1.5, new THREE.Vector3(x, 0, z));
      this.spawnEnemy(era, "normal", x + 0.5, z + 3.2, new THREE.Vector3(x, 0, z));
      this.spawnEnemy(era, rng() > 0.5 ? "normal" : "normal", x - 4.5, z - 3, new THREE.Vector3(x, 0, z));
    }
  }

  private buildChestAt(x: number, z: number, baseY: number) {
    const g = new THREE.Group();
    g.position.set(x, baseY, z);
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.7, 0.95), new THREE.MeshLambertMaterial({ color: 0x6b4a2f }));
    body.position.y = 0.35;
    const lid = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.24, 1.02), new THREE.MeshLambertMaterial({ color: 0x8a5a33 }));
    lid.position.y = 0.82;
    const lock = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.28, 0.12), new THREE.MeshLambertMaterial({ color: 0x35e0ff, emissive: 0x35e0ff, emissiveIntensity: 0.8 }));
    lock.position.set(0, 0.55, 0.5);
    g.add(body, lid, lock);
    this.worldGroup.add(g);
    this.chests.push({ group: g, lid, pos: new THREE.Vector3(x, baseY, z), opened: false });
  }

  private buildLootCrate(rng: () => number, era: EraDef) {
    for (let guard = 0; guard < 60; guard++) {
      const a = rng() * Math.PI * 2, d = 6 + rng() * 20;
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      const th = this.terrainAt(x, z);
      if (th < 0) continue;
      this.box(0.9, 0.9, 0.9, era.propStyle === "future" ? 0x182236 : 0x6b4a2f, x, th + 0.45, z, { collide: false });
      const g = new THREE.Group();
      g.position.set(x, th, z);
      const lid = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.16, 0.95), new THREE.MeshLambertMaterial({ color: era.accent }));
      lid.position.y = 0.98;
      g.add(lid);
      this.worldGroup.add(g);
      this.chests.push({ group: g, lid, pos: new THREE.Vector3(x, th, z), opened: false });
      return;
    }
  }

  private buildBossArena(spot: THREE.Vector3, era: EraDef) {
    const x = spot.x, z = spot.z;
    const col = era.propStyle === "future" ? 0x1a2438 : 0x5d5a52;
    for (let k = 0; k < 8; k++) {
      if (k === 2 || k === 6) continue;
      const a = (k / 8) * Math.PI * 2;
      const wx = x + Math.cos(a) * 8.6, wz = z + Math.sin(a) * 8.6;
      const seg = this.box(4.6, 1.6, 0.8, col, wx, 0.8, wz);
      seg.rotation.y = -a;
      this.colliders.pop();
      const c = Math.cos(a), s = Math.sin(a);
      const hw = 2.3, hd = 0.4;
      this.colliders.push({
        minX: Math.min(wx - hw * c - hd * s, wx + hw * c - hd * s, wx - hw * c + hd * s, wx + hw * c + hd * s),
        maxX: Math.max(wx - hw * c - hd * s, wx + hw * c - hd * s, wx - hw * c + hd * s, wx + hw * c + hd * s),
        minZ: Math.min(wz + hw * s - hd * c, wz - hw * s - hd * c, wz + hw * s + hd * c, wz - hw * s + hd * c),
        maxZ: Math.max(wz + hw * s - hd * c, wz - hw * s - hd * c, wz + hw * s + hd * c, wz - hw * s + hd * c),
        top: 1.6,
      });
    }
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
      const px = x + Math.cos(a) * 10.4, pz = z + Math.sin(a) * 10.4;
      this.box(0.9, 3.4, 0.9, col, px, 1.7, pz);
      this.box(1.1, 0.5, 1.1, era.accent, px, 3.65, pz, { collide: false, emissive: 0.7 });
    }
    const pa = Math.atan2(-x, -z);
    this.portalPos.set(x, 0, z);
    const frame = new THREE.Group();
    frame.position.set(x, 0, z);
    frame.rotation.y = pa;
    this.box(0.8, 4.6, 0.8, col, -1.9, 2.3, 0, { parent: frame });
    this.box(0.8, 4.6, 0.8, col, 1.9, 2.3, 0, { parent: frame });
    this.box(4.6, 0.8, 0.8, col, 0, 4.9, 0, { collide: false, parent: frame });
    this.portalInnerMat = new THREE.MeshBasicMaterial({ color: 0x38e1ff, transparent: true, opacity: 0, side: THREE.DoubleSide });
    this.portalInner = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 4.2), this.portalInnerMat);
    this.portalInner.position.set(0, 2.3, 0);
    frame.add(this.portalInner);
    this.worldGroup.add(frame);
    const b = era.boss;
    const dl = Math.hypot(x, z) || 1;
    const bx = x + (-x / dl) * 4.2, bz = z + (-z / dl) * 4.2;
    const boss = this.makeEnemy(b.name, b.color, b.size, b.hp, b.dmg, 2.6, "boss", bx, bz, new THREE.Vector3(bx, 0, bz));
    this.boss = boss;
    this.addFrag(x + 4, 0, z - 4);
  }

  private buildControlPoint(spot: THREE.Vector3, era: EraDef) {
    const th = Math.max(this.terrainAt(spot.x, spot.z), 0);
    const g = new THREE.Group();
    g.position.set(spot.x, th, spot.z);
    const base = new THREE.Mesh(new THREE.BoxGeometry(2, 1.1, 2), new THREE.MeshLambertMaterial({ color: 0x2a332a }));
    base.position.y = 0.55;
    const trim = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.22, 2.15), new THREE.MeshLambertMaterial({ color: era.accent }));
    trim.position.y = 1.18;
    const coreMat = new THREE.MeshLambertMaterial({ color: 0x38e1ff, emissive: 0x38e1ff, emissiveIntensity: 0.95 });
    const core = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.72, 0.72), coreMat);
    core.position.y = 1.95;
    const pole1 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.5, 0.14), new THREE.MeshLambertMaterial({ color: 0x3a3f3a }));
    pole1.position.set(-0.75, 1.9, -0.75);
    const pole2 = pole1.clone(); pole2.position.set(0.75, 1.9, 0.75);
    const pole3 = pole1.clone(); pole3.position.set(0.75, 1.9, -0.75);
    const pole4 = pole1.clone(); pole4.position.set(-0.75, 1.9, 0.75);
    g.add(base, trim, core, pole1, pole2, pole3, pole4);
    this.worldGroup.add(g);
    this.colliders.push({ minX: spot.x - 1, maxX: spot.x + 1, minZ: spot.z - 1, maxZ: spot.z + 1, top: th + 1.1 });
    this.cps.push({ group: g, core, coreMat, pos: new THREE.Vector3(spot.x, th, spot.z), used: false });
  }

  private addFrag(x: number, y: number, z: number) {
    const mat = new THREE.MeshLambertMaterial({ color: 0x38e1ff, emissive: 0x38e1ff, emissiveIntensity: 0.85 });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.42), mat);
    const base = y + 0.65;
    mesh.position.set(x, base, z);
    this.worldGroup.add(mesh);
    this.fragsList.push({ mesh, pos: new THREE.Vector3(x, y, z), base, phase: Math.random() * 6.28, taken: false });
  }

  private scatterFrag(rng: () => number) {
    for (let guard = 0; guard < 80; guard++) {
      const a = rng() * Math.PI * 2, d = 5 + rng() * 22;
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      const th = this.terrainAt(x, z);
      if (th < 0) continue;
      this.addFrag(x, th, z);
      return;
    }
  }

  private buildAmbient(era: EraDef, rng: () => number) {
    const count = 80;
    const geo = new THREE.BoxGeometry(0.14, 0.14, 0.14);
    const mat = new THREE.MeshBasicMaterial({ color: era.ambientColor, transparent: true, opacity: era.propStyle === "future" ? 0.9 : 0.6 });
    this.ambient = new THREE.InstancedMesh(geo, mat, count);
    this.ambientSpd = [];
    const m = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      m.makeTranslation((rng() - 0.5) * 64, rng() * 22, (rng() - 0.5) * 64);
      this.ambient.setMatrixAt(i, m);
      this.ambientSpd.push(1.2 + rng() * 2.2);
    }
    this.worldGroup.add(this.ambient);
  }

  // ---------------- enemies ----------------
  private makeEnemy(name: string, color: number, size: number, hp: number, dmg: number, speed: number, kind: Enemy["kind"], x: number, z: number, home: THREE.Vector3): Enemy {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshLambertMaterial({ color });
    const body = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), bodyMat);
    body.position.y = size / 2;
    g.add(body);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const e1 = new THREE.Mesh(new THREE.BoxGeometry(size * 0.14, size * 0.14, size * 0.06), eyeMat);
    e1.position.set(-size * 0.2, size * 0.66, size * 0.5);
    const e2 = e1.clone(); e2.position.x = size * 0.2;
    g.add(e1, e2);
    if (kind === "boss") {
      const crownMat = new THREE.MeshLambertMaterial({ color: this.era.accent, emissive: this.era.accent, emissiveIntensity: 0.5 });
      for (let k = -1; k <= 1; k++) {
        const spike = new THREE.Mesh(new THREE.BoxGeometry(size * 0.14, size * 0.34, size * 0.14), crownMat);
        spike.position.set(k * size * 0.26, size * 1.12, 0);
        g.add(spike);
      }
    }
    const th = Math.max(this.terrainAt(x, z), 0);
    g.position.set(x, th, z);
    this.worldGroup.add(g);
    const enemy: Enemy = {
      group: g, body, bodyMat,
      def: { name, color, size, hp, dmg, speed },
      kind, hp, maxHp: hp,
      pos: new THREE.Vector3(x, th, z),
      kb: new THREE.Vector3(), home: home.clone(),
      waypoint: new THREE.Vector3(x, 0, z),
      state: kind === "brute" ? "sleep" : "patrol",
      attackCd: 1, slamCd: 2, flash: 0, stun: 0,
      aggro: false, dead: false,
      attract: null, attractT: 0, wakeRot: 0,
    };
    if (kind === "brute") g.rotation.z = Math.PI / 2;
    this.enemies.push(enemy);
    return enemy;
  }

  private spawnEnemy(era: EraDef, kind: "normal" | "brute", x: number, z: number, home: THREE.Vector3) {
    if (kind === "brute") {
      const b = era.brute;
      this.makeEnemy(b.name, b.color, b.size, b.hp, b.dmg, b.speed, "brute", x, z, home);
      return;
    }
    const def = era.enemies[Math.floor(Math.random() * era.enemies.length)];
    this.makeEnemy(def.name, def.color, def.size, def.hp, def.dmg, def.speed, "normal", x, z, home);
  }

  private spawnOpenEnemy(rng: () => number, reserved: THREE.Vector3[], era: EraDef) {
    for (let guard = 0; guard < 60; guard++) {
      const a = rng() * Math.PI * 2, d = 8 + rng() * 18;
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (!this.reservedOk(x, z, reserved, 6)) continue;
      if (this.terrainAt(x, z) < 0) continue;
      this.spawnEnemy(era, "normal", x, z, new THREE.Vector3(x, 0, z));
      return;
    }
  }

  private buildCompanion() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.92, 0.92), new THREE.MeshLambertMaterial({ color: 0xb45cff }));
    body.position.y = 0.46;
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const e1 = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.13, 0.05), eyeMat);
    e1.position.set(-0.19, 0.62, 0.47);
    const e2 = e1.clone(); e2.position.x = 0.19;
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 0.28), new THREE.MeshLambertMaterial({ color: 0x4d8dff }));
    pack.position.set(0, 0.55, -0.55);
    g.add(body, e1, e2, pack);
    g.position.copy(this.cPos);
    this.scene.add(g);
    this.compGroup = g;
    this.compBody = body;
  }

  // ============================ actions ============================
  private forward(): THREE.Vector3 {
    return new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
  }

  private tryAttack() {
    if (this.attackCd > 0 || this.pDead) return;
    const w = this.weapon;
    this.attackCd = w ? w.rate : 0.42;
    this.swingT = 0.18;
    sfx.swing();
    const range = w ? w.range : 1.9;
    const dmg = w ? w.dmg : 10;
    const fwd = this.forward();
    let hitAny = false;
    for (const e of this.enemies) {
      if (e.dead) continue;
      const dx = e.pos.x - this.pPos.x, dz = e.pos.z - this.pPos.z;
      const dist = Math.hypot(dx, dz);
      if (dist > range + e.def.size * 0.4) continue;
      const dot = (dx / (dist || 1)) * fwd.x + (dz / (dist || 1)) * fwd.z;
      if (dot < 0.25) continue;
      if (Math.abs(e.pos.y - this.pPos.y) > 2.6) continue;
      this.damageEnemy(e, dmg, fwd);
      hitAny = true;
    }
    if (hitAny) sfx.hit();
  }

  private damageEnemy(e: Enemy, dmg: number, dir: THREE.Vector3) {
    e.hp -= dmg;
    e.flash = 0.14;
    e.bodyMat.emissive = new THREE.Color(0xffffff);
    e.bodyMat.emissiveIntensity = 0.7;
    const kbMul = e.kind === "boss" ? 0.15 : e.kind === "brute" ? 0.45 : 1;
    e.kb.addScaledVector(dir, 4.2 * kbMul);
    this.shake(0.16, e.kind === "boss" ? 0.35 : 0.22);
    this.burst(e.pos.clone().setY(e.pos.y + e.def.size * 0.6), e.def.color, e.kind === "boss" ? 10 : 6, 4);
    if (e.state === "sleep") this.wakeBrute(e);
    e.aggro = true;
    if (e.hp <= 0) this.killEnemy(e);
  }

  private wakeBrute(e: Enemy) {
    if (e.state !== "sleep") return;
    e.state = "chase";
    e.aggro = true;
    sfx.bossRoar();
    this.feed(`«${e.def.name}» se despertó. El sigilo duró lo que duró.`, "bad");
    this.shake(0.5, 0.4);
  }

  private killEnemy(e: Enemy) {
    e.dead = true;
    this.worldGroup.remove(e.group);
    const isBoss = e.kind === "boss";
    const isBrute = e.kind === "brute";
    this.kills++;
    this.score += isBoss ? 500 : isBrute ? 150 : 50;
    this.burst(e.pos.clone().setY(e.pos.y + e.def.size / 2), e.def.color, isBoss ? 42 : 16, isBoss ? 9 : 6, isBoss ? 0.3 : 0.18);
    if (isBoss) {
      sfx.bossRoar();
      sfx.portal();
      this.portalActive = true;
      this.portalInnerMat.opacity = 0.5;
      this.shake(0.9, 0.8);
      this.feed(`¡JEFE DERROTADO! +500 PTS — El portal ruge hacia la siguiente era.`, "good");
    } else {
      const line = this.era.killLines[Math.floor(Math.random() * this.era.killLines.length)];
      this.feed(`${e.def.name}: ${line}. +${isBrute ? 150 : 50} pts`, "fun");
      if (Math.random() > 0.35) {
        const corpseMesh = new THREE.Mesh(
          new THREE.BoxGeometry(e.def.size, e.def.size * 0.38, e.def.size * 0.72),
          new THREE.MeshLambertMaterial({ color: new THREE.Color(e.def.color).multiplyScalar(0.72) })
        );
        corpseMesh.position.set(e.pos.x, e.pos.y + e.def.size * 0.19, e.pos.z);
        corpseMesh.rotation.y = Math.random() * Math.PI;
        this.worldGroup.add(corpseMesh);
        this.corpses.push({ mesh: corpseMesh, pos: corpseMesh.position, name: e.def.name });
      }
      if (Math.random() > 0.6) this.addFrag(e.pos.x, e.pos.y, e.pos.z);
    }
  }

  private tryPush() {
    if (this.pushCd > 0 || this.pDead) return;
    this.pushCd = 0.8;
    sfx.push();
    const fwd = this.forward();
    for (const e of this.enemies) {
      if (e.dead) continue;
      const dx = e.pos.x - this.pPos.x, dz = e.pos.z - this.pPos.z;
      const dist = Math.hypot(dx, dz);
      if (dist > 2.2) continue;
      const mul = e.kind === "boss" ? 0.08 : e.kind === "brute" ? 0.5 : 1;
      e.kb.addScaledVector(fwd, 8 * mul);
      if (e.state === "sleep") this.wakeBrute(e);
      e.aggro = true;
    }
    const dx = this.cPos.x - this.pPos.x, dz = this.cPos.z - this.pPos.z;
    if (!this.cDown && Math.hypot(dx, dz) < 2.2) {
      this.cVel.addScaledVector(fwd, 10);
      this.cPushT = 2.5;
      this.feed("Empujas a Pipo. La amistad se resiente (-5).", "fun");
    }
  }

  private useConsumable(i: number) {
    if (this.pDead || this.cons[i] <= 0) return;
    this.cons[i]--;
    if (i === 0) {
      const p = this.pPos.clone().addScaledVector(this.forward(), -1.1);
      p.y = Math.max(this.terrainAt(p.x, p.z), this.pPos.y) + 0.04;
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.07, 0.55), new THREE.MeshLambertMaterial({ color: 0xffe24a }));
      mesh.position.copy(p).setY(p.y + 0.03);
      mesh.rotation.y = Math.random() * 3;
      this.worldGroup.add(mesh);
      this.bananas.push({ mesh, pos: p, t: 22, dead: false });
      this.feed("Cáscara de plátano desplegada. Que el karma decida.", "fun");
      sfx.ui();
    } else if (i === 1) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.34, 0.34), new THREE.MeshLambertMaterial({ color: 0x7fae3e }));
      const p = this.pPos.clone().setY(this.pPos.y + 1.2);
      mesh.position.copy(p);
      this.worldGroup.add(mesh);
      this.stinks.push({
        mesh, cloud: null, pos: p,
        vel: this.forward().multiplyScalar(9).setY(4),
        t: 0, landed: false,
      });
      sfx.stink();
      this.feed("Granada fétida lanzada. Huele a decisión cuestionable.", "fun");
    } else {
      this.adrenalineT = 6;
      this.feed("ADRENALINA: +50% velocidad durante 6 s. ¡ZASCA!", "good");
      sfx.pickup();
    }
    this.pushHud();
  }

  private damagePlayer(dmg: number, cause: string) {
    if (this.invulnT > 0 || this.pDead || this.phase !== "playing") return;
    this.pHp -= dmg;
    this.invulnT = 0.65;
    this.hurtCounter++;
    this.shake(0.45, 0.5);
    sfx.hurt();
    if (this.pHp <= 0) {
      this.pHp = 0;
      this.die(cause);
    }
    this.pushHud();
  }

  private die(cause: string) {
    this.pDead = true;
    const absurd = ABSURD_DEATHS.find((d) => d.cause === cause);
    if (absurd) this.deathLine = absurd.line;
    else this.deathLine = `«${cause}» cerró tu expediente con ${this.era.flavor}`;
    this.phase = "over";
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
    sfx.death();
    this.pushHud();
  }

  private damageCompanion(dmg: number) {
    if (this.cDown) return;
    this.cHp -= dmg;
    this.burst(this.cPos.clone().setY(this.cPos.y + 0.6), 0xb45cff, 6, 4);
    if (this.cHp <= 0) {
      this.cHp = 0;
      this.cDown = true;
      this.cDownT = 0;
      this.compGroup.rotation.z = Math.PI / 2;
      this.feed("¡PIPO ESTÁ CAÍDO! Mantén E cerca para reanimarlo.", "bad");
      sfx.hurt();
    }
  }

  private shake(t: number, amp: number) {
    this.shakeT = Math.max(this.shakeT, t);
    this.shakeAmp = Math.max(this.shakeAmp, amp);
  }

  // ---------------- particles ----------------
  private burst(pos: THREE.Vector3, color: number, n: number, speed: number, size = 0.16) {
    for (let i = 0; i < n; i++) {
      let p = this.particlePool.pop();
      if (!p) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), new THREE.MeshBasicMaterial({ color }));
        mesh.material = mesh.material as THREE.MeshBasicMaterial;
        p = { mesh, vel: new THREE.Vector3(), life: 0, maxLife: 1 };
      }
      (p.mesh.material as THREE.MeshBasicMaterial).color.set(color);
      p.mesh.scale.setScalar(1);
      p.mesh.position.copy(pos);
      p.vel.set((Math.random() - 0.5) * speed, Math.random() * speed * 0.8, (Math.random() - 0.5) * speed);
      p.maxLife = p.life = 0.5 + Math.random() * 0.45;
      p.mesh.visible = true;
      this.worldGroup.add(p.mesh);
      this.particles.push(p);
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        p.mesh.visible = false;
        this.worldGroup.remove(p.mesh);
        this.particles.splice(i, 1);
        this.particlePool.push(p);
        continue;
      }
      p.vel.y -= 13 * dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      const s = clamp(p.life / p.maxLife, 0.05, 1);
      p.mesh.scale.setScalar(s);
    }
  }

  // ---------------- interact ----------------
  private computeInteract(): { kind: string | null; obj: Enemy | Corpse | ControlPoint | Chest | null; prompt: string | null } {
    if (this.pDead) return { kind: null, obj: null, prompt: null };
    // revive companion
    if (this.cDown && this.cPos.distanceTo(this.pPos) < 2.4) {
      return { kind: "revive", obj: null, prompt: "E (mantener)|REANIMAR A PIPO" };
    }
    for (const c of this.chests) {
      if (!c.opened && c.pos.distanceTo(this.pPos) < 2.1) return { kind: "chest", obj: c, prompt: "E|ABRIR ALIJO" };
    }
    for (const cp of this.cps) {
      if (cp.pos.distanceTo(this.pPos) < 2.8) {
        if (cp.used) return { kind: "cpUsed", obj: cp, prompt: null };
        if (this.frags > 0) return { kind: "cp", obj: cp, prompt: `E|DESCARGAR ${this.frags} FRAGMENTO${this.frags > 1 ? "S" : ""} (+TIEMPO)` };
        return { kind: "cpEmpty", obj: cp, prompt: "—|FALTAN FRAGMENTOS AZULES" };
      }
    }
    if (this.portalActive && this.portalPos.distanceTo(this.pPos) < 3.4) {
      const last = this.eraIdx >= TOTAL_ERAS - 1;
      return { kind: "portal", obj: null, prompt: last ? "E|COMPLETAR LA MISIÓN" : "E|VIAJAR A LA SIGUIENTE ERA" };
    }
    if (this.carried) return { kind: "drop", obj: this.carried, prompt: "E|SOLTAR CADAVER" };
    for (const co of this.corpses) {
      if (co.pos.distanceTo(this.pPos) < 2.1) return { kind: "corpse", obj: co, prompt: "E|ARRASTRAR CADAVER" };
    }
    return { kind: null, obj: null, prompt: null };
  }

  private doInteract() {
    const it = this.computeInteract();
    if (!it.kind) return;
    if (it.kind === "chest") {
      const c = it.obj as Chest;
      c.opened = true;
      c.lid.rotation.x = -1.35;
      c.lid.position.z -= 0.3;
      sfx.chest();
      this.burst(c.pos.clone().setY(c.pos.y + 1), 0xffe24a, 10, 4);
      const roll = Math.random();
      if (roll < 0.58) {
        const pool = this.era.weapons;
        let w = pool[Math.floor(Math.random() * pool.length)];
        if (this.weapon && w.name === this.weapon.name) w = pool[(pool.indexOf(w) + 1) % pool.length];
        this.weapon = w;
        this.updateWeaponMesh();
        this.feed(`ARMA: ${w.name} (se pierde al completar la isla).`, "good");
      } else {
        const ci = Math.floor(Math.random() * 3);
        const amount = 1 + (Math.random() > 0.6 ? 1 : 0);
        this.cons[ci] += amount;
        const names = ["cáscaras de plátano", "granadas fétidas", "adrenalina"];
        this.feed(`Botín: +${amount} ${names[ci]}.`, "good");
      }
    } else if (it.kind === "cp") {
      const cp = it.obj as ControlPoint;
      cp.used = true;
      cp.coreMat.color.set(0x555555);
      cp.coreMat.emissive.set(0x222222);
      cp.coreMat.emissiveIntensity = 0.2;
      const gained = 8 + 3 * this.frags + Math.floor(this.score / 150);
      this.timeLeft = Math.min(999, this.timeLeft + gained);
      this.score += 25 * this.frags;
      this.deposited += this.frags;
      this.lastCPPos.copy(cp.pos);
      sfx.deposit();
      this.burst(cp.pos.clone().setY(cp.pos.y + 2), 0x38e1ff, 22, 6);
      this.feed(`TIEMPO EXTENDIDO +${gained}s — punto de control agotado (uso único).`, "good");
      this.frags = 0;
    } else if (it.kind === "portal") {
      this.completeEra();
    } else if (it.kind === "corpse") {
      this.carried = it.obj as Corpse;
      this.feed(`Arrastras el cadáver de ${this.carried.name}. Cuestionable, pero efectivo.`, "fun");
    } else if (it.kind === "drop") {
      this.carried = null;
    }
    this.pushHud();
  }

  private completeEra() {
    this.score += 1000;
    this.timeLeft = Math.min(999, this.timeLeft + 45);
    this.erasCleared++;
    this.weapon = null;
    this.updateWeaponMesh();
    sfx.eraClear();
    if (this.eraIdx >= TOTAL_ERAS - 1) {
      this.phase = "victory";
      if (document.pointerLockElement === this.canvas) document.exitPointerLock();
      sfx.victory();
      this.feed("MISIÓN CUMPLIDA: las cinco eras son tuyas.", "good");
      this.pushHud();
      return;
    }
    const next = this.eraIdx + 1;
    const nextEra = ERAS[next];
    const nextCtx = nextEra.contexts[Math.floor(Math.random() * nextEra.contexts.length)];
    this.transInfo = { num: nextEra.numeral, name: nextEra.name, context: nextCtx };
    this.phase = "transition";
    this.transT = 2.3;
    this.feed(`ERA SUPERADA +1000 PTS · +45s. Tu arma se pierde en el salto temporal.`, "good");
    this.pushHud();
    setTimeout(() => {
      if (this.disposed) return;
      this.buildIslandFromTransition(next, nextCtx);
    }, 1150);
  }

  private buildIslandFromTransition(next: number, ctx: string) {
    const saved = this.context;
    this.buildIsland(next);
    this.context = ctx;
    void saved;
    this.transT = Math.min(this.transT, 0.9);
  }

  // ============================ update ============================
  private moveHorizontal(pos: THREE.Vector3, dx: number, dz: number, radius: number): { x: boolean; z: boolean } {
    const res = { x: true, z: true };
    const blocked = (nx: number, nz: number) => {
      for (const c of this.colliders) {
        if (nx + radius > c.minX && nx - radius < c.maxX && nz + radius > c.minZ && nz - radius < c.maxZ) {
          if (c.top > pos.y + STEP_UP) return true;
        }
      }
      return false;
    };
    if (dx !== 0 && !blocked(pos.x + dx, pos.z)) pos.x += dx;
    else if (dx !== 0) res.x = false;
    if (dz !== 0 && !blocked(pos.x, pos.z + dz)) pos.z += dz;
    else if (dz !== 0) res.z = false;
    return res;
  }

  private groundAt(x: number, z: number, feetY: number): number {
    let g = this.terrainAt(x, z);
    for (const c of this.colliders) {
      if (x > c.minX && x < c.maxX && z > c.minZ && z < c.maxZ && c.top <= feetY + STEP_UP && c.top > g) g = c.top;
    }
    return g;
  }

  private updatePlayer(dt: number) {
    if (this.pDead) return;
    this.attackCd -= dt; this.swingT -= dt; this.invulnT -= dt; this.pushCd -= dt;
    if (this.adrenalineT > 0) this.adrenalineT -= dt;

    this.crouching = this.keys.has("KeyC") || this.keys.has("ControlLeft");
    const wantSprint = (this.keys.has("ShiftLeft") || this.keys.has("ShiftRight")) && !this.crouching;
    const fwdIn = (this.keys.has("KeyW") ? 1 : 0) - (this.keys.has("KeyS") ? 1 : 0);
    const strIn = (this.keys.has("KeyD") ? 1 : 0) - (this.keys.has("KeyA") ? 1 : 0);
    const moving = fwdIn !== 0 || strIn !== 0;
    this.sprinting = wantSprint && moving && this.stam > 4;
    if (this.sprinting) this.stam = Math.max(0, this.stam - 21 * dt);
    else this.stam = Math.min(100, this.stam + 15 * dt);

    let speed = this.crouching ? 2.7 : this.sprinting ? 8.4 : 5.1;
    if (this.adrenalineT > 0) speed *= 1.5;

    const fwd = this.forward();
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const wish = new THREE.Vector3()
      .addScaledVector(fwd, fwdIn)
      .addScaledVector(right, strIn);
    if (wish.lengthSq() > 0) wish.normalize().multiplyScalar(speed);

    this.moveHorizontal(this.pPos, wish.x * dt, wish.z * dt, 0.42);

    // jump & gravity
    const canJump = this.keys.has("Space") && this.grounded;
    if (canJump) { this.pVel.y = JUMP_V; this.grounded = false; }
    this.pVel.y -= G * dt;
    this.pPos.y += this.pVel.y * dt;
    const ground = this.groundAt(this.pPos.x, this.pPos.z, this.pPos.y);
    if (this.pPos.y <= ground) { this.pPos.y = ground; this.pVel.y = 0; this.grounded = true; }
    else if (this.pPos.y - ground > 0.05) this.grounded = false;

    if (this.pPos.y < -12) { this.die("void"); return; }

    // camera
    const targetH = this.crouching ? 0.95 : 1.55;
    this.camH = lerp(this.camH, targetH, dt * 12);
    const bobAmp = moving && this.grounded ? (this.sprinting ? 0.05 : 0.028) : 0;
    this.elapsed += dt * (this.sprinting ? 12 : 8);
    const bob = Math.sin(this.elapsed) * bobAmp;
    this.camera.position.set(this.pPos.x, this.pPos.y + this.camH + bob, this.pPos.z);
    if (this.shakeT > 0) {
      this.shakeT -= dt;
      const a = this.shakeAmp * this.shakeT * 2;
      this.camShake.set((Math.random() - 0.5) * a * 0.16, (Math.random() - 0.5) * a * 0.16, (Math.random() - 0.5) * a * 0.1);
      this.camera.position.add(this.camShake);
      if (this.shakeT <= 0) this.shakeAmp = 0;
    }
    this.camera.rotation.set(this.pitch, this.yaw, 0);

    // weapon anim
    if (this.weaponMesh) {
      const swing = this.swingT > 0 ? Math.sin(((0.18 - this.swingT) / 0.18) * Math.PI) : 0;
      this.weaponGroup.rotation.x = -swing * 1.15;
      this.weaponGroup.rotation.z = swing * 0.3;
      this.weaponGroup.position.y = -swing * 0.08 + bob * 0.6;
    }

    // interact
    const it = this.computeInteract();
    this.prompt = it.prompt;
    this.interactKind = it.kind;
    this.interactObj = it.obj;
    if (it.kind === "revive") {
      if (this.keys.has("KeyE")) {
        this.revivePct += dt / 1.5;
        if (this.revivePct >= 1) {
          this.revivePct = 0;
          this.cDown = false;
          this.cHp = 55;
          this.compGroup.rotation.z = 0;
          sfx.revive();
          this.feed("Pipo reanimado. «Me debes una», murmura.", "good");
          this.pushHud();
        }
      } else this.revivePct = Math.max(0, this.revivePct - dt * 2);
    } else this.revivePct = 0;
    if (this.interactPressed) {
      this.interactPressed = false;
      if (it.kind !== "revive") this.doInteract();
    }

    // pickups
    for (const f of this.fragsList) {
      if (f.taken) continue;
      const d = Math.hypot(f.pos.x - this.pPos.x, f.pos.z - this.pPos.z);
      if (d < 1.3 && Math.abs(f.pos.y - this.pPos.y) < 2.4) {
        f.taken = true;
        f.mesh.visible = false;
        this.frags++;
        this.score += 10;
        sfx.pickup();
        this.burst(f.mesh.position.clone(), 0x38e1ff, 7, 3.4, 0.1);
      }
    }
  }

  private updateCompanion(dt: number) {
    this.cAttackCd -= dt;
    if (this.cPushT > 0) this.cPushT -= dt;
    if (this.cDown) {
      this.cDownT += dt;
      const pulse = 1 + Math.sin(this.elapsed * 2) * 0.04;
      this.compBody.scale.setScalar(pulse);
      if (this.cDownT > 30) {
        this.cDown = false;
        this.cHp = 60;
        this.compGroup.rotation.z = 0;
        this.cPos.set(this.lastCPPos.x + 1.4, this.lastCPPos.y, this.lastCPPos.z + 1.4);
        this.cVel.set(0, 0, 0);
        this.feed("Pipo se ha redesplegado en el último punto de control.", "info");
      }
    } else {
      this.compBody.scale.setScalar(1);
      // engage nearest enemy
      let target: Enemy | null = null;
      let bestD = 8;
      for (const e of this.enemies) {
        if (e.dead || e.state === "sleep") continue;
        const d = e.pos.distanceTo(this.cPos);
        if (d < bestD) { bestD = d; target = e; }
      }
      let dest: THREE.Vector3;
      if (target) {
        dest = target.pos;
        if (bestD < 1.9 && this.cAttackCd <= 0) {
          this.cAttackCd = 0.9;
          this.damageEnemy(target, 13, new THREE.Vector3().subVectors(target.pos, this.cPos).normalize());
          sfx.hit();
        }
      } else {
        const back = this.forward().multiplyScalar(-1.7);
        const side = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw)).multiplyScalar(1.1);
        dest = this.pPos.clone().add(back).add(side);
      }
      const dx = dest.x - this.cPos.x, dz = dest.z - this.cPos.z;
      const dist = Math.hypot(dx, dz);
      const stopD = target ? 1.4 : 0.7;
      if (dist > stopD) {
        const sp = target ? 5.6 : Math.min(7.5, dist * 3);
        const vx = (dx / dist) * sp, vz = (dz / dist) * sp;
        this.cVel.x = lerp(this.cVel.x, vx, dt * 8);
        this.cVel.z = lerp(this.cVel.z, vz, dt * 8);
        this.compGroup.rotation.y = Math.atan2(dx, dz);
      } else {
        this.cVel.x = lerp(this.cVel.x, 0, dt * 10);
        this.cVel.z = lerp(this.cVel.z, 0, dt * 10);
      }
      // physics
      this.cVel.y -= G * dt;
      const nx = this.cPos.x + this.cVel.x * dt;
      const nz = this.cPos.z + this.cVel.z * dt;
      const tNx = this.terrainAt(nx, nz);
      if (tNx > -50 || this.cVel.y < 0) {
        if (this.cVel.x * dt !== 0 || true) {
          this.moveHorizontal(this.cPos, this.cVel.x * dt, this.cVel.z * dt, 0.4);
        }
      }
      this.cPos.y += this.cVel.y * dt;
      const g = this.groundAt(this.cPos.x, this.cPos.z, this.cPos.y);
      if (this.cPos.y <= g) { this.cPos.y = g; this.cVel.y = 0; }
      if (this.cPos.y < -12) {
        this.cDown = true;
        this.cDownT = 26;
        this.cPos.set(this.lastCPPos.x + 1.4, this.lastCPPos.y + 20, this.lastCPPos.z + 1.4);
        this.cVel.set(0, 0, 0);
        this.compGroup.rotation.z = Math.PI / 2;
        this.feed(this.cPushT > 0 ? "Empujaste a Pipo al vacío. Él no lo olvidará." : "Pipo cayó al vacío. El seguro no cubre islas flotantes.", "fun");
      }
    }
    this.compGroup.position.copy(this.cPos);
    this.compGroup.visible = true;
  }

  private updateEnemies(dt: number) {
    for (const e of this.enemies) {
      if (e.dead) continue;
      e.attackCd -= dt; e.slamCd -= dt; e.flash -= dt;
      if (e.flash <= 0) e.bodyMat.emissiveIntensity = 0;

      // knockback
      if (e.kb.lengthSq() > 0.001) {
        const nx = e.pos.x + e.kb.x * dt, nz = e.pos.z + e.kb.z * dt;
        if (this.terrainAt(nx, nz) > -50) { e.pos.x = nx; e.pos.z = nz; }
        e.kb.multiplyScalar(Math.max(0, 1 - 7 * dt));
      }

      // stun (banana)
      if (e.stun > 0) {
        e.stun -= dt;
        e.group.rotation.z = Math.PI / 2;
        e.group.position.copy(e.pos);
        continue;
      } else if (e.kind !== "brute" || e.state !== "sleep") {
        e.group.rotation.z = 0;
      }

      // targets
      const dPlayer = this.pDead ? 999 : e.pos.distanceTo(this.pPos);
      const dComp = this.cDown ? 999 : e.pos.distanceTo(this.cPos);
      const toPlayer = dPlayer <= dComp;
      const targetDist = Math.min(dPlayer, dComp);
      const targetPos = toPlayer ? this.pPos : this.cPos;

      if (e.kind === "boss" && !e.aggro && dPlayer < 14) {
        e.aggro = true;
        sfx.bossRoar();
        this.shake(0.6, 0.5);
        this.feed(`¡${e.def.name} TE HA VISTO! Que sea lo que el tiempo quiera.`, "bad");
      }

      // attractor (stink)
      let dest: THREE.Vector3 | null = e.attract && e.attractT > 0 ? e.attract : null;
      if (e.attractT > 0) e.attractT -= dt;

      if (e.state === "sleep") {
        const crouchMul = this.crouching ? 0.5 : 1;
        const sprintMul = this.sprinting ? 1.6 : 1;
        const det = (e.def as unknown as { detect?: number }).detect ?? 7;
        if (dPlayer < det * crouchMul * sprintMul) this.wakeBrute(e);
        e.group.position.copy(e.pos);
        const breath = 1 + Math.sin(this.elapsed * 0.8) * 0.03;
        e.body.scale.setScalar(breath);
        continue;
      }

      const chaseRange = e.kind === "boss" ? 999 : e.aggro ? 13 : 9;
      const shouldChase = dest !== null || (e.aggro && targetDist < chaseRange) || (e.kind === "normal" && targetDist < 8 && (e.attract !== null || true) && targetDist < 8);

      let moveTarget: THREE.Vector3;
      if (dest) moveTarget = dest;
      else if (shouldChase && targetDist < chaseRange) moveTarget = targetPos;
      else {
        // patrol
        if (e.pos.distanceTo(e.waypoint) < 1.2) {
          const a = Math.random() * Math.PI * 2;
          e.waypoint.set(e.home.x + Math.cos(a) * 5, 0, e.home.z + Math.sin(a) * 5);
        }
        moveTarget = e.waypoint;
      }

      const dx = moveTarget.x - e.pos.x, dz = moveTarget.z - e.pos.z;
      const dist = Math.hypot(dx, dz);
      const attackRange = e.def.size * 0.75 + 1.15;
      const stopDist = dest ? 1.5 : attackRange;
      if (dist > stopDist) {
        let sp = e.def.speed;
        if (e.kind === "boss" && e.aggro && targetDist > 8) sp *= 1.85;
        if (e.kind === "brute") sp *= e.state === "chase" ? 1.12 : 1;
        const nx = e.pos.x + (dx / dist) * sp * dt;
        const nz = e.pos.z + (dz / dist) * sp * dt;
        if (this.terrainAt(nx, nz) > -50) { e.pos.x = nx; e.pos.z = nz; }
        e.group.rotation.y = Math.atan2(dx, dz);
      }

      // attacks
      if (e.kind === "boss" && e.aggro) {
        if (dPlayer < 5.6 && e.slamCd <= 0) {
          e.slamCd = 3.1;
          sfx.crit();
          this.shake(0.6, 0.9);
          this.burst(e.pos.clone().setY(e.pos.y + 0.6), 0xff7a1a, 18, 7, 0.24);
          if (dPlayer < 6.4) this.damagePlayer(e.def.dmg, e.def.name);
          if (!this.cDown && dComp < 6.4) this.damageCompanion(e.def.dmg * 0.8);
        }
        e.body.scale.setScalar(1 + Math.max(0, e.slamCd > 2.7 ? (3.1 - e.slamCd) * 0.35 : 0));
      } else if (targetDist < attackRange && e.attackCd <= 0 && !dest) {
        e.attackCd = 1.05;
        const lunge = 1.25;
        e.body.scale.set(lunge, 0.8, lunge);
        if (toPlayer) this.damagePlayer(e.def.dmg, e.def.name);
        else this.damageCompanion(e.def.dmg);
      }
      e.body.scale.x = lerp(e.body.scale.x, 1, dt * 8);
      e.body.scale.y = lerp(e.body.scale.y, 1, dt * 8);
      e.body.scale.z = lerp(e.body.scale.z, 1, dt * 8);

      e.pos.y = this.terrainAt(e.pos.x, e.pos.z);
      if (e.pos.y < -50) e.pos.y = 0;
      e.group.position.copy(e.pos);
    }
  }

  private updateWorldFx(dt: number) {
    const t = performance.now() / 1000;
    for (const f of this.fragsList) {
      if (f.taken) continue;
      f.mesh.rotation.y += dt * 2.4;
      f.mesh.position.y = f.base + Math.sin(t * 3 + f.phase) * 0.16;
    }
    for (const cp of this.cps) {
      if (!cp.used) {
        cp.core.rotation.y += dt * 1.8;
        cp.core.position.y = 1.95 + Math.sin(t * 2.6 + cp.pos.x) * 0.1;
      }
    }
    if (this.portalActive) {
      this.portalInnerMat.opacity = 0.4 + Math.sin(t * 5) * 0.18;
    }
    // bananas
    for (let i = this.bananas.length - 1; i >= 0; i--) {
      const b = this.bananas[i];
      b.t -= dt;
      const victims: Array<{ pos: THREE.Vector3; kind: "p" | "c" | "e"; e?: Enemy }> = [];
      if (!this.pDead) victims.push({ pos: this.pPos, kind: "p" });
      if (!this.cDown) victims.push({ pos: this.cPos, kind: "c" });
      for (const e of this.enemies) if (!e.dead && e.stun <= 0) victims.push({ pos: e.pos, kind: "e", e });
      let triggered = false;
      for (const v of victims) {
        if (Math.hypot(v.pos.x - b.pos.x, v.pos.z - b.pos.z) < 0.85) {
          triggered = true;
          sfx.slip();
          this.burst(b.pos.clone().setY(b.pos.y + 0.3), 0xffe24a, 8, 3.5, 0.1);
          if (v.kind === "p") {
            this.damagePlayer(6, "banana");
            this.shake(0.4, 0.5);
            this.feed("Resbalaste con tu propia cáscara. Cosas que pasan.", "fun");
          } else if (v.kind === "c") {
            this.cVel.y = 5;
            this.damageCompanion(4);
            this.feed("Pipo resbaló con la cáscara. Se ríe por no llorar.", "fun");
          } else if (v.e) {
            v.e.stun = 2.6;
            this.feed(`${v.e.def.name} resbaló con la cáscara. Humillante.`, "fun");
          }
          break;
        }
      }
      if (triggered || b.t <= 0) {
        this.worldGroup.remove(b.mesh);
        this.bananas.splice(i, 1);
      }
    }
    // stinks
    for (let i = this.stinks.length - 1; i >= 0; i--) {
      const s = this.stinks[i];
      if (!s.landed) {
        s.vel.y -= 18 * dt;
        s.pos.addScaledVector(s.vel, dt);
        s.mesh.position.copy(s.pos);
        s.mesh.rotation.x += dt * 8;
        const g = this.terrainAt(s.pos.x, s.pos.z);
        if (s.pos.y <= Math.max(g, 0) + 0.2 || s.t > 1.4) {
          s.landed = true;
          s.pos.y = Math.max(g, 0) + 0.4;
          s.mesh.position.copy(s.pos);
          const cloud = new THREE.Mesh(
            new THREE.BoxGeometry(2.4, 1.6, 2.4),
            new THREE.MeshBasicMaterial({ color: 0x7fae3e, transparent: true, opacity: 0.34 })
          );
          cloud.position.copy(s.pos).setY(s.pos.y + 0.8);
          this.worldGroup.add(cloud);
          s.cloud = cloud;
          s.t = 0;
          for (const e of this.enemies) {
            if (!e.dead) {
              e.attract = s.pos.clone();
              e.attractT = 6;
              if (e.state === "sleep") this.wakeBrute(e);
            }
          }
        }
        s.t += dt;
      } else {
        s.t += dt;
        if (s.cloud) {
          const sc = 1 + Math.sin(s.t * 6) * 0.12;
          s.cloud.scale.setScalar(sc);
          (s.cloud.material as THREE.MeshBasicMaterial).opacity = 0.34 * clamp(1 - (s.t - 0) / 6, 0, 1);
        }
        if (s.t > 6) {
          if (s.cloud) this.worldGroup.remove(s.cloud);
          this.worldGroup.remove(s.mesh);
          this.stinks.splice(i, 1);
        }
      }
    }
    // carried corpse
    if (this.carried) {
      const back = this.pPos.clone().addScaledVector(this.forward(), -1.3);
      back.y = this.pPos.y + 0.7;
      this.carried.mesh.position.lerp(back, 0.35);
      this.carried.mesh.rotation.z += dt * 2;
    }
    // ambient motes
    if (this.ambient) {
      const m = new THREE.Matrix4();
      const rising = this.era.propStyle === "future";
      for (let i = 0; i < this.ambientSpd.length; i++) {
        this.ambient.getMatrixAt(i, m);
        const p = new THREE.Vector3().setFromMatrixPosition(m);
        p.y += (rising ? 1 : -1) * this.ambientSpd[i] * dt;
        if (p.y < -1) p.y = 22;
        if (p.y > 23) p.y = 0;
        m.makeTranslation(p.x, p.y, p.z);
        this.ambient.setMatrixAt(i, m);
      }
      this.ambient.instanceMatrix.needsUpdate = true;
    }
  }

  private updateTimer(dt: number) {
    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.die("time");
      return;
    }
    if (this.timeLeft < 20) {
      this.hbT -= dt;
      if (this.hbT <= 0) {
        this.hbT = this.timeLeft < 10 ? 0.62 : 1.0;
        sfx.heartbeat();
      }
    }
  }

  // ============================ hud & feed ============================
  private feed(text: string, tone: FeedItem["tone"]) {
    this.cb.onFeed({ id: Date.now() + Math.random(), text, tone });
  }

  private pushHud() {
    const era = this.era;
    const boss = this.boss && this.boss.aggro && !this.boss.dead ? this.boss : null;
    this.cb.onHud({
      phase: this.phase,
      eraIdx: this.eraIdx,
      eraNum: era.numeral,
      eraName: era.name,
      context: this.context,
      time: this.timeLeft,
      score: this.score,
      frags: this.frags,
      hp: this.pHp,
      stam: this.stam,
      crouch: this.crouching,
      sprint: this.sprinting,
      rush: this.adrenalineT > 0,
      compHp: this.cHp,
      compDown: this.cDown,
      weapon: this.weapon ? this.weapon.name : "Puños de comando",
      cons: [...this.cons] as [number, number, number],
      bossName: boss ? boss.def.name : null,
      bossHp: boss ? Math.max(0, boss.hp) : 0,
      bossMax: boss ? boss.maxHp : 1,
      prompt: this.prompt,
      revivePct: this.revivePct,
      hurt: this.hurtCounter,
      carry: this.carried !== null,
      deathLine: this.deathLine,
      stats: { kills: this.kills, deposited: this.deposited, eras: this.erasCleared },
      transition: this.phase === "transition" ? this.transInfo : null,
    });
  }

  private updateWeaponMesh() {
    if (this.weaponMesh) {
      this.weaponGroup.remove(this.weaponMesh);
      this.weaponMesh.geometry.dispose();
      (this.weaponMesh.material as THREE.Material).dispose();
      this.weaponMesh = null;
    }
    const w = this.weapon;
    const geo = w ? new THREE.BoxGeometry(0.14, 0.14, w.len) : new THREE.BoxGeometry(0.24, 0.24, 0.3);
    const mat = new THREE.MeshLambertMaterial({ color: w ? w.color : 0x4d8dff, emissive: w && this.eraIdx === 4 ? w.color : 0x000000, emissiveIntensity: 0.6 });
    this.weaponMesh = new THREE.Mesh(geo, mat);
    this.weaponMesh.position.set(0.55, -0.48, -0.8 - (w ? w.len * 0.2 : 0));
    this.weaponGroup.add(this.weaponMesh);
  }

  // ============================ main loop ============================
  private loop = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(this.clock.getDelta(), 0.05);

    if (this.phase === "playing") {
      this.updatePlayer(dt);
      if (this.phase === "playing") {
        this.updateCompanion(dt);
        this.updateEnemies(dt);
        this.updateWorldFx(dt);
        this.updateTimer(dt);
      }
    } else if (this.phase === "menu") {
      this.menuAngle += dt * 0.11;
      const r = 46;
      this.camera.position.set(Math.cos(this.menuAngle) * r, 21 + Math.sin(this.menuAngle * 2.2) * 2.5, Math.sin(this.menuAngle) * r);
      this.camera.lookAt(0, 2.5, 0);
      this.updateWorldFx(dt);
    } else if (this.phase === "transition") {
      this.transT -= dt;
      this.camera.position.y += dt * 4;
      this.updateWorldFx(dt);
      if (this.transT <= 0) {
        this.phase = "playing";
        this.transInfo = null;
        this.canvas.requestPointerLock();
      }
    } else if (this.phase === "over" || this.phase === "victory") {
      this.updateWorldFx(dt);
    }

    this.hudT -= dt;
    if (this.hudT <= 0) {
      this.hudT = 0.1;
      this.pushHud();
    }
    this.renderer.render(this.scene, this.camera);
  };
}
