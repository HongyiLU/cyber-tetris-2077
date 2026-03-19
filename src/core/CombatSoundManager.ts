// ==================== CombatSoundManager - 战斗音效管理器 ====================
// v2.0.0 Day 6 - 战斗音效系统

import { AudioManager } from '../systems/AudioManager';
import { SoundId } from '../config/audio-config';

/**
 * 战斗音效管理器
 * 封装 AudioManager，提供战斗场景专用的音效接口
 */
export class CombatSoundManager {
  private static instance: CombatSoundManager;
  private audioManager: AudioManager;

  /**
   * 私有构造函数（单例模式）
   */
  private constructor() {
    this.audioManager = new AudioManager();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): CombatSoundManager {
    if (!CombatSoundManager.instance) {
      CombatSoundManager.instance = new CombatSoundManager();
    }
    return CombatSoundManager.instance;
  }

  /**
   * 重置单例实例（用于测试或重新初始化）
   */
  static resetInstance(): void {
    CombatSoundManager.instance = undefined as unknown as CombatSoundManager;
  }

  /**
   * 初始化音频系统
   */
  public async initialize(): Promise<void> {
    await this.audioManager.initialize();
  }

  /**
   * 获取内部 AudioManager 实例（用于直接控制）
   */
  public getAudioManager(): AudioManager {
    return this.audioManager;
  }

  // ==================== 战斗基础音效 ====================

  /**
   * 播放出牌音效
   * @param volume 可选的自定义音量 (0-1)
   */
  public playCardPlay(volume?: number): void {
    this.audioManager.playSound(SoundId.CARD_PLAY, volume);
  }

  /**
   * 播放抽牌音效
   * @param volume 可选的自定义音量 (0-1)
   */
  public playCardDraw(volume?: number): void {
    this.audioManager.playSound(SoundId.CARD_DRAW, volume);
  }

  /**
   * 播放玩家受伤音效
   * @param volume 可选的自定义音量 (0-1)
   */
  public playDamagePlayer(volume?: number): void {
    this.audioManager.playSound(SoundId.DAMAGE_PLAYER, volume);
  }

  /**
   * 播放敌人受伤音效
   * @param volume 可选的自定义音量 (0-1)
   */
  public playDamageEnemy(volume?: number): void {
    this.audioManager.playSound(SoundId.DAMAGE_ENEMY, volume);
  }

  /**
   * 播放治疗音效
   * @param volume 可选的自定义音量 (0-1)
   */
  public playHeal(volume?: number): void {
    this.audioManager.playSound(SoundId.HEAL, volume);
  }

  /**
   * 播放增益音效
   * @param volume 可选的自定义音量 (0-1)
   */
  public playBuff(volume?: number): void {
    this.audioManager.playSound(SoundId.BUFF, volume);
  }

  /**
   * 播放减益音效
   * @param volume 可选的自定义音量 (0-1)
   */
  public playDebuff(volume?: number): void {
    this.audioManager.playSound(SoundId.DEBUFF, volume);
  }

  /**
   * 播放战斗胜利音效
   * @param volume 可选的自定义音量 (0-1)
   */
  public playVictoryBattle(volume?: number): void {
    this.audioManager.playSound(SoundId.VICTORY_BATTLE, volume);
  }

  /**
   * 播放战斗失败音效
   * @param volume 可选的自定义音量 (0-1)
   */
  public playDefeatBattle(volume?: number): void {
    this.audioManager.playSound(SoundId.DEFEAT_BATTLE, volume);
  }

  /**
   * 播放敌人攻击音效
   * @param volume 可选的自定义音量 (0-1)
   */
  public playEnemyAttack(volume?: number): void {
    this.audioManager.playSound(SoundId.ENEMY_ATTACK, volume);
  }

  /**
   * 播放格挡音效
   * @param volume 可选的自定义音量 (0-1)
   */
  public playBlock(volume?: number): void {
    this.audioManager.playSound(SoundId.BLOCK, volume);
  }

  /**
   * 播放能量恢复音效
   * @param volume 可选的自定义音量 (0-1)
   */
  public playEnergy(volume?: number): void {
    this.audioManager.playSound(SoundId.ENERGY, volume);
  }

  // ==================== 组合音效 ====================

  /**
   * 播放攻击音效组合（敌人受伤）
   * @param damage 伤害值（影响音量）
   */
  public playAttack(damage: number): void {
    this.playDamageEnemy();
  }

  /**
   * 播放受击音效组合（玩家受伤）
   * @param blocked 是否被格挡
   */
  public playHurt(blocked: boolean): void {
    if (blocked) {
      this.playBlock();
    } else {
      this.playDamagePlayer();
    }
  }

  /**
   * 播放出牌+攻击组合
   * @param damage 伤害值
   */
  public playCardAttack(damage: number): void {
    this.playCardPlay();
    // 延迟播放伤害音效，让出牌音效先播放
    setTimeout(() => {
      this.playDamageEnemy();
    }, 100);
  }

  /**
   * 播放治疗+增益组合
   * @param amount 治疗/增益量
   */
  public playHealAndBuff(amount: number): void {
    this.playHeal();
    setTimeout(() => {
      this.playBuff();
    }, 150);
  }

  // ==================== 状态控制 ====================

  /**
   * 停止所有正在播放的音效
   */
  public stopAll(): void {
    this.audioManager.stopAll();
  }

  /**
   * 设置静音状态
   * @param muted 是否静音
   */
  public setMuted(muted: boolean): void {
    this.audioManager.setMuted(muted);
  }

  /**
   * 切换静音状态
   * @returns 新的静音状态
   */
  public toggleMute(): boolean {
    return this.audioManager.toggleMute();
  }

  /**
   * 检查是否静音
   */
  public isMuted(): boolean {
    return this.audioManager.isMuted();
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    this.audioManager.dispose();
  }
}

// 导出单例实例
export const combatSoundManager = CombatSoundManager.getInstance();

export default CombatSoundManager;
