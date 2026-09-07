// ============================================================
// PEAK COMMANDO — Director de Tiempo
// Gestiona el cronómetro, score y recompensas de tiempo
// ============================================================

import { GAME_CONFIG } from '../game/config';

export interface TimeDirectorCallbacks {
  onTimeExpired?: () => void;
  onLowTime?: () => void;
  onTimeAdded?: (amount: number, reason: string) => void;
}

export class TimeDirector {
  public time: number;
  public maxTime: number;
  public score = 0;
  public running = false;

  private warned = false;
  private callbacks: TimeDirectorCallbacks;

  constructor(callbacks: TimeDirectorCallbacks = {}) {
    this.time = GAME_CONFIG.time.initial;
    this.maxTime = GAME_CONFIG.time.max;
    this.callbacks = callbacks;
  }

  public start(): void {
    this.running = true;
  }

  public pause(): void {
    this.running = false;
  }

  public reset(): void {
    this.time = GAME_CONFIG.time.initial;
    this.score = 0;
    this.warned = false;
    this.running = false;
  }

  public update(dt: number): void {
    if (!this.running) return;

    this.time -= dt;

    if (!this.warned && this.time <= 60) {
      this.warned = true;
      this.callbacks.onLowTime?.();
    }

    if (this.time <= 0) {
      this.time = 0;
      this.running = false;
      this.callbacks.onTimeExpired?.();
    }
  }

  public addScore(amount: number): void {
    this.score += amount;
  }

  public addTime(amount: number, reason = 'desconocido'): number {
    if (amount <= 0) return 0;

    const before = this.time;
    this.time = Math.min(this.maxTime, this.time + amount);
    const realAdded = this.time - before;

    this.callbacks.onTimeAdded?.(realAdded, reason);

    return realAdded;
  }

  public getControlPointReward(fragments: number): number {
    const base = GAME_CONFIG.time.controlBase;
    const fragmentBonus = fragments * GAME_CONFIG.time.controlPerFragment;
    const scoreBonus = Math.floor(this.score / GAME_CONFIG.time.controlScoreStep);

    return base + fragmentBonus + scoreBonus;
  }

  public applyBossReward(): number {
    if (GAME_CONFIG.time.bossRewardHalfMax) {
      return this.addTime(this.maxTime * 0.5, 'jefe');
    }

    return this.addTime(300, 'jefe');
  }

  public spendTime(cost: number): boolean {
    if (this.time < cost) {
      return false;
    }

    this.time -= cost;
    return true;
  }

  public getFormattedTime(): string {
    const total = Math.max(0, Math.floor(this.time));
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }
}
