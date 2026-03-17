/**
 * 排行榜系统
 * 管理本地排行榜的存储、查询和更新
 */
import { DEFAULT_LEADERBOARD_CONFIG, LEADERBOARD_ICONS } from '../types/leaderboard';
export class LeaderboardSystem {
    constructor(config = {}) {
        Object.defineProperty(this, "state", {
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
        this.config = { ...DEFAULT_LEADERBOARD_CONFIG, ...config };
        // 初始化排行榜
        this.state = {
            combo: this.createLeaderboard('combo', '最高连击榜', '记录玩家的最高连击数', 'desc'),
            speed: this.createLeaderboard('speed', '最快通关榜', '记录击败敌人的最短时间', 'asc'),
            score: this.createLeaderboard('score', '总分榜', '记录玩家的最高得分', 'desc'),
        };
    }
    /**
     * 创建排行榜
     */
    createLeaderboard(type, name, description, sortOrder) {
        return {
            type,
            name,
            description,
            icon: LEADERBOARD_ICONS[type],
            unit: type === 'combo' ? '连击' : type === 'speed' ? '秒' : '分',
            sortOrder,
            entries: [],
            maxEntries: this.config.maxEntries,
        };
    }
    /**
     * 获取排行榜
     */
    getLeaderboard(type) {
        return { ...this.state[type] };
    }
    /**
     * 获取所有排行榜
     */
    getAllLeaderboards() {
        return Object.values(this.state).map(lb => ({ ...lb }));
    }
    /**
     * 添加记录
     */
    addEntry(type, playerName, value, metadata) {
        const leaderboard = this.state[type];
        // 创建新条目
        const newEntry = {
            id: this.generateId(),
            playerName,
            value,
            date: Date.now(),
            metadata,
        };
        // 检查是否能进入排行榜
        const shouldAdd = this.shouldAddEntry(leaderboard, newEntry);
        if (!shouldAdd) {
            return { success: false };
        }
        // 添加条目
        leaderboard.entries.push(newEntry);
        // 排序
        this.sortLeaderboard(leaderboard);
        // 限制条目数
        if (leaderboard.entries.length > leaderboard.maxEntries) {
            leaderboard.entries = leaderboard.entries.slice(0, leaderboard.maxEntries);
        }
        // 获取排名
        const rank = leaderboard.entries.findIndex(e => e.id === newEntry.id) + 1;
        return { success: true, rank };
    }
    /**
     * 检查是否应该添加条目
     */
    shouldAddEntry(leaderboard, entry) {
        // 如果为空，直接添加
        if (leaderboard.entries.length === 0) {
            return true;
        }
        const lastEntry = leaderboard.entries[leaderboard.entries.length - 1];
        if (leaderboard.sortOrder === 'desc') {
            // 降序：新记录必须大于最后一名
            return entry.value > lastEntry.value;
        }
        else {
            // 升序：新记录必须小于最后一名（时间越短越好）
            return entry.value < lastEntry.value;
        }
    }
    /**
     * 排序排行榜
     */
    sortLeaderboard(leaderboard) {
        leaderboard.entries.sort((a, b) => {
            if (leaderboard.sortOrder === 'desc') {
                return b.value - a.value;
            }
            else {
                return a.value - b.value;
            }
        });
    }
    /**
     * 生成唯一 ID
     */
    generateId() {
        return `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * 获取玩家最佳记录
     */
    getPlayerBest(type, playerName) {
        const leaderboard = this.state[type];
        const playerEntries = leaderboard.entries.filter(e => e.playerName === playerName);
        if (playerEntries.length === 0) {
            return null;
        }
        // 返回最好的记录
        if (leaderboard.sortOrder === 'desc') {
            return playerEntries.reduce((best, current) => current.value > best.value ? current : best);
        }
        else {
            return playerEntries.reduce((best, current) => current.value < best.value ? current : best);
        }
    }
    /**
     * 获取玩家排名
     */
    getPlayerRank(type, playerName) {
        const best = this.getPlayerBest(type, playerName);
        if (!best)
            return null;
        const leaderboard = this.state[type];
        const index = leaderboard.entries.findIndex(e => e.id === best.id);
        return index + 1;
    }
    /**
     * 清空排行榜
     */
    clear(type) {
        if (type) {
            this.state[type].entries = [];
        }
        else {
            Object.values(this.state).forEach(lb => {
                lb.entries = [];
            });
        }
    }
    /**
     * 序列化状态
     */
    serialize() {
        return JSON.stringify(this.state);
    }
    /**
     * 反序列化状态
     */
    static deserialize(data, config) {
        const state = JSON.parse(data);
        const system = new LeaderboardSystem(config);
        // 恢复状态
        system.state = state;
        return system;
    }
    /**
     * 从 localStorage 加载
     */
    static loadFromStorage(key = 'leaderboardState', config) {
        try {
            const data = localStorage.getItem(key);
            if (!data)
                return null;
            return LeaderboardSystem.deserialize(data, config);
        }
        catch (e) {
            console.error('Failed to load leaderboard state from storage:', e);
            return null;
        }
    }
    /**
     * 保存到 localStorage
     */
    saveToStorage(key = 'leaderboardState') {
        try {
            localStorage.setItem(key, this.serialize());
        }
        catch (e) {
            console.error('Failed to save leaderboard state to storage:', e);
        }
    }
}
