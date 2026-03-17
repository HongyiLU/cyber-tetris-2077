// ==================== 音频管理器 ====================
import { AUDIO_PATHS, DEFAULT_AUDIO_CONFIG, getSoundVolume, SoundId, } from '../config/audio-config';
/**
 * 音频管理器
 * 使用 HTML5 Audio API 管理游戏音效
 *
 * 特性：
 * - 预加载音效
 * - 音量控制（0-100%）
 * - 静音开关
 * - 性能优化（避免重复创建 Audio 对象）
 */
export class AudioManager {
    constructor() {
        Object.defineProperty(this, "audioCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "initialized", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this.audioCache = new Map();
        this.config = { ...DEFAULT_AUDIO_CONFIG };
    }
    /**
     * 初始化音频管理器
     * 预加载所有音效
     */
    async initialize() {
        if (this.initialized) {
            return;
        }
        // 预加载所有音效
        const loadPromises = Object.values(SoundId).map((soundId) => this.preloadSound(soundId));
        await Promise.all(loadPromises);
        this.initialized = true;
        console.log('[AudioManager] 初始化完成，已预加载所有音效');
    }
    /**
     * 预加载单个音效
     * @param soundId 音效 ID
     */
    async preloadSound(soundId) {
        try {
            const audio = new Audio();
            audio.src = AUDIO_PATHS[soundId];
            audio.preload = 'auto';
            // 等待加载完成
            await new Promise((resolve, reject) => {
                audio.addEventListener('canplaythrough', resolve, { once: true });
                audio.addEventListener('error', reject, { once: true });
                // 设置超时（3 秒），避免长时间等待
                setTimeout(() => {
                    console.warn(`[AudioManager] 音效 ${soundId} 加载超时，将使用懒加载`);
                    resolve(void 0);
                }, 3000);
            });
            this.audioCache.set(soundId, audio);
            console.log(`[AudioManager] 预加载音效：${soundId}`);
        }
        catch (error) {
            console.warn(`[AudioManager] 预加载音效 ${soundId} 失败：`, error);
            // 失败时不阻塞，留待播放时懒加载
        }
    }
    /**
     * 播放音效
     * @param soundId 音效 ID
     * @param volume 可选的音量覆盖 (0-1)，不传则使用配置音量
     */
    playSound(soundId, volume) {
        if (this.config.muted) {
            return; // 静音时不播放
        }
        let audio = this.audioCache.get(soundId);
        // 如果缓存中没有，尝试懒加载
        if (!audio) {
            audio = new Audio();
            audio.src = AUDIO_PATHS[soundId];
            audio.preload = 'auto';
            this.audioCache.set(soundId, audio);
        }
        // 计算音量
        const finalVolume = volume ?? getSoundVolume(soundId, this.config);
        audio.volume = Math.max(0, Math.min(1, finalVolume));
        // 重置播放位置并播放
        audio.currentTime = 0;
        // 使用 Promise 处理播放（避免未捕获的错误）
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch((error) => {
                // 忽略常见的自动播放策略错误
                if (error.name !== 'NotAllowedError') {
                    console.warn(`[AudioManager] 播放音效 ${soundId} 失败：`, error);
                }
            });
        }
    }
    /**
     * 播放消行音效（根据行数选择不同音调）
     * @param lines 消除的行数 (1-4)
     */
    playClearSound(lines) {
        const clampedLines = Math.max(1, Math.min(4, lines));
        const soundId = `clear${clampedLines}`;
        this.playSound(soundId);
    }
    /**
     * 获取当前配置
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * 设置主音量
     * @param volume 音量值 (0-100)
     */
    setMasterVolume(volume) {
        this.config.masterVolume = Math.max(0, Math.min(100, volume));
        console.log(`[AudioManager] 主音量设置为：${this.config.masterVolume}%`);
    }
    /**
     * 设置游戏音效音量
     * @param volume 音量值 (0-100)
     */
    setGameVolume(volume) {
        this.config.gameVolume = Math.max(0, Math.min(100, volume));
        console.log(`[AudioManager] 游戏音效音量设置为：${this.config.gameVolume}%`);
    }
    /**
     * 设置 UI 音效音量
     * @param volume 音量值 (0-100)
     */
    setUiVolume(volume) {
        this.config.uiVolume = Math.max(0, Math.min(100, volume));
        console.log(`[AudioManager] UI 音效音量设置为：${this.config.uiVolume}%`);
    }
    /**
     * 设置事件音效音量
     * @param volume 音量值 (0-100)
     */
    setEventVolume(volume) {
        this.config.eventVolume = Math.max(0, Math.min(100, volume));
        console.log(`[AudioManager] 事件音效音量设置为：${this.config.eventVolume}%`);
    }
    /**
     * 设置静音状态
     * @param muted 是否静音
     */
    setMuted(muted) {
        this.config.muted = muted;
        console.log(`[AudioManager] 静音状态：${muted ? '开启' : '关闭'}`);
    }
    /**
     * 切换静音状态
     * @returns 新的静音状态
     */
    toggleMute() {
        this.config.muted = !this.config.muted;
        console.log(`[AudioManager] 切换静音状态：${this.config.muted ? '开启' : '关闭'}`);
        return this.config.muted;
    }
    /**
     * 检查是否静音
     */
    isMuted() {
        return this.config.muted;
    }
    /**
     * 获取音量百分比（0-100）
     */
    getMasterVolume() {
        return this.config.masterVolume;
    }
    /**
     * 获取游戏音效音量百分比（0-100）
     */
    getGameVolume() {
        return this.config.gameVolume;
    }
    /**
     * 获取 UI 音效音量百分比（0-100）
     */
    getUiVolume() {
        return this.config.uiVolume;
    }
    /**
     * 获取事件音效音量百分比（0-100）
     */
    getEventVolume() {
        return this.config.eventVolume;
    }
    /**
     * 停止所有正在播放的音效
     */
    stopAll() {
        this.audioCache.forEach((audio) => {
            audio.pause();
            audio.currentTime = 0;
        });
        console.log('[AudioManager] 已停止所有音效');
    }
    /**
     * 清理资源
     */
    dispose() {
        this.stopAll();
        this.audioCache.clear();
        this.initialized = false;
        console.log('[AudioManager] 已清理资源');
    }
    /**
     * 检查音效是否已加载
     * @param soundId 音效 ID
     */
    isSoundLoaded(soundId) {
        const audio = this.audioCache.get(soundId);
        return audio?.readyState !== undefined && audio.readyState >= 3;
    }
    /**
     * 获取所有音效的加载状态
     */
    getLoadStatus() {
        const status = new Map();
        Object.values(SoundId).forEach((soundId) => {
            status.set(soundId, this.isSoundLoaded(soundId));
        });
        return status;
    }
}
// 导出单例实例（可选）
export const audioManager = new AudioManager();
export default AudioManager;
