/**
 * 装备系统
 * 管理装备的装备、卸下和效果计算
 */
import { EQUIPMENT_CONFIG, getEquipmentById } from '../config/equipment-config';
export class EquipmentSystem {
    constructor(initialState) {
        Object.defineProperty(this, "state", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "onStateChange", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.state = {
            slots: {
                head: initialState?.slots?.head || null,
                body: initialState?.slots?.body || null,
                accessory: initialState?.slots?.accessory || null,
            },
            unlockedEquipment: initialState?.unlockedEquipment || [],
        };
        // 如果没有已解锁装备列表，默认解锁所有 Common 装备
        if (!initialState?.unlockedEquipment || initialState.unlockedEquipment.length === 0) {
            const commonEquipment = EQUIPMENT_CONFIG
                .filter((eq) => eq.rarity === 'Common')
                .map((eq) => eq.id);
            this.state.unlockedEquipment = commonEquipment;
        }
    }
    /**
     * 设置状态变化回调
     */
    setStateChangeCallback(callback) {
        this.onStateChange = callback;
    }
    /**
     * 通知状态变化
     */
    notifyStateChange() {
        if (this.onStateChange) {
            this.onStateChange(this.getState());
        }
    }
    /**
     * 获取当前状态
     */
    getState() {
        return { ...this.state };
    }
    /**
     * 获取已解锁的装备列表
     */
    getUnlockedEquipment() {
        return this.state.unlockedEquipment
            .map(id => getEquipmentById(id))
            .filter((eq) => eq !== undefined);
    }
    /**
     * 解锁装备
     */
    unlockEquipment(equipmentId) {
        if (this.state.unlockedEquipment.includes(equipmentId)) {
            return false; // 已解锁
        }
        const equipment = getEquipmentById(equipmentId);
        if (!equipment) {
            return false; // 装备不存在
        }
        this.state.unlockedEquipment.push(equipmentId);
        this.notifyStateChange();
        return true;
    }
    /**
     * 检查装备是否已解锁
     */
    isEquipmentUnlocked(equipmentId) {
        return this.state.unlockedEquipment.includes(equipmentId);
    }
    /**
     * 装备物品
     */
    equipEquipment(equipmentId) {
        const equipment = getEquipmentById(equipmentId);
        if (!equipment) {
            return false; // 装备不存在
        }
        if (!this.state.unlockedEquipment.includes(equipmentId)) {
            return false; // 装备未解锁
        }
        // 检查槽位是否匹配
        const slot = this.getSlotForType(equipment.type);
        if (!slot) {
            return false;
        }
        // 装备到对应槽位
        this.state.slots[slot] = equipment;
        this.notifyStateChange();
        return true;
    }
    /**
     * 卸下物品
     */
    unequipEquipment(slot) {
        const slotKey = this.getSlotForType(slot);
        if (!slotKey || this.state.slots[slotKey] === null) {
            return false; // 槽位为空
        }
        this.state.slots[slotKey] = null;
        this.notifyStateChange();
        return true;
    }
    /**
     * 获取槽位对应的键
     */
    getSlotForType(type) {
        switch (type) {
            case 'Head':
                return 'head';
            case 'Body':
                return 'body';
            case 'Accessory':
                return 'accessory';
            default:
                return null;
        }
    }
    /**
     * 获取当前装备槽
     */
    getEquipmentSlots() {
        return { ...this.state.slots };
    }
    /**
     * 计算当前装备效果
     */
    calculateEffects() {
        const effects = {
            damageMultiplier: 1.0,
            damageReductionMultiplier: 1.0,
            healthBonus: 0,
            comboDamageBonus: 0.0,
            comboTimeBonus: 0,
            healPerTick: 0,
            healInterval: 10000, // 默认 10 秒
        };
        // 遍历所有装备槽
        Object.values(this.state.slots).forEach(equipment => {
            if (!equipment)
                return;
            equipment.effects.forEach(effect => {
                switch (effect.type) {
                    case 'damageBoost':
                        effects.damageMultiplier += effect.value / 100;
                        break;
                    case 'damageReduction':
                        effects.damageReductionMultiplier -= effect.value / 100;
                        break;
                    case 'healthBoost':
                        effects.healthBonus += effect.value;
                        break;
                    case 'comboBoost':
                        effects.comboDamageBonus += effect.value / 100;
                        break;
                    case 'comboTimeBoost':
                        effects.comboTimeBonus += effect.value;
                        break;
                    case 'healAura':
                        effects.healPerTick += effect.value;
                        break;
                }
            });
        });
        // 确保减免不超过 100%
        effects.damageReductionMultiplier = Math.max(0.1, effects.damageReductionMultiplier);
        return effects;
    }
    /**
     * 应用装备效果到战斗参数
     */
    applyToBattleParams(params) {
        const effects = this.calculateEffects();
        return {
            health: params.baseHealth + effects.healthBonus,
            damage: params.baseDamage * effects.damageMultiplier,
            comboTimeWindow: params.comboTimeWindow + effects.comboTimeBonus,
            healPerTick: effects.healPerTick,
            healInterval: effects.healInterval,
        };
    }
    /**
     * 重置装备状态（用于新游戏）
     */
    reset(keepUnlocked = true) {
        this.state.slots = {
            head: null,
            body: null,
            accessory: null,
        };
        if (!keepUnlocked) {
            // 只保留 Common 装备
            const commonEquipment = EQUIPMENT_CONFIG
                .filter((eq) => eq.rarity === 'Common')
                .map((eq) => eq.id);
            this.state.unlockedEquipment = commonEquipment;
        }
        this.notifyStateChange();
    }
    /**
     * 序列化状态（用于保存）
     * 只保存装备 ID，而不是完整对象
     */
    serialize() {
        const serializableState = {
            slots: {
                head: this.state.slots.head?.id || null,
                body: this.state.slots.body?.id || null,
                accessory: this.state.slots.accessory?.id || null,
            },
            unlockedEquipment: this.state.unlockedEquipment,
        };
        return JSON.stringify(serializableState);
    }
    /**
     * 反序列化状态（用于加载）
     * 从装备 ID 恢复完整对象
     */
    static deserialize(data) {
        const serializedState = JSON.parse(data);
        // 从 ID 恢复装备对象
        const state = {
            slots: {
                head: serializedState.slots.head ? getEquipmentById(serializedState.slots.head) || null : null,
                body: serializedState.slots.body ? getEquipmentById(serializedState.slots.body) || null : null,
                accessory: serializedState.slots.accessory ? getEquipmentById(serializedState.slots.accessory) || null : null,
            },
            unlockedEquipment: serializedState.unlockedEquipment,
        };
        return new EquipmentSystem(state);
    }
    /**
     * 从 localStorage 加载
     */
    static loadFromStorage(key = 'equipmentState') {
        try {
            const data = localStorage.getItem(key);
            if (!data)
                return null;
            return EquipmentSystem.deserialize(data);
        }
        catch (e) {
            console.error('Failed to load equipment state from storage:', e);
            return null;
        }
    }
    /**
     * 保存到 localStorage
     */
    saveToStorage(key = 'equipmentState') {
        try {
            localStorage.setItem(key, this.serialize());
        }
        catch (e) {
            console.error('Failed to save equipment state to storage:', e);
        }
    }
}
