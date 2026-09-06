import type { HudData } from "../game/engine";
import { ERAS, TOTAL_ERAS } from "../game/eras";

const eraSwatch: Record<number, string> = { 0: "#4d7a3a", 1: "#5a5f66", 2: "#c9974f", 3: "#5c6b52", 4: "#35e0ff" };

function Controls({ compact = false }: { compact?: boolean }) {
  const rows: [string[], string][] = [
    [["W", "A", "S", "D"], "Moverse"],
    [["SHIFT"], "Correr (gasta estamina)"],
    [["ESPACIO"], "Saltar"],
    [["C"], "Agacharse / modo sigilo"],
    [["CLIC IZQ"], "Golpear"],
    [["E"], "Interactuar · arrastrar cadáveres · reanimar"],
    [["F"], "Empujón (útil… y traicionero)"],
    [["1", "2", "3"], "Consumibles: plátano · fétida · adrenalina"],
    [["ESC"], "Pausa táctica"],
  ];
  return (
    <div className={`grid gap-x-6 gap-y-1.5 ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
      {rows.map(([keys, label]) => (
        <div key={label} className="flex items-center gap-2">
          <span className="flex shrink-0 gap-1">
            {keys.map((k) => (
              <span key={k} className="keycap">{k}</span>
            ))}
          </span>
          <span className="text-[12px] text-[#c9c09a]">{label}</span>
        </div>
      ))}
    </div>
  );
}

function EraStrip() {
  return (
    <div className="flex items-center gap-1.5">
      {ERAS.map((era, i) => (
        <div key={era.id} className="group relative">
          <div className="chamfer-sm flex items-center gap-2 border border-[#31412f] bg-[rgba(13,20,14,0.85)] py-1.5 pl-2 pr-3 transition-transform duration-150 group-hover:-translate-y-1">
            <span className="inline-block h-5 w-5" style={{ background: eraSwatch[i], boxShadow: `0 0 8px ${eraSwatch[i]}55` }} />
            <span className="text-left">
              <span className="font-display block text-[11px] leading-none text-[#e8e4d0]">{era.numeral}</span>
              <span className="block text-[9px] font-semibold tracking-wider text-[#8a8468]">{era.short.toUpperCase()}</span>
            </span>
          </div>
          {i < TOTAL_ERAS - 1 && (
            <svg className="absolute -right-2 top-1/2 z-10 -translate-y-1/2" width="9" height="12" viewBox="0 0 9 12">
              <path d="M1 1l6 5-6 5" fill="none" stroke="#ffb02e" strokeWidth="2" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

export function MenuScreen({ onStart, onDoc }: { onStart: () => void; onDoc: () => void }) {
  return (
    <div className="scanlines absolute inset-0 z-30 flex items-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(6,9,6,0.92) 0%, rgba(6,9,6,0.78) 34%, rgba(6,9,6,0.15) 62%, rgba(6,9,6,0.35) 100%)" }} />
      <div className="relative z-10 flex h-full w-full items-center">
        <div className="w-full max-w-[620px] px-8 sm:px-14">
          <div className="flex items-center gap-3">
            <div className="hazard h-3 w-24" />
            <span className="text-[11px] font-bold tracking-[0.4em] text-[#8a8468]">CO-OP 1–4 · BLOQUES · EL TIEMPO ES MUNICIÓN</span>
          </div>
          <h1 className="font-display mt-4 leading-[0.86]">
            <span className="title-block block text-[86px] sm:text-[104px]">PEAK</span>
            <span className="block text-[54px] text-[#e8e4d0] sm:text-[68px]" style={{ textShadow: "3px 3px 0 #17130a, 0 0 30px rgba(56,225,255,0.25)" }}>
              COMMANDO
            </span>
          </h1>
          <p className="mt-4 max-w-[520px] text-[14px] leading-relaxed text-[#c9c09a]">
            Un asalto cooperativo a través de <b className="text-[#e8e4d0]">cinco eras</b>, al estilo Time Commando: la isla se devora tu
            cronómetro. Reúne <b className="text-[#38e1ff]">fragmentos azules</b>, descárgalos en puntos de control de un solo uso para
            comprar tiempo, saquea mazmorras por era y tumba al jefe para abrir el portal. Si el reloj llega a cero…{" "}
            <b className="text-[#ff4438]">se empieza de cero</b>.
          </p>

          <div className="mt-6"><EraStrip /></div>

          <div className="chamfer mt-6 border border-[#31412f] bg-[rgba(10,15,11,0.8)] p-4">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="font-display text-sm text-[#ffb02e]">MANUAL DE CAMPO</span>
              <span className="text-[10px] tracking-[0.3em] text-[#8a8468]">RATÓN + TECLADO</span>
            </div>
            <Controls />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button className="btn-commando px-9 py-3.5 text-lg" onClick={onStart}>
              <span>▶ Iniciar operación</span>
            </button>
            <button className="btn-ghost px-6 py-3.5 text-sm" onClick={onDoc}>
              <span>Documento de diseño</span>
            </button>
          </div>
          <p className="anim-floaty mt-5 text-[11px] tracking-widest text-[#8a8468]">
            La isla que gira detrás es real: es el nivel 1 renderizado en vivo. · Prototipo de arquitectura — PC
          </p>
        </div>
      </div>
    </div>
  );
}

export function PauseScreen({ onResume, onRestart, onMenu, onDoc }: { onResume: () => void; onRestart: () => void; onMenu: () => void; onDoc: () => void }) {
  return (
    <div className="scanlines absolute inset-0 z-30 flex items-center justify-center bg-[rgba(6,9,6,0.82)]">
      <div className="w-full max-w-[560px] px-8">
        <div className="flex items-center gap-3">
          <div className="hazard h-2.5 w-16" />
          <h2 className="font-display text-5xl text-[#e8e4d0]">PAUSA TÁCTICA</h2>
        </div>
        <p className="mt-2 text-[13px] text-[#8a8468]">El tiempo, por una vez, también descansa.</p>
        <div className="chamfer mt-5 border border-[#31412f] bg-[rgba(10,15,11,0.85)] p-4">
          <Controls compact />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="btn-commando px-7 py-3" onClick={onResume}><span>Reanudar</span></button>
          <button className="btn-ghost px-5 py-3 text-sm" onClick={onDoc}><span>Documento de diseño</span></button>
          <button className="btn-ghost px-5 py-3 text-sm" onClick={onRestart}><span>Reiniciar operación</span></button>
          <button className="btn-ghost px-5 py-3 text-sm" onClick={onMenu}><span>Abandonar al menú</span></button>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="chamfer-sm flex items-center justify-between border border-[#31412f] bg-[rgba(10,15,11,0.85)] px-4 py-2.5">
      <span className="text-[11px] font-bold tracking-[0.24em] text-[#8a8468]">{label}</span>
      <span className="font-display text-xl" style={{ color: accent ?? "#e8e4d0" }}>{value}</span>
    </div>
  );
}

export function OverScreen({ hud, onRetry, onMenu }: { hud: HudData; onRetry: () => void; onMenu: () => void }) {
  return (
    <div className="scanlines absolute inset-0 z-30 flex items-center justify-center bg-[rgba(12,6,5,0.86)]">
      <div className="w-full max-w-[540px] px-8 text-center">
        <div className="anim-stamp font-display mx-auto inline-block border-4 border-[#ff4438] px-6 py-2 text-4xl text-[#ff4438]" style={{ textShadow: "0 0 24px rgba(255,68,56,0.6)" }}>
          BAJA CONFIRMADA
        </div>
        <p className="mx-auto mt-5 max-w-[440px] text-[15px] leading-relaxed text-[#e8c9c4]">“{hud.deathLine}”</p>
        <p className="mt-1 text-[11px] tracking-[0.3em] text-[#8a8468]">EL CRONO DICE: SE EMPIEZA DE CERO. ASÍ SON LAS REGLAS.</p>
        <div className="mx-auto mt-6 grid max-w-[400px] gap-2">
          <StatRow label="PUNTUACIÓN" value={hud.score.toLocaleString("es")} accent="#ffb02e" />
          <StatRow label="BAJAS" value={`${hud.stats.kills}`} />
          <StatRow label="FRAGMENTOS DESCARGADOS" value={`${hud.stats.deposited}`} accent="#38e1ff" />
          <StatRow label="ERAS SUPERADAS" value={`${hud.stats.eras} / ${TOTAL_ERAS}`} accent="#38e1ff" />
        </div>
        <div className="mt-7 flex justify-center gap-4">
          <button className="btn-commando px-8 py-3.5" onClick={onRetry}><span>Reiniciar desde cero</span></button>
          <button className="btn-ghost px-6 py-3.5 text-sm" onClick={onMenu}><span>Menú</span></button>
        </div>
      </div>
    </div>
  );
}

export function VictoryScreen({ hud, onReplay, onMenu, onDoc }: { hud: HudData; onReplay: () => void; onMenu: () => void; onDoc: () => void }) {
  const rank =
    hud.score >= 25000 ? "LEYENDA DEL PICO: COMANDANTE DE LAS ERAS"
    : hud.score >= 15000 ? "TENIENTE CRONO"
    : hud.score >= 8000 ? "SARGENTO DEL TIEMPO"
    : "RECLUTA CON SUERTE";
  return (
    <div className="scanlines absolute inset-0 z-30 flex items-center justify-center bg-[rgba(6,10,6,0.86)]">
      <div className="w-full max-w-[560px] px-8 text-center">
        <div className="anim-stamp font-display mx-auto inline-block border-4 border-[#ffb02e] px-6 py-2 text-4xl text-[#ffb02e]" style={{ textShadow: "0 0 26px rgba(255,176,46,0.55)" }}>
          MISIÓN CUMPLIDA
        </div>
        <p className="mt-5 text-[15px] text-[#e0dcc4]">
          Cinco eras, un solo cronómetro, cero dignidad perdida (bueno, algo). La línea temporal está a salvo… hasta la próxima partida.
        </p>
        <div className="chamfer mx-auto mt-6 max-w-[420px] border border-[#4a3f20] bg-[rgba(26,22,10,0.8)] px-5 py-3">
          <div className="text-[10px] tracking-[0.34em] text-[#8a8468]">RANGO OBTENIDO</div>
          <div className="font-display mt-1 text-lg text-[#ffb02e]">{rank}</div>
        </div>
        <div className="mx-auto mt-4 grid max-w-[420px] gap-2">
          <StatRow label="PUNTUACIÓN FINAL" value={hud.score.toLocaleString("es")} accent="#ffb02e" />
          <StatRow label="BAJAS" value={`${hud.stats.kills}`} />
          <StatRow label="FRAGMENTOS DESCARGADOS" value={`${hud.stats.deposited}`} accent="#38e1ff" />
          <StatRow label="TIEMPO RESTANTE" value={`${Math.floor(hud.time)}s`} accent="#38e1ff" />
        </div>
        <div className="mt-7 flex flex-wrap justify-center gap-4">
          <button className="btn-commando px-8 py-3.5" onClick={onReplay}><span>Otra operación</span></button>
          <button className="btn-ghost px-6 py-3.5 text-sm" onClick={onDoc}><span>Documento de diseño</span></button>
          <button className="btn-ghost px-6 py-3.5 text-sm" onClick={onMenu}><span>Menú</span></button>
        </div>
      </div>
    </div>
  );
}
