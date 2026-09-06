import { useEffect, useRef, useState } from "react";
import { PeakCommandoGame, type HudData, type FeedItem } from "./game/engine";
import { HUD } from "./components/HUD";
import { MenuScreen, PauseScreen, OverScreen, VictoryScreen } from "./components/Screens";
import { DesignDoc } from "./components/DesignDoc";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<PeakCommandoGame | null>(null);
  const [hud, setHud] = useState<HudData | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [docOpen, setDocOpen] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const game = new PeakCommandoGame(canvas, {
      onHud: setHud,
      onFeed: (f) => {
        setFeed((prev) => [...prev.slice(-4), f]);
        window.setTimeout(() => setFeed((prev) => prev.filter((x) => x.id !== f.id)), 4600);
      },
    });
    gameRef.current = game;
    return () => game.dispose();
  }, []);

  const g = () => gameRef.current;
  const phase = hud?.phase;

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0a0f0b]">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {hud && phase !== "menu" && <HUD hud={hud} feed={feed} />}

      {phase === "menu" && !docOpen && (
        <MenuScreen onStart={() => g()?.startRun()} onDoc={() => setDocOpen(true)} />
      )}
      {phase === "paused" && !docOpen && (
        <PauseScreen
          onResume={() => g()?.resume()}
          onRestart={() => g()?.startRun()}
          onMenu={() => g()?.toMenu()}
          onDoc={() => setDocOpen(true)}
        />
      )}
      {phase === "over" && hud && (
        <OverScreen hud={hud} onRetry={() => g()?.startRun()} onMenu={() => g()?.toMenu()} />
      )}
      {phase === "victory" && hud && (
        <VictoryScreen
          hud={hud}
          onReplay={() => g()?.startRun()}
          onMenu={() => g()?.toMenu()}
          onDoc={() => setDocOpen(true)}
        />
      )}

      {docOpen && <DesignDoc onClose={() => setDocOpen(false)} />}
    </div>
  );
}
