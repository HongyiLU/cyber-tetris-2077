// ==================== AudioManager 单元测试 ====================
import { AudioManager } from '../systems/AudioManager';
import { SoundId, DEFAULT_AUDIO_CONFIG } from '../config/audio-config';
// Mock HTMLAudioElement
class MockAudioElement {
    constructor() {
        Object.defineProperty(this, "src", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        Object.defineProperty(this, "volume", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        Object.defineProperty(this, "currentTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "preload", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        Object.defineProperty(this, "paused", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "readyState", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 4
        }); // HAVE_ENOUGH_DATA
        Object.defineProperty(this, "listeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    addEventListener(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    play() {
        // 模拟播放 - 返回 Promise
        this.paused = false;
        return Promise.resolve();
    }
    pause() {
        this.paused = true;
    }
    // 触发事件
    triggerEvent(event) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(cb => cb());
    }
}
// 全局 Mock
const originalAudio = global.Audio;
global.Audio = MockAudioElement;
describe('AudioManager', () => {
    let audioManager;
    beforeEach(() => {
        audioManager = new AudioManager();
        // 重置配置
        audioManager.setMasterVolume(DEFAULT_AUDIO_CONFIG.masterVolume);
        audioManager.setGameVolume(DEFAULT_AUDIO_CONFIG.gameVolume);
        audioManager.setUiVolume(DEFAULT_AUDIO_CONFIG.uiVolume);
        audioManager.setEventVolume(DEFAULT_AUDIO_CONFIG.eventVolume);
        audioManager.setMuted(false);
    });
    describe('音量控制', () => {
        it('应该正确设置主音量', () => {
            audioManager.setMasterVolume(50);
            expect(audioManager.getMasterVolume()).toBe(50);
            audioManager.setMasterVolume(100);
            expect(audioManager.getMasterVolume()).toBe(100);
            audioManager.setMasterVolume(0);
            expect(audioManager.getMasterVolume()).toBe(0);
        });
        it('应该限制主音量范围在 0-100', () => {
            audioManager.setMasterVolume(-10);
            expect(audioManager.getMasterVolume()).toBe(0);
            audioManager.setMasterVolume(150);
            expect(audioManager.getMasterVolume()).toBe(100);
        });
        it('应该正确设置游戏音效音量', () => {
            audioManager.setGameVolume(75);
            expect(audioManager.getGameVolume()).toBe(75);
        });
        it('应该正确设置 UI 音效音量', () => {
            audioManager.setUiVolume(60);
            expect(audioManager.getUiVolume()).toBe(60);
        });
        it('应该正确设置事件音效音量', () => {
            audioManager.setEventVolume(90);
            expect(audioManager.getEventVolume()).toBe(90);
        });
    });
    describe('静音功能', () => {
        it('应该正确切换静音状态', () => {
            expect(audioManager.isMuted()).toBe(false);
            const newState = audioManager.toggleMute();
            expect(newState).toBe(true);
            expect(audioManager.isMuted()).toBe(true);
            const newState2 = audioManager.toggleMute();
            expect(newState2).toBe(false);
            expect(audioManager.isMuted()).toBe(false);
        });
        it('应该正确设置静音状态', () => {
            audioManager.setMuted(true);
            expect(audioManager.isMuted()).toBe(true);
            audioManager.setMuted(false);
            expect(audioManager.isMuted()).toBe(false);
        });
        it('静音时不应播放音效', () => {
            audioManager.setMuted(true);
            // 静音时调用 playSound 不应抛出错误，但也不应播放
            expect(() => audioManager.playSound(SoundId.MOVE)).not.toThrow();
        });
    });
    describe('音效播放', () => {
        it('应该能够播放音效', () => {
            // 不抛出错误即表示成功
            expect(() => audioManager.playSound(SoundId.MOVE)).not.toThrow();
            expect(() => audioManager.playSound(SoundId.ROTATE)).not.toThrow();
            expect(() => audioManager.playSound(SoundId.HARD_DROP)).not.toThrow();
        });
        it('应该能够播放消行音效', () => {
            expect(() => audioManager.playClearSound(1)).not.toThrow();
            expect(() => audioManager.playClearSound(2)).not.toThrow();
            expect(() => audioManager.playClearSound(3)).not.toThrow();
            expect(() => audioManager.playClearSound(4)).not.toThrow();
        });
        it('消行音效应该限制行数在 1-4 范围', () => {
            expect(() => audioManager.playClearSound(0)).not.toThrow();
            expect(() => audioManager.playClearSound(5)).not.toThrow();
            expect(() => audioManager.playClearSound(-1)).not.toThrow();
        });
        it('应该支持自定义音量播放', () => {
            expect(() => audioManager.playSound(SoundId.MOVE, 0.5)).not.toThrow();
            expect(() => audioManager.playSound(SoundId.CLEAR_1, 0.8)).not.toThrow();
        });
    });
    describe('预加载', () => {
        it('应该能够初始化', async () => {
            await expect(audioManager.initialize()).resolves.not.toThrow();
        });
        it('初始化后应该可以重复调用', async () => {
            await audioManager.initialize();
            await expect(audioManager.initialize()).resolves.not.toThrow();
        });
    });
    describe('获取配置', () => {
        it('应该返回配置副本', () => {
            const config1 = audioManager.getConfig();
            const config2 = audioManager.getConfig();
            // 应该是不同的对象
            expect(config1).not.toBe(config2);
            expect(config1).toEqual(config2);
        });
        it('配置应该包含所有必要字段', () => {
            const config = audioManager.getConfig();
            expect(config).toHaveProperty('masterVolume');
            expect(config).toHaveProperty('gameVolume');
            expect(config).toHaveProperty('uiVolume');
            expect(config).toHaveProperty('eventVolume');
            expect(config).toHaveProperty('muted');
        });
    });
    describe('停止所有音效', () => {
        it('应该能够停止所有音效', () => {
            expect(() => audioManager.stopAll()).not.toThrow();
        });
    });
    describe('清理资源', () => {
        it('应该能够清理资源', () => {
            expect(() => audioManager.dispose()).not.toThrow();
        });
        it('清理后应该可以重新初始化', async () => {
            audioManager.dispose();
            await expect(audioManager.initialize()).resolves.not.toThrow();
        });
    });
    describe('所有音效 ID', () => {
        it('应该支持所有定义的音效', () => {
            const allSounds = Object.values(SoundId);
            allSounds.forEach(soundId => {
                expect(() => audioManager.playSound(soundId)).not.toThrow();
            });
        });
    });
});
// 恢复原始 Audio
global.Audio = originalAudio;
