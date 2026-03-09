/**
 * 装备选择组件
 * 允许玩家在战斗前选择装备
 */

import React, { useState, useEffect } from 'react';
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

// M4: 提取效果名称映射到常量
const EFFECT_NAMES: Record<string, string> = {
  damageBoost: '伤害提升',
  damageReduction: '伤害减免',
  healthBoost: '生命值提升',
  comboBoost: '连击伤害加成',
  comboTimeBoost: '连击时间延长',
  healAura: '每秒治疗',
};

export const EquipmentSelect: React.FC<EquipmentSelectProps> = ({
  onSelect,
  onClose,
  selectedEquipment = { head: null, body: null, accessory: null },
  unlockedEquipment = [],
}) => {
  const [activeTab, setActiveTab] = useState<'Head' | 'Body' | 'Accessory'>('Head');
  const [hoveredEquipment, setHoveredEquipment] = useState<string | null>(null);

  // 获取当前标签页的装备列表
  const equipmentList = getEquipmentByType(activeTab);

  // 获取当前槽位已装备的物品 ID
  const getCurrentSlotId = () => {
    return selectedEquipment[activeTab.toLowerCase() as keyof typeof selectedEquipment];
  };

  // 获取当前装备的详细信息
  const getCurrentEquipment = () => {
    const currentId = getCurrentSlotId();
    if (!currentId) return null;
    return equipmentList.find(e => e.id === currentId);
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
    const name = EFFECT_NAMES[effect.type] || effect.type;
    const value = effect.unit === '%' ? `${effect.value}%` : 
                  effect.unit === 'seconds' ? `+${effect.value}s` : 
                  `+${effect.value}`;
    
    return `${name} ${value}`;
  };

  // M4: 简化 compareEffects 函数
  const compareEffects = (
    currentEffect?: { type: string; value: number; unit?: string },
    newEffect?: { type: string; value: number; unit?: string }
  ): { text: string; color: string } | null => {
    if (!currentEffect && !newEffect) return null;
    if (!currentEffect && newEffect) {
      return { text: renderEffect(newEffect, 0), color: '#2ecc71' };
    }
    if (currentEffect && !newEffect) {
      return { text: renderEffect(currentEffect, 0), color: '#e74c3c' };
    }
    if (!currentEffect || !newEffect) return null;
    
    const currentValue = currentEffect.value;
    const newValue = newEffect.value;
    
    if (newValue > currentValue) {
      return { text: renderEffect(newEffect, 0), color: '#2ecc71' };
    } else if (newValue < currentValue) {
      return { text: renderEffect(newEffect, 0), color: '#e74c3c' };
    } else {
      return { text: renderEffect(newEffect, 0), color: '#95a5a6' };
    }
  };

  // H1: 添加键盘事件监听（Esc 键关闭）
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const currentEquipment = getCurrentEquipment();
  const hoveredEquipmentData = hoveredEquipment ? equipmentList.find(e => e.id === hoveredEquipment) : null;

  return (
    <div className="equipment-select-overlay" onClick={onClose}>
      <div className="equipment-select-modal" onClick={e => e.stopPropagation()}>
        <div className="equipment-select-header">
          <h2>🎒 装备选择</h2>
          {/* H3: 添加 aria-label */}
          <button className="close-btn" onClick={onClose} aria-label="关闭装备选择">✕</button>
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

        {/* 装备对比提示 */}
        {hoveredEquipmentData && (
          <div className="equipment-comparison">
            <div className="comparison-title">⚖️ 装备对比</div>
            <div className="comparison-content">
              <div className="comparison-column">
                <div className="comparison-label">当前装备</div>
                {currentEquipment ? (
                  <div className="comparison-item">
                    <div className="comparison-item-name">{currentEquipment.name}</div>
                    {currentEquipment.effects.map((effect, idx) => (
                      <div key={idx} className="comparison-effect">{renderEffect(effect, idx)}</div>
                    ))}
                  </div>
                ) : (
                  <div className="comparison-empty">空槽位</div>
                )}
              </div>
              <div className="comparison-arrow">→</div>
              <div className="comparison-column">
                <div className="comparison-label">新装备</div>
                <div className="comparison-item">
                  <div className="comparison-item-name">{hoveredEquipmentData.name}</div>
                  {hoveredEquipmentData.effects.map((effect, idx) => {
                    const currentEffect = currentEquipment?.effects[idx];
                    const comparison = compareEffects(currentEffect, effect);
                    return (
                      <div 
                        key={idx} 
                        className="comparison-effect"
                        style={{ color: comparison?.color || '#e2e8f0' }}
                      >
                        {comparison?.text || renderEffect(effect, idx)}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

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
                onMouseEnter={() => unlocked && setHoveredEquipment(equipment.id)}
                onMouseLeave={() => setHoveredEquipment(null)}
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
            💡 提示：点击装备进行装备/卸下。悬停查看对比。每种类型只能装备一个物品。
          </p>
        </div>
      </div>
    </div>
  );
};

export default EquipmentSelect;
