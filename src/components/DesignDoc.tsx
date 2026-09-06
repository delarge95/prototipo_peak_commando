import { ERAS, TOTAL_ERAS, CONSUMABLES, ABSURD_DEATHS } from "../game/eras";

const eraSwatch: Record<number, string> = { 0: "#4d7a3a", 1: "#5a5f66", 2: "#c9974f", 3: "#5c6b52", 4: "#35e0ff" };

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <div className="mb-4 flex items-center gap-3">
        <span className="font-display chamfer-sm bg-[#ffb02e] px-2.5 py-1 text-sm text-[#17130a]">{num}</span>
        <h2 className="font-display text-2xl text-[#e8e4d0] sm:text-3xl">{title}</h2>
        <div className="h-px flex-1 bg-[#31412f]" />
      </div>
      {children}
    </section>
  );
}

function Panel({ title, children, accent }: { title?: string; children: React.ReactNode; accent?: string }) {
  return (
    <div className="chamfer border border-[#31412f] bg-[rgba(13,20,14,0.85)] p-4">
      {title && (
        <div className="font-display mb-2 text-sm" style={{ color: accent ?? "#ffb02e" }}>{title}</div>
      )}
      {children}
    </div>
  );
}

function IslandDiagram() {
  return (
    <svg viewBox="0 0 340 230" className="w-full max-w-[520px]">
      <polygon
        points="60,95 95,45 165,30 245,48 292,95 285,150 230,192 150,200 85,175 50,140"
        fill="#1c2718" stroke="#31412f" strokeWidth="2"
      />
      <polygon points="120,80 180,70 220,100 200,140 130,135" fill="#25301f" stroke="#31412f" />
      {/* spawn */}
      <polygon points="84,168 96,168 90,156" fill="#4d8dff" />
      <text x="60" y="185" fill="#8a8468" fontSize="9" fontFamily="Chakra Petch">SPAWN</text>
      {/* dungeons */}
      <rect x="112" y="62" width="12" height="12" fill="#6fae4e" />
      <text x="100" y="56" fill="#8a8468" fontSize="9" fontFamily="Chakra Petch">FÁCIL</text>
      <rect x="212" y="74" width="12" height="12" fill="#ffb02e" />
      <text x="228" y="82" fill="#8a8468" fontSize="9" fontFamily="Chakra Petch">MEDIA</text>
      <rect x="176" y="148" width="12" height="12" fill="#ff4438" />
      <text x="160" y="172" fill="#8a8468" fontSize="9" fontFamily="Chakra Petch">DIFÍCIL</text>
      <rect x="243" y="132" width="10" height="10" fill="#ff3bd4" opacity="0.9" />
      <text x="240" y="156" fill="#8a8468" fontSize="9" fontFamily="Chakra Petch">LEGENDARIA*</text>
      {/* control points */}
      {[ [130,110],[190,105],[150,85] ].map(([x, y], i) => (
        <g key={i}>
          <polygon points={`${x - 5},${y + 4} ${x + 5},${y + 4} ${x},${y - 6}`} fill="#38e1ff" />
        </g>
      ))}
      <text x="230" y="105" fill="#38e1ff" fontSize="9" fontFamily="Chakra Petch">P. CONTROL ×3</text>
      {/* boss */}
      <rect x="252" y="55" width="20" height="20" fill="#ff4438" stroke="#ffb02e" strokeWidth="2" />
      <text x="243" y="48" fill="#ff8a80" fontSize="9" fontFamily="Chakra Petch">JEFE + PORTAL</text>
      {/* areas */}
      <circle cx="170" cy="115" r="88" fill="none" stroke="#8a8468" strokeWidth="1" strokeDasharray="4 5" opacity="0.5" />
      <text x="88" y="205" fill="#8a8468" fontSize="9" fontFamily="Chakra Petch">10–12 ÁREAS DE SPAWN DE MAZMORRA (SE ELIGEN 8)</text>
      <text x="88" y="218" fill="#8a8468" fontSize="9" fontFamily="Chakra Petch">*RAREZA MÁXIMA: SIN DESAFÍO, SOLO BOTÍN</text>
    </svg>
  );
}

const UNITY_TREE = `PeakCommando/ (Unity 6 · Netcode for GameObjects)
├── Core/
│   ├── GameFlowDirector      → menú · run · derrota · victoria (loop roguelite)
│   ├── TimeDirector          → cronómetro global · +Δt por descarga · colapso
│   ├── ScoreService          → puntuación → bonificación de tiempo
│   └── RunState              → "si se pierde, se inicia de cero"
├── Net/
│   ├── HostSession (autoritativo, 1–4 jugadores)
│   ├── PlayerRig : NetworkBehaviour   → azul / morado / verde / naranja
│   ├── CompanionSync · ReviveSync · CorpseDragSync
├── World/
│   ├── IslandAssembler        → isla bloque a partir de EraDefinition
│   ├── DungeonGenerator       → seed por isla · 8 de 10–12 áreas · pesos por zona
│   ├── PropScatter            → vegetación / ruinas / neón en bloques
│   └── BossArenaBuilder       → posición fija · portal a la siguiente era
├── Gameplay/
│   ├── LocomotionController   → caminar · correr · saltar · agacharse
│   ├── MeleeWeaponSystem      → arma se pierde al completar la isla
│   ├── LootTableService       → 8 armas por isla, 1 por mazmorra, sin repetirse
│   ├── ConsumableSystem       → plátano · fétida · adrenalina · bromas
│   ├── ReviveSystem           → caído → mantener E · muerto → punto de control
│   └── CorpseDragSystem       → arrastrar enemigos muertos
├── Content/ (ScriptableObjects)
│   ├── EraDefinition × 5+     → paleta · props · armas · enemigos · jefe
│   └── DungeonArchetype × 4   → fortaleza · sigilo · horda · cámara legendaria
└── Juice/
    ├── CubeFx · ScreenShake · HitStop
    └── AbsurdDeathDirector    → causa → línea cómica → pantalla de derrota`;

const PRANKS: [string, string, string, string][] = [
  ["Cáscara de plátano", "Se coloca en el suelo; quien pise resbala (aturdido 2.5 s).", "Sí: resbalón al vacío", "Alta"],
  ["Granada fétida", "Atrae a TODOS los enemigos al punto de impacto durante 6 s.", "Sí: sobre un compañero", "Muy alta"],
  ["Adrenalina", "+50% velocidad 6 s. Ideal para huir de lo que provocaste.", "No", "Baja"],
  ["Empujón (F)", "Empuja enemigos… y compañeros. La física hace el resto.", "Sí: empujón al abismo", "Legendaria"],
  ["Fragmento señuelo", "(Final) Brilla como un fragmento real. No lo es. Explota confeti.", "No (humillación)", "Media"],
  ["Colmena portátil", "(Final) Suéltala y 10 000 abejas cúbicas buscan cariño.", "Sí: muerte por abejas", "Absurda"],
  ["Arrastrar cadáver", "Carga enemigos muertos: estorban, tapan puertas o decoran.", "Indirecto", "Estética"],
  ["TNT de mano", "(Final) 3 s de mecha. Se puede lanzar… o regalar.", "Sí, evidentemente", "Total"],
];

const DEATH_LINES_EXTRA = [
  "Aplastado por un peñasco que 'no vio venir' (estaba encima).",
  "Pisó una colmena. Las abejas presentaron factura.",
  "Muerte por fuego amigo. De amistoso tuvo poco.",
  "El jefe lo tragó entero. Escupió el arma, eso sí.",
  "Estampida de cubosaurios. Nadie lo oyó quejarse.",
  "Se agachó tarde. El péndulo no negocia.",
];

export function DesignDoc({ onClose }: { onClose: () => void }) {
  return (
    <div className="tactical-bg scanlines absolute inset-0 z-40 overflow-hidden">
      <div className="flex h-full flex-col">
        <header className="flex shrink-0 items-center justify-between border-b border-[#31412f] bg-[rgba(10,15,11,0.95)] px-6 py-3.5">
          <div>
            <div className="font-display text-xl text-[#ffb02e]">PEAK COMMANDO</div>
            <div className="text-[10px] font-semibold tracking-[0.32em] text-[#8a8468]">
              DOCUMENTO DE DISEÑO Y ARQUITECTURA · v0.1 PROTOTIPO · CONFIDENCIAL DEL ESCUADRÓN
            </div>
          </div>
          <button className="btn-ghost px-5 py-2 text-sm" onClick={onClose}><span>× Cerrar briefing</span></button>
        </header>

        <div className="doc-scroll flex-1 overflow-y-auto px-6 py-8 sm:px-12">
          <div className="mx-auto max-w-[980px]">

            <Section num="01" title="Concepto y pilares">
              <div className="grid gap-3 sm:grid-cols-2">
                <Panel title="EL TIEMPO ES LA ÚNICA MONEDA">
                  <p className="text-[13px] leading-relaxed text-[#c9c09a]">
                    Como en <b className="text-[#e8e4d0]">Time Commando</b>, el cronómetro global se devora la partida. Los fragmentos azules
                    se descargan en puntos de control de <b className="text-[#38e1ff]">un solo uso</b> y el tiempo extra depende de la
                    puntuación acumulada: jugar bien literalmente da vida. Si llega a cero, <b className="text-[#ff4438]">se empieza de cero</b>.
                  </p>
                </Panel>
                <Panel title="CO-OP CON CONFIANZA LIMITADA">
                  <p className="text-[13px] leading-relaxed text-[#c9c09a]">
                    1–4 jugadores (azul, morado, verde, naranja). Reanimar al caído, revivir al muerto en puntos de control, arrastrar
                    cadáveres juntos… y consumibles pensados para <b className="text-[#ffb02e]">fastidiarse entre amigos</b> con consecuencias
                    potencialmente letales. La risa es un recurso renovable.
                  </p>
                </Panel>
                <Panel title="ISLAS-BLOQUE POR ERA">
                  <p className="text-[13px] leading-relaxed text-[#c9c09a]">
                    Cada era es una isla flotante 100% blocking: cubos para terreno, mazmorras, edificaciones y vegetación. Sin mapa —
                    la isla se reconoce explorando. Del neblinoso valle prehistórico al neón orbital, la paleta cuenta la época.
                  </p>
                </Panel>
                <Panel title="MUERTES PARA CONTAR EN EL CHAT">
                  <p className="text-[13px] leading-relaxed text-[#c9c09a]">
                    Caídas al vacío, plátanos homicidas, jefes que tragan, abejas sindicales. Cada muerte genera una línea absurda
                    <b className="text-[#e8e4d0]"> (AbsurdDeathDirector)</b> que el grupo recordará más que la victoria.
                  </p>
                </Panel>
              </div>
            </Section>

            <Section num="02" title="Eras y pipeline de contenido">
              <div className="chamfer overflow-hidden border border-[#31412f]">
                <table className="w-full text-left text-[12.5px]">
                  <thead>
                    <tr className="bg-[#141c13] text-[10px] tracking-[0.22em] text-[#8a8468]">
                      <th className="px-3 py-2">ERA</th><th className="px-3 py-2">ISLA (contextos rotativos)</th>
                      <th className="px-3 py-2">ARMAS DE EJEMPLO</th><th className="px-3 py-2">JEFE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ERAS.map((e) => (
                      <tr key={e.id} className="border-t border-[#25301f]">
                        <td className="px-3 py-2.5">
                          <span className="flex items-center gap-2">
                            <span className="inline-block h-3.5 w-3.5" style={{ background: eraSwatch[e.id] }} />
                            <span className="font-display text-[#e8e4d0]">{e.numeral} · {e.short.toUpperCase()}</span>
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-[#c9c09a]">{e.contexts.join(" · ")}</td>
                        <td className="px-3 py-2.5 text-[#c9c09a]">{e.weapons.slice(0, 2).map((w) => w.name).join(", ")}…</td>
                        <td className="px-3 py-2.5 text-[#ff8a80]">{e.boss.name}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-[#25301f]">
                      <td className="px-3 py-2.5 font-display text-[#8a8468]">VI…∞</td>
                      <td className="px-3 py-2.5 text-[#8a8468]" colSpan={3}>
                        Vikingos · Piratas · Egipto · Cyber-slums… cada era nueva es UN ScriptableObject (EraDefinition): paleta, props,
                        armas, enemigos, jefe, mazmorras. Cero código nuevo.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-[12px] text-[#8a8468]">Regla de recorrido: Prehistoria abre y Futuro cierra siempre; el orden intermedio puede barajarse por run.</p>
            </Section>

            <Section num="03" title="La isla: estructura y generación">
              <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
                <Panel title="PLANO TÁCTICO DE ISLA">
                  <IslandDiagram />
                </Panel>
                <div className="space-y-3">
                  <Panel title="REGLAS DE COMPOSICIÓN">
                    <ul className="space-y-1.5 text-[13px] leading-snug text-[#c9c09a]">
                      <li>▸ Forma de isla <b className="text-[#e8e4d0]">fija</b> por era; contexto (clima/bioma) varía la paleta y los props.</li>
                      <li>▸ <b className="text-[#e8e4d0]">10–12 áreas candidatas</b> de mazmorra; se generan <b className="text-[#ffb02e]">hasta 8</b>, con repetición de arquetipos y <b className="text-[#e8e4d0]">pesos por zona</b> (lejos = más difícil).</li>
                      <li>▸ Dificultad: fácil · media · difícil (+ legendaria sin desafío, rareza máxima).</li>
                      <li>▸ Más dificultad = más cofres y más puntos de tiempo… y más dolor.</li>
                      <li>▸ El <b className="text-[#ff4438]">jefe final</b> vive en posición fija con su arena; matarlo activa el portal. Se puede ir directo: es difícil y paga pocos puntos.</li>
                      <li>▸ <b className="text-[#38e1ff]">Sin mapa</b>: brújula de era y memoria de grupo.</li>
                      <li>▸ Los bordes no perdonan: fuera de la isla = vacío = muerte absurda.</li>
                    </ul>
                  </Panel>
                  <Panel title="LOOT EN EL MUNDO" accent="#38e1ff">
                    <p className="text-[13px] leading-relaxed text-[#c9c09a]">
                      Cofres en cada mazmorra + puntos de loot secundarios dispersos (cajas, altares, contenedores según era).
                      Los cofres dan <b className="text-[#e8e4d0]">armas de la era</b> o <b className="text-[#e8e4d0]">consumibles</b>.
                    </p>
                  </Panel>
                </div>
              </div>
            </Section>

            <Section num="04" title="Arquetipos de mazmorra">
              <div className="grid gap-3 sm:grid-cols-2">
                <Panel title="FORTALEZA ZEN (altura y trampas)" accent="#ff8a6a">
                  <p className="text-[13px] leading-relaxed text-[#c9c09a]">
                    Inspirada en la Fortaleza de Sen (DS1): torres, escaleras de bloque, péndulos y rodillos cúbicos. El cofre espera arriba;
                    el suelo, abajo. Enemigos en patrulla vertical.
                  </p>
                </Panel>
                <Panel title="GUARIDA DE SIGILO (no despertar al bruto)" accent="#7dffb0">
                  <p className="text-[13px] leading-relaxed text-[#c9c09a]">
                    Una criatura enorme y casi invencible duerme sobre el botín. <b className="text-[#e8e4d0]">Agacharse reduce el radio de
                    detección; correr lo dispara</b>. Entrar, saquear y salir sin respirar. Si despierta: correr y reír.
                  </p>
                </Panel>
                <Panel title="ARENA DE HORDA (combate puro)" accent="#ffb02e">
                  <p className="text-[13px] leading-relaxed text-[#c9c09a]">
                    Círculo de piedras, puerta que se cierra, oleadas. El cofre aparece al limpiar la sala. Sin trucos: puños, acero y fe.
                  </p>
                </Panel>
                <Panel title="CÁMARA LEGENDARIA (el regalo)" accent="#ff3bd4">
                  <p className="text-[13px] leading-relaxed text-[#c9c09a]">
                    Rareza máxima, sin desafío: sala del tesoro pura. Aparece pocas veces por run — encontrarla es el premio y el dilema:
                    ¿botín ahora o tiempo para el jefe?
                  </p>
                </Panel>
              </div>
            </Section>

            <Section num="05" title="Economía del tiempo">
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <Panel title="EL CICLO">
                  <ol className="space-y-1.5 text-[13px] leading-snug text-[#c9c09a]">
                    <li><b className="text-[#38e1ff]">1.</b> Recoger fragmentos azules por la isla y dentro de mazmorras (+10 pts c/u).</li>
                    <li><b className="text-[#38e1ff]">2.</b> Descargarlos en un punto de control (uso único) → <b className="text-[#e8e4d0]">+tiempo</b>.</li>
                    <li><b className="text-[#38e1ff]">3.</b> La bonificación escala con la puntuación: jugar bien = vivir más.</li>
                    <li><b className="text-[#38e1ff]">4.</b> Completar la isla (portal) otorga <b className="text-[#e8e4d0]">+45 s</b> para la siguiente era.</li>
                    <li><b className="text-[#ff4438]">5.</b> Cronómetro a cero → derrota → <b className="text-[#ff4438]">run nueva desde la Era I</b>.</li>
                  </ol>
                </Panel>
                <Panel title="FÓRMULA DEL PROTOTIPO" accent="#38e1ff">
                  <div className="font-display px-2 py-3 text-center text-xl text-[#38e1ff]">
                    Δt = 8 + 3·fragmentos + ⌊puntos/150⌋
                  </div>
                  <p className="text-[12px] text-[#8a8468]">Implementada tal cual en el TimeDirector de este prototipo. En el final se afina con curva por era.</p>
                </Panel>
              </div>
            </Section>

            <Section num="06" title="Armas y loot">
              <div className="grid gap-3 sm:grid-cols-3">
                <Panel title="8 POR ISLA">
                  <p className="text-[13px] text-[#c9c09a]">Cada isla define ~8 armas temáticas; una como botín principal de cada mazmorra. Todas bloqueadas en cubos: garrotes, espadas, culatas, hojas de plasma.</p>
                </Panel>
                <Panel title="SIN REPETICIONES">
                  <p className="text-[13px] text-[#c9c09a]">LootTableService marca las armas ya asignadas a cada jugador en la isla actual: si ya salió en una mazmorra, no sale en las otras 7.</p>
                </Panel>
                <Panel title="SE PIERDEN AL SALTAR">
                  <p className="text-[13px] text-[#c9c09a]">Al completar la isla, el arma vuelve al éter temporal. Solo los consumibles cruzan el portal. Cada era se siente nueva… y desnuda.</p>
                </Panel>
              </div>
            </Section>

            <Section num="07" title="Consumibles, bromas y herramientas">
              <p className="mb-3 text-[13px] text-[#c9c09a]">
                Se consiguen en cofres y puntos de loot. Se mantienen hasta consumirse o abandonarse. La columna importante:
                <b className="text-[#ff8a80]"> ¿puede matar a un amigo?</b> (Sí = se implementa igual).
              </p>
              <div className="chamfer overflow-x-auto border border-[#31412f]">
                <table className="w-full min-w-[640px] text-left text-[12.5px]">
                  <thead>
                    <tr className="bg-[#141c13] text-[10px] tracking-[0.2em] text-[#8a8468]">
                      <th className="px-3 py-2">OBJETO</th><th className="px-3 py-2">EFECTO</th>
                      <th className="px-3 py-2">¿MUERTE DE AMIGO?</th><th className="px-3 py-2">DIVERSIÓN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PRANKS.map((p, i) => (
                      <tr key={i} className="border-t border-[#25301f]">
                        <td className="px-3 py-2 font-bold text-[#e8e4d0]">{p[0]}{i < 3 ? " ★" : ""}</td>
                        <td className="px-3 py-2 text-[#c9c09a]">{p[1]}</td>
                        <td className="px-3 py-2 text-[#ff8a80]">{p[2]}</td>
                        <td className="px-3 py-2 text-[#ffb02e]">{p[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-[11px] text-[#8a8468]">★ presentes en este prototipo (teclas 1–3 y F). El resto entra en la vertical slice.</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Panel title="HERRAMIENTAS DE GAMEPLAY (final)" accent="#7dffb0">
                  <p className="text-[13px] text-[#c9c09a]">Lazo (arrastrar a distancia), gancho (verticalidad), escudo (bloqueo), bomba de humo (sigilo asistido), TNT (obstáculos y traiciones). Cada herramienta habilita rutas distintas en la misma mazmorra.</p>
                </Panel>
                <Panel title="RESUCITACIÓN CO-OP" accent="#b45cff">
                  <p className="text-[13px] text-[#c9c09a]">Caído → un compañero mantiene E para levantar (como Pipo en este prototipo). Muerto del todo → el equipo debe revivirlo en un punto de control, gastando su uso único. Decisiones dolorosas = historias buenas.</p>
                </Panel>
              </div>
            </Section>

            <Section num="08" title="Muertes violentas y absurdas">
              <div className="grid gap-2 sm:grid-cols-2">
                {[...ABSURD_DEATHS.map((d) => d.line), ...DEATH_LINES_EXTRA].map((d, i) => (
                  <div key={i} className="chamfer-sm flex items-center gap-3 border border-[#3a2a24] bg-[rgba(26,14,12,0.7)] px-3.5 py-2.5">
                    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="shrink-0">
                      <rect x="3" y="2" width="10" height="8" fill="#e8e4d0" />
                      <rect x="5" y="4.5" width="2" height="2" fill="#1a0e0c" />
                      <rect x="9" y="4.5" width="2" height="2" fill="#1a0e0c" />
                      <rect x="5" y="10" width="1.6" height="3" fill="#e8e4d0" />
                      <rect x="7.3" y="10" width="1.6" height="3" fill="#e8e4d0" />
                      <rect x="9.6" y="10" width="1.6" height="3" fill="#e8e4d0" />
                    </svg>
                    <span className="text-[12.5px] leading-snug text-[#e0c9c2]">{d}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[12px] text-[#8a8468]">El AbsurdDeathDirector elige la línea según la causa (vacío, plátano, jefe, fuego amigo, abejas…) y la muestra en la pantalla de derrota y en el feed del escuadrón.</p>
            </Section>

            <Section num="09" title="Arquitectura técnica">
              <div className="grid gap-3 lg:grid-cols-[1.25fr_1fr]">
                <Panel title="ESTRUCTURA DEL PROYECTO UNITY (PROPUESTA)">
                  <pre className="overflow-x-auto text-[11.5px] leading-relaxed text-[#a8c9a0]" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
{UNITY_TREE}
                  </pre>
                </Panel>
                <div className="space-y-3">
                  <Panel title="¿POR QUÉ UNITY?" accent="#7dffb0">
                    <ul className="space-y-1.5 text-[13px] text-[#c9c09a]">
                      <li>▸ Netcode for GameObjects: host autoritativo 1–4 jugadores, ideal para co-op casual.</li>
                      <li>▸ Contenido 100% data-driven (ScriptableObjects): eras y mazmorras sin tocar código.</li>
                      <li>▸ Estética PS1/cubos barata de renderizar: LODs triviales, sin shaders complejos.</li>
                      <li>▸ Ecosistema de assets y perfiles para un equipo pequeño.</li>
                    </ul>
                  </Panel>
                  <Panel title="ALTERNATIVAS VALORADAS" accent="#38e1ff">
                    <ul className="space-y-1.5 text-[13px] text-[#c9c09a]">
                      <li>▸ <b className="text-[#e8e4d0]">Godot 4</b>: multijugador integrado, licencias amables; menos contenido co-op de referencia.</li>
                      <li>▸ <b className="text-[#e8e4d0]">Unreal 5</b>: overkill para blocking estilizado; coste de iteración mayor.</li>
                      <li>▸ <b className="text-[#e8e4d0]">Este prototipo web</b> (Three.js): valida el loop de tiempo + islas hoy, sin instalar nada.</li>
                    </ul>
                  </Panel>
                  <Panel title="FLUJO DE UNA RUN" accent="#ffb02e">
                    <p className="text-[13px] leading-relaxed text-[#c9c09a]">
                      GameFlowDirector → IslandAssembler(EraDefinition) → DungeonGenerator(seed) → TimeDirector en marcha →
                      jefe → portal → siguiente EraDefinition → … → colapso o victoria → RunState reinicia <b className="text-[#e8e4d0]">desde cero</b>.
                    </p>
                  </Panel>
                </div>
              </div>
            </Section>

            <Section num="10" title="Multijugador y red">
              <div className="grid gap-3 sm:grid-cols-3">
                <Panel title="SESIÓN"><p className="text-[13px] text-[#c9c09a]">Host autoritativo (1–4). El TimeDirector vive en el host; clientes interpolan. Caídas de host → migración o fin de run (decisión de diseño pendiente).</p></Panel>
                <Panel title="SINCRONIZACIÓN"><p className="text-[13px] text-[#c9c09a]">PlayerRig replica movimiento/estado (caído/muerto). CorpseDragSync replica el cadáver arrastrado — el payload cómico más importante del juego.</p></Panel>
                <Panel title="MODO SOLITARIO"><p className="text-[13px] text-[#c9c09a]">Un compañero-bot (Pipo) cubre reanimaciones y carga emocional. Este prototipo ya lo implementa como referencia de diseño.</p></Panel>
              </div>
            </Section>

            <Section num="11" title="Prototipo → Vertical Slice → Final">
              <div className="chamfer overflow-x-auto border border-[#31412f]">
                <table className="w-full min-w-[680px] text-left text-[12.5px]">
                  <thead>
                    <tr className="bg-[#141c13] text-[10px] tracking-[0.2em] text-[#8a8468]">
                      <th className="px-3 py-2">SISTEMA</th>
                      <th className="px-3 py-2 text-[#7dffb0]">ESTE PROTOTIPO</th>
                      <th className="px-3 py-2 text-[#ffb02e]">VERTICAL SLICE</th>
                      <th className="px-3 py-2 text-[#38e1ff]">FINAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Movimiento", "Caminar·correr·saltar·agacharse", "+ stamina fina, empujones entre jugadores", "Gancho, deslizamiento, carry de jugadores"],
                      ["Tiempo", "Cronómetro + puntos de control + fórmula", "Curva por era, eventos de colapso", "Modificadores de era (acelerones, niebla temporal)"],
                      ["Islas", "5 eras, generación blocking, 3 mazmorras/era", "8 mazmorras, pesos por zona, cámara legendaria", "12+ áreas, seeds compartidas, islas mutadas"],
                      ["Combate", "Melee + jefe + bruto sigiloso", "Armas a distancia, trampas de fortaleza", "Clases de armas, combos, aggro de grupo"],
                      ["Co-op", "Compañero-bot: reanimar, redesplegar", "2 jugadores reales (Netcode)", "4 jugadores, voz de proximidad, votación de era"],
                      ["Bromas", "Plátano, fétida, adrenalina, empujón, cadáveres", "Fragmento señuelo, colmena", "TNT, sabotaje de portal, ranking de traiciones"],
                    ].map((r, i) => (
                      <tr key={i} className="border-t border-[#25301f]">
                        <td className="px-3 py-2 font-bold text-[#e8e4d0]">{r[0]}</td>
                        <td className="px-3 py-2 text-[#a8c9a0]">{r[1]}</td>
                        <td className="px-3 py-2 text-[#e0cba0]">{r[2]}</td>
                        <td className="px-3 py-2 text-[#a0d8e0]">{r[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-[12px] leading-relaxed text-[#8a8468]">
                Consumo en este prototipo: {CONSUMABLES.map((c) => c.name).join(" · ")} — todo lo demás está documentado para la slice.
                El código del prototipo replica los nombres de los módulos Unity para que la migración sea un renombrado de carpetas, no una reescritura.
              </p>
            </Section>

            <footer className="mb-6 border-t border-[#31412f] pt-4 text-center">
              <span className="font-display text-sm text-[#ffb02e]">PEAK COMMANDO</span>
              <span className="ml-2 text-[11px] tracking-[0.3em] text-[#8a8468]">FIN DEL BRIEFING · {TOTAL_ERAS} ERAS · 1 CRONÓMETRO · 0 PIEDAD</span>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
