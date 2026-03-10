// ==================== 简化的音频管理器（使用 Web Audio API 生成音效）====================

/**
 * 音效类型
 */
export enum SoundId {
  // 方块操作
  MOVE = 'move',           // 方块移动
  ROTATE = 'rotate',       // 方块旋转
  HARD_DROP = 'harddrop',  // 硬降
  
  // 消行（不同行数不同音调）
  CLEAR_1 = 'clear1',
  CLEAR_2 = 'clear2',
  CLEAR_3 = 'clear3',
  CLEAR_4 = 'clear4',
  
  // 战斗与成就
  COMBO = 'combo',         // 连击
  ACHIEVEMENT = 'achievement', // 成就解锁
  GAME_OVER = 'gameover',  // 游戏结束
  VICTORY = 'victory',     // 胜利
}

/**
 * 音频配置接口
 */
export interface AudioConfig {
  masterVolume: number;      // 主音量 (0-100)
  gameVolume: number;        // 游戏音效音量 (0-100)
  uiVolume: number;          // UI 音效音量 (0-100)
  eventVolume: number;       // 事件音效音量 (0-100)
  muted: boolean;            // 是否静音
}

/**
 * 默认音频配置
 */
export const DEFAULT_AUDIO_CONFIG: AudioConfig = {
  masterVolume: 80,
  gameVolume: 70,
  uiVolume: 60,
  eventVolume: 90,
  muted: false,
};

/**
 * 音频管理器
 * 使用 Web Audio API 生成合成音效和 BGM，无需外部音频文件
 * 
 * 特性：
 * - 使用振荡器生成音效
 * - BGM 使用多振荡器和弦
 * - 音量控制（0-100%）
 * - 静音开关
 * - 零外部依赖
 */
export class AudioManager {
  private audioContext: AudioContext | null = null;
  private config: AudioConfig;
  private initialized: boolean = false;
  private bgmOscillators: OscillatorNode[] = [];
  private bgmGain: GainNode | null = null;
  private bgmLFO: OscillatorNode | null = null;
  private bgmPlaying: boolean = false;

  constructor() {
    this.audioContext = null;
    this.config = { ...DEFAULT_AUDIO_CONFIG };
  }

  /**
   * 初始化音频管理器
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // 创建 AudioContext（浏览器用户交互后才能使用）
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.initialized = true;
      console.log('[AudioManager] 初始化完成（Web Audio API）');
    } catch (error) {
      console.warn('[AudioManager] AudioContext 创建失败，音效将不可用:', error);
    }
  }

  /**
   * 播放音效
   * @param soundId 音效 ID
   */
  public playSound(soundId: SoundId): void {
    if (this.config.muted || !this.audioContext) {
      return;
    }

    // 恢复 AudioContext（如果处于挂起状态）
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(console.warn);
    }

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // 根据音效类型设置参数
    const soundParams = this.getSoundParams(soundId);
    
    oscillator.type = soundParams.type;
    oscillator.frequency.setValueAtTime(soundParams.frequency, now);
    
    // 如果有频率滑动
    if (soundParams.frequencySlide) {
      oscillator.frequency.exponentialRampToValueAtTime(
        soundParams.frequencySlide,
        now + soundParams.duration
      );
    }

    // 音量包络
    const volume = this.getVolume(soundId);
    gainNode.gain.setValueAtTime(volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + soundParams.duration);

    // 播放
    oscillator.start(now);
    oscillator.stop(now + soundParams.duration);

    // 清理
    setTimeout(() => {
      oscillator.disconnect();
      gainNode.disconnect();
    }, soundParams.duration * 1000 + 100);
  }

  /**
   * 获取音效参数
   */
  private getSoundParams(soundId: SoundId): {
    type: OscillatorType;
    frequency: number;
    frequencySlide?: number;
    duration: number;
  } {
    switch (soundId) {
      case SoundId.MOVE:
        return { type: 'sine', frequency: 200, duration: 0.05 };
      
      case SoundId.ROTATE:
        return { type: 'triangle', frequency: 300, frequencySlide: 400, duration: 0.08 };
      
      case SoundId.HARD_DROP:
        return { type: 'square', frequency: 150, frequencySlide: 100, duration: 0.15 };
      
      case SoundId.CLEAR_1:
        return { type: 'sine', frequency: 440, frequencySlide: 880, duration: 0.2 };
      
      case SoundId.CLEAR_2:
        return { type: 'sine', frequency: 523, frequencySlide: 1047, duration: 0.25 };
      
      case SoundId.CLEAR_3:
        return { type: 'triangle', frequency: 659, frequencySlide: 1319, duration: 0.3 };
      
      case SoundId.CLEAR_4:
        return { type: 'triangle', frequency: 880, frequencySlide: 1760, duration: 0.4 };
      
      case SoundId.COMBO:
        return { type: 'sine', frequency: 880, frequencySlide: 1320, duration: 0.3 };
      
      case SoundId.ACHIEVEMENT:
        return { type: 'triangle', frequency: 523, frequencySlide: 1047, duration: 0.5 };
      
      case SoundId.GAME_OVER:
        return { type: 'sawtooth', frequency: 300, frequencySlide: 100, duration: 0.6 };
      
      case SoundId.VICTORY:
        return { type: 'triangle', frequency: 523, frequencySlide: 1047, duration: 0.8 };
      
      default:
        return { type: 'sine', frequency: 440, duration: 0.1 };
    }
  }

  /**
   * 获取音量
   */
  private getVolume(soundId: SoundId): number {
    let categoryVolume: number;
    
    // 简化分类
    if (soundId === SoundId.MOVE || soundId === SoundId.ROTATE || soundId === SoundId.HARD_DROP) {
      categoryVolume = this.config.gameVolume;
    } else {
      categoryVolume = this.config.eventVolume;
    }
    
    return (categoryVolume * this.config.masterVolume) / 10000;
  }

  /**
   * 播放消行音效（根据行数选择不同音调）
   * @param lines 消除的行数 (1-4)
   */
  public playClearSound(lines: number): void {
    const clampedLines = Math.max(1, Math.min(4, lines));
    const soundId = `clear${clampedLines}` as SoundId;
    this.playSound(soundId);
  }

  /**
   * 设置主音量
   */
  public setMasterVolume(volume: number): void {
    this.config.masterVolume = Math.max(0, Math.min(100, volume));
  }

  /**
   * 设置游戏音效音量
   */
  public setGameVolume(volume: number): void {
    this.config.gameVolume = Math.max(0, Math.min(100, volume));
  }

  /**
   * 设置 UI 音效音量
   */
  public setUiVolume(volume: number): void {
    this.config.uiVolume = Math.max(0, Math.min(100, volume));
  }

  /**
   * 设置事件音效音量
   */
  public setEventVolume(volume: number): void {
    this.config.eventVolume = Math.max(0, Math.min(100, volume));
  }

  /**
   * 设置静音状态
   */
  public setMuted(muted: boolean): void {
    this.config.muted = muted;
  }

  /**
   * 切换静音状态
   */
  public toggleMute(): boolean {
    this.config.muted = !this.config.muted;
    return this.config.muted;
  }

  /**
   * 检查是否静音
   */
  public isMuted(): boolean {
    return this.config.muted;
  }

  /**
   * 获取主音量
   */
  public getMasterVolume(): number {
    return this.config.masterVolume;
  }

  /**
   * 获取游戏音效音量
   */
  public getGameVolume(): number {
    return this.config.gameVolume;
  }

  /**
   * 获取 UI 音效音量
   */
  public getUiVolume(): number {
    return this.config.uiVolume;
  }

  /**
   * 获取事件音效音量
   */
  public getEventVolume(): number {
    return this.config.eventVolume;
  }

  /**
   * 播放背景音乐（BGM）
   * 使用多振荡器和弦生成赛博朋克风格的循环 BGM
   */
  public playBGM(): void {
    if (this.config.muted || !this.audioContext) {
      return;
    }

    // 如果已经在播放，先停止
    this.stopBGM();

    // 恢复 AudioContext
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(console.warn);
    }

    const now = this.audioContext.currentTime;
    const volume = (this.config.gameVolume * this.config.masterVolume / 10000) * 0.15; // BGM 音量较小

    // 创建 BGM 和弦（赛博朋克风格：Cm7 和弦）
    const frequencies = [130.81, 155.56, 196.00, 233.08]; // C3, Eb3, G3, Bb3
    
    this.bgmGain = this.audioContext.createGain();
    this.bgmGain.gain.setValueAtTime(volume * 0.5, now);
    this.bgmGain.gain.linearRampToValueAtTime(volume, now + 2); // 2 秒淡入
    this.bgmGain.connect(this.audioContext.destination);
    
    this.bgmOscillators = frequencies.map(freq => {
      const osc = this.audioContext!.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.connect(this.bgmGain!);
      osc.start(now);
      return osc;
    });

    // 创建 LFO 调制（制造脉动效果）
    const lfo = this.audioContext.createOscillator();
    lfo.frequency.setValueAtTime(0.5, now); // 0.5Hz 慢速调制
    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.setValueAtTime(volume * 0.3, now);
    lfo.connect(lfoGain);
    lfoGain.connect(this.bgmGain.gain);
    lfo.start(now);
    
    this.bgmLFO = lfo;
    this.bgmPlaying = true;

    console.log('[AudioManager] BGM 开始播放');
  }

  /**
   * 停止背景音乐
   */
  public stopBGM(): void {
    if (!this.bgmPlaying) return;

    const now = this.audioContext?.currentTime ?? 0;
    
    // 淡出
    if (this.bgmGain && this.audioContext) {
      this.bgmGain.gain.linearRampToValueAtTime(0, now + 0.5);
    }

    // 停止振荡器
    this.bgmOscillators.forEach(osc => {
      try {
        osc.stop(now + 0.5);
        osc.disconnect();
      } catch (e) {
        // 忽略已停止的振荡器
      }
    });

    if (this.bgmLFO) {
      try {
        this.bgmLFO.stop(now + 0.5);
        this.bgmLFO.disconnect();
      } catch (e) {}
    }

    // 清理
    this.bgmOscillators = [];
    this.bgmLFO = null;
    this.bgmGain = null;
    this.bgmPlaying = false;

    console.log('[AudioManager] BGM 停止播放');
  }

  /**
   * 检查 BGM 是否正在播放
   */
  public isBGMPlaying(): boolean {
    return this.bgmPlaying;
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    this.stopBGM();
    if (this.audioContext) {
      this.audioContext.close().catch(console.warn);
      this.audioContext = null;
    }
    this.initialized = false;
  }
}

export default AudioManager;
