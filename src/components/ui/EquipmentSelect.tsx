/**
 * 装备选择组件
 * 允许玩家在战斗前选择装备
 */

import React, { useState } from 'react';
import { Equipment, RARITY_COLORS } from '../../types/equipment';
import { EQUIPMENT_CONFIG, getEquipmentByType } from '../../config/equipment-config';
import './EquipmentSelect.css';

interface EquipmentSelectProps {
  onSelect: (equipmentId: string) => void;
  onClose: () => void;
  selectedEquipment?: {
    head: string | null;
    body: string | null;
    accessory: string | null;
  };
  unlockedEquipment?: string[];
}

export const EquipmentSelect: React.FC<EquipmentSelectProps> = ({
  onSelect,
  onClose,
  selectedEquipment = { head: null, body: null, accessory: null },
  unlockedEquipment = [],
}) => {
  const [activeTab, setActiveTab] = useState<'Head' | 'Body' | 'Accessory'>('Head');

  // 获取当前标签页的装备列表
  const equipmentList = getEquipmentByType(activeTab);

  // 获取当前槽位已装备的物品 ID
  const getCurrentSlotId = () => {
    return selectedEquipment[activeTab.toLowerCase() as keyof typeof selectedEquipment];
  };

  // 检查装备是否已解锁
  const isUnlocked = (equipmentId: string) => {
    return unlockedEquipment.includes(equipmentId);
  };

  // 获取稀有度颜色
  const getRarityColor = (rarity: string) => {
    return RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] || '#9CA3AF';
  };

  // 渲染效果描述
  const renderEffect = (effect: { type: string; value: number; unit?: string }, idx: number) => {
    const effectNames: Record<string, string> = {
      damageBoost: '伤害提升',
      damageReduction: '伤害减免',
      healthBoost: '生命值提升',
      comboBoost: '连击伤害加成',
      comboTimeBoost: '连击时间延长',
      healAura: '每秒治疗',
    };

    const name = effectNames[effect.type] || effect.type;
    const value = effect.unit === '%' ? `${effect.value}%` : 
                  effect.unit === 'seconds' ? `+${effect.value}s` : 
                  `+${effect.value}`;
    
    return `${name} ${value}`;
  };

  return (
    <div className="equipment-select-overlay" onClick={onClose}>
      <div className="equipment-select-modal" onClick={e => e.stopPropagation()}>
        <div className="equipment-select-header">
          <h2>🎒 装备选择</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* 槽位标签页 */}
        <div className="equipment-tabs">
          <button
            className={`tab ${activeTab === 'Head' ? 'active' : ''}`}
            onClick={() => setActiveTab('Head')}
          >
            🪖 头部
          </button>
          <button
            className={`tab ${activeTab === 'Body' ? 'active' : ''}`}
            onClick={() => setActiveTab('Body')}
          >
            🦺 身体
          </button>
          <button
            className={`tab ${activeTab === 'Accessory' ? 'active' : ''}`}
            onClick={() => setActiveTab('Accessory')}
          >
            💍 饰品
          </button>
        </div>

        {/* 装备列表 */}
        <div className="equipment-list">
          {equipmentList.map((equipment: Equipment) => {
            const unlocked = isUnlocked(equipment.id);
            const selected = getCurrentSlotId() === equipment.id;
            const rarityColor = getRarityColor(equipment.rarity);

            return (
              <div
                key={equipment.id}
                className={`equipment-card ${selected ? 'selected' : ''} ${!unlocked ? 'locked' : ''}`}
                style={{ borderColor: rarityColor }}
                onClick={() => unlocked && onSelect(equipment.id)}
              >
                <div className="equipment-card-header">
                  <span className="equipment-icon">{equipment.icon}</span>
                  <div className="equipment-info">
                    <h3 className="equipment-name">{equipment.name}</h3>
                    <span 
                      className="equipment-rarity"
                      style={{ color: rarityColor }}
                    >
                      {equipment.rarity}
                    </span>
                  </div>
                </div>

                <p className="equipment-description">{equipment.description}</p>

                <div className="equipment-effects">
                  {equipment.effects.map((effect, idx) => (
                    <div key={idx} className="effect-item">
                      <span className="effect-text">{renderEffect(effect, idx)}</span>
                    </div>
                  ))}
                </div>

                {!unlocked && (
                  <div className="equipment-locked-overlay">
                    🔒 未解锁
                  </div>
                )}

                {selected && (
                  <div className="equipment-selected-badge">
                    ✓ 已装备
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 当前装备提示 */}
        <div className="equipment-select-footer">
          <p>
            💡 提示：点击装备进行装备/卸下。每种类型只能装备一个物品。
          </p>
        </div>
      </div>
    </div>
  );
};

export default EquipmentSelect;
