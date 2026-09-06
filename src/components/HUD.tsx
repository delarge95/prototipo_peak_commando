import type { HudData, FeedItem } from "../game/engine";
import { TOTAL_ERAS, CONSUMABLES } from "../game/eras";

const fmtTime = (t: number) => {
  const m = Math.floor(t / 60);
  const s = t - m * 60;
  return `${m}:${s < 10 ? "0" : ""}${s.toFixed(1)}`;
};

function CubeIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden>
      <path d="M8 1 15 5v6l-7 4L1 11V5z" fill={color} opacity="0.9" />
      <path d="M8 1 15 5 8 9 1 5z" fill="#ffffff" opacity="0.35" />
      <path d="M8 9v6L1 11V5z" fill="#000000" opacity="0.25" />
    </svg>
  );
}

function ConsIcon({ idx }: { idx: number }) {
  if (idx === 0)
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
        <path d="M2 11c0-5 4-8 10-8l1 2c-5 0-8 2-9 7z" fill="#ffe24a" />
        <path d="M12 3l1 2-2 1z" fill="#8a6d1a" />
      </svg>
    );
  if (idx === 1)
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
        <rect x="5" y="6" width="6" height="8" fill="#7fae3e" />
        <rect x="6.5" y="3" width="3" height="3" fill="#4a5a2a" />
        <circle cx="3.5" cy="5" r="1.4" fill="#7fae3e" opacity="0.6" />
        <circle cx="12.5" cy="4.4" r="1.1" fill="#7fae3e" opacity="0.6" />
      </svg>
    );
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      <path d="M9 1 3 9h4l-1 6 7-9H8z" fill="#ff4438" />
    </svg>
  );
}

export function HUD({ hud, feed }: { hud: HudData; feed: FeedItem[] }) {
  const critical = hud.time < 20;
  const toneColor: Record<FeedItem["tone"], string> = {
    info: "#c9c09a",
    good: "#38e1ff",
    bad: "#ff4438",
    fun: "#ffb02e",
  };
  const prompt = hud.prompt ? hud.prompt.split("|") : null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 select-none overflow-hidden">
      {/* damage flash */}
      {hud.hurt > 0 && (
        <div
          key={hud.hurt}
          className="anim-dmg absolute inset-0"
          style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(255,40,20,0.55) 100%)" }}
        />
      )}
      {/* low hp / low time vignettes */}
      {hud.hp < 35 && (
        <div className="anim-blink absolute inset-0" style={{ boxShadow: "inset 0 0 120px rgba(255,68,56,0.5)" }} />
      )}
      {critical && <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 90px rgba(255,68,56,0.35)" }} />}
      {hud.rush && <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 110px rgba(255,176,46,0.28)" }} />}

      {/* crosshair */}
      <svg className="crosshair absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" width="26" height="26" viewBox="0 0 26 26">
        <path d="M13 4v6M13 16v6M4 13h6M16 13h6" stroke="#e8e4d0" strokeWidth="2" />
        <rect x="11.5" y="11.5" width="3" height="3" fill="#38e1ff" />
      </svg>

      {/* top center: timer */}
      <div className="absolute left-1/2 top-3 -translate-x-1/2 text-center">
        <div className="chamfer border border-[#31412f] bg-[rgba(10,15,11,0.82)] px-7 py-2">
          <div className="text-[10px] font-semibold tracking-[0.34em] text-[#8a8468]">COLAPSO TEMPORAL EN</div>
          <div className={`font-display text-[44px] leading-none ${critical ? "anim-timer-crit" : "text-[#38e1ff]"}`} style={{ textShadow: critical ? undefined : "0 0 22px rgba(56,225,255,0.45)" }}>
            {fmtTime(hud.time)}
          </div>
          <div className="mt-1.5 h-1.5 w-56 bg-[#1a241a]">
            <div
              className="h-full transition-[width] duration-200"
              style={{
                width: `${Math.min(100, (hud.time / 180) * 100)}%`,
                background: critical ? "#ff4438" : "#38e1ff",
                boxShadow: `0 0 10px ${critical ? "#ff4438" : "#38e1ff"}`,
              }}
            />
          </div>
        </div>
        {/* boss bar */}
        {hud.bossName && (
          <div className="chamfer-sm mx-auto mt-2 w-[430px] border border-[#5a2a24] bg-[rgba(26,10,8,0.85)] px-4 py-2">
            <div className="flex items-baseline justify-between">
              <span className="font-display text-sm text-[#ff4438]">{hud.bossName}</span>
              <span className="text-[10px] tracking-widest text-[#c98a80]">JEFE DE ERA</span>
            </div>
            <div className="mt-1 h-2.5 w-full bg-[#2a100c]">
              <div className="h-full transition-[width] duration-150" style={{ width: `${(hud.bossHp / hud.bossMax) * 100}%`, background: "linear-gradient(90deg,#ff4438,#ff7a1a)" }} />
            </div>
          </div>
        )}
      </div>

      {/* top left: era */}
      <div className="absolute left-4 top-4">
        <div className="chamfer border border-[#31412f] bg-[rgba(10,15,11,0.82)] px-4 py-2.5">
          <div className="font-display text-lg leading-tight text-[#ffb02e]">ERA {hud.eraNum} · {hud.eraName}</div>
          <div className="text-[11px] font-semibold tracking-[0.22em] text-[#8a8468]">«{hud.context.toUpperCase()}»</div>
          <div className="mt-1.5 flex items-center gap-1.5">
            {Array.from({ length: TOTAL_ERAS }).map((_, i) => (
              <div key={i} className="h-2 w-6" style={{ background: i < hud.eraIdx ? "#ffb02e" : i === hud.eraIdx ? "#38e1ff" : "#25301f" }} />
            ))}
          </div>
          <div className="mt-1.5 max-w-[270px] text-[11px] leading-snug text-[#c9c09a]">
            Objetivo: junta fragmentos, descarga tiempo en puntos de control y derrota al jefe para abrir el portal.
          </div>
        </div>
      </div>

      {/* top right: score & frags */}
      <div className="absolute right-4 top-4 text-right">
        <div className="chamfer border border-[#31412f] bg-[rgba(10,15,11,0.82)] px-4 py-2.5">
          <div className="text-[10px] font-semibold tracking-[0.3em] text-[#8a8468]">PUNTUACIÓN</div>
          <div className="font-display text-2xl leading-none text-[#e8e4d0]">{hud.score.toLocaleString("es")}</div>
          <div className="mt-2 flex items-center justify-end gap-2">
            <CubeIcon color="#38e1ff" />
            <span className="font-display text-xl text-[#38e1ff]">×{hud.frags}</span>
            <span className="text-[10px] tracking-widest text-[#8a8468]">FRAGMENTOS</span>
          </div>
          <div className="mt-1 text-[11px] text-[#8a8468]">Bajas: {hud.stats.kills}</div>
        </div>
      </div>

      {/* bottom left: vitals */}
      <div className="absolute bottom-4 left-4 w-[300px]">
        <div className="chamfer border border-[#31412f] bg-[rgba(10,15,11,0.82)] px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] text-[#4d8dff]">
              <span className="inline-block h-2.5 w-2.5" style={{ background: "#4d8dff" }} /> COMANDO AZUL (TÚ)
            </span>
            <span className="font-display text-sm text-[#e8e4d0]">{Math.ceil(hud.hp)}</span>
          </div>
          <div className="mt-1 h-2.5 bg-[#141c13]">
            <div className="h-full transition-[width] duration-200" style={{ width: `${hud.hp}%`, background: hud.hp < 35 ? "#ff4438" : "#4d8dff", boxShadow: "0 0 8px rgba(77,141,255,0.5)" }} />
          </div>
          <div className="mt-1 h-1 bg-[#141c13]">
            <div className="h-full transition-[width] duration-200" style={{ width: `${hud.stam}%`, background: "#ffb02e" }} />
          </div>
          <div className="mt-2.5 flex items-center justify-between">
            <span className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] text-[#b45cff]">
              <span className="inline-block h-2.5 w-2.5" style={{ background: "#b45cff" }} /> PIPO · MORADO
            </span>
            <span className="font-display text-sm text-[#e8e4d0]">{hud.compDown ? "CAÍDO" : Math.ceil(hud.compHp)}</span>
          </div>
          <div className="mt-1 h-2.5 bg-[#141c13]">
            <div className={`h-full transition-[width] duration-200 ${hud.compDown ? "anim-blink" : ""}`} style={{ width: `${hud.compHp}%`, background: "#b45cff" }} />
          </div>
          <div className="mt-2 flex gap-2">
            {hud.crouch && <span className="chamfer-sm bg-[#25301f] px-2 py-0.5 text-[10px] font-bold tracking-widest text-[#7dffb0]">SIGILO</span>}
            {hud.sprint && <span className="chamfer-sm bg-[#25301f] px-2 py-0.5 text-[10px] font-bold tracking-widest text-[#ffb02e]">SPRINT</span>}
            {hud.rush && <span className="chamfer-sm anim-blink bg-[#3a2a10] px-2 py-0.5 text-[10px] font-bold tracking-widest text-[#ffb02e]">ADRENALINA</span>}
            {hud.carry && <span className="chamfer-sm bg-[#33251a] px-2 py-0.5 text-[10px] font-bold tracking-widest text-[#e8a06a]">ARRASTRANDO CADAVER</span>}
          </div>
        </div>
      </div>

      {/* bottom right: weapon & consumables */}
      <div className="absolute bottom-4 right-4 w-[300px] text-right">
        <div className="chamfer border border-[#31412f] bg-[rgba(10,15,11,0.82)] px-4 py-3">
          <div className="text-[10px] font-semibold tracking-[0.3em] text-[#8a8468]">ARMA (se pierde al saltar de era)</div>
          <div className="font-display text-base leading-tight text-[#e8e4d0]">{hud.weapon}</div>
          <div className="mt-2.5 flex justify-end gap-2">
            {hud.cons.map((n, i) => (
              <div key={i} className={`chamfer-sm flex items-center gap-1.5 border px-2 py-1.5 ${n > 0 ? "border-[#31412f] bg-[#141c13]" : "border-[#1f281d] bg-[#0d120d] opacity-50"}`}>
                <span className="keycap">{CONSUMABLES[i].key}</span>
                <ConsIcon idx={i} />
                <span className="font-display text-sm text-[#e8e4d0]">×{n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* interact prompt + revive bar */}
      {prompt && (
        <div className="absolute left-1/2 top-[58%] -translate-x-1/2 text-center">
          <div className="chamfer-sm inline-flex items-center gap-2.5 border border-[#31412f] bg-[rgba(10,15,11,0.88)] px-4 py-2">
            <span className="keycap">{prompt[0]}</span>
            <span className="text-[13px] font-bold tracking-[0.14em] text-[#e8e4d0]">{prompt[1]}</span>
          </div>
        </div>
      )}
      {hud.revivePct > 0 && (
        <div className="absolute left-1/2 top-[64%] h-2 w-52 -translate-x-1/2 bg-[#141c13]">
          <div className="h-full" style={{ width: `${hud.revivePct * 100}%`, background: "#b45cff", boxShadow: "0 0 10px #b45cff" }} />
        </div>
      )}

      {/* event feed */}
      <div className="absolute bottom-24 left-1/2 flex -translate-x-1/2 flex-col-reverse items-center gap-1">
        {feed.map((f) => (
          <div key={f.id} className="anim-feed chamfer-sm bg-[rgba(10,15,11,0.82)] px-3.5 py-1 text-[12px] font-semibold" style={{ color: toneColor[f.tone] }}>
            ▸ {f.text}
          </div>
        ))}
      </div>

      {/* era transition card */}
      {hud.transition && (
        <div className="absolute inset-0 flex items-center justify-center bg-[rgba(6,9,6,0.72)]">
          <div className="anim-era-card text-center">
            <div className="text-[12px] font-bold tracking-[0.5em] text-[#8a8468]">SALTO TEMPORAL</div>
            <div className="font-display title-block mt-2 text-7xl">ERA {hud.transition.num}</div>
            <div className="font-display mt-1 text-2xl text-[#e8e4d0]">{hud.transition.name}</div>
            <div className="mt-2 text-sm font-semibold tracking-[0.28em] text-[#38e1ff]">«{hud.transition.context.toUpperCase()}»</div>
            <div className="anim-blink mt-5 text-[11px] tracking-[0.4em] text-[#ffb02e]">TU ARMA SE PIERDE EN EL SALTO…</div>
          </div>
        </div>
      )}
    </div>
  );
}
