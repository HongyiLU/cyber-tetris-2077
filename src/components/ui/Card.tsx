// ==================== 卡牌组件 ====================
// v1.9.14 - 完整卡牌显示（卡名、卡面、效果、稀有度）
// v1.9.16 - 特殊效果方块添加效果图标

import React from 'react';
import type { Rarity } from '../../types/legacy/card';
import { Card, CardProps, getRarityConfig } from '../../types/legacy/card';
import BlockVisual from './BlockVisual';
import './Card.css';

// v1.9.16 特殊效果方块的效果图标映射
const SPECIAL_BLOCK_EFFECTS: Record<string, string> = {
  'BOMB': '💣',
  'TIME': '⏰',
  'HEAL': '💖',
  'SHIELD': '🛡️',
  'COMBO': '📈',
  'CLEAR': '🌟',
  'LUCKY': '7️⃣',
  'FREEZE': '❄️',
  'FIRE': '🔥',
  'LIGHTNING': '⚡',
};

/**
 * 卡牌组件
 * 显示完整的卡牌信息：卡名、卡面、效果描述、稀有度
 */
const CardComponent: React.FC<CardProps> = ({
  card,
  size = 'medium',
  showBorder = true,
  showShadow = true,
  clickable = false,
  onClick,
  className = '',
  style,
}) => {
  const rarityConfig = getRarityConfig(card.rarity);
  
  // v1.9.16 判断是否为特殊效果方块
  const isSpecialBlock = card.pieceType in SPECIAL_BLOCK_EFFECTS;
  const effectIcon = SPECIAL_BLOCK_EFFECTS[card.pieceType];

  // 卡牌尺寸映射
  const sizeMap = {
    small: { width: 100, height: 150 },
    medium: { width: 120, height: 180 },
    large: { width: 160, height: 240 },
  };

  const { width, height } = sizeMap[size];

  // 处理点击事件
  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`cyber-card cyber-card--${size} cyber-card-${card.rarity} ${className}`}
      style={{
        width,
        height,
        borderColor: showBorder ? rarityConfig.borderColor : 'transparent',
        boxShadow: showShadow ? `0 0 20px ${rarityConfig.glowColor}` : 'none',
        background: `linear-gradient(135deg, ${rarityConfig.glowColor}10 0%, ${rarityConfig.glowColor}20 100%)`,
        cursor: clickable ? 'pointer' : 'default',
        ...style,
      }}
      onClick={handleClick}
      role={clickable ? 'button' : 'img'}
      aria-label={`${card.name} - ${rarityConfig.name}`}
      tabIndex={clickable ? 0 : -1}
    >
      {/* 稀有度徽章 */}
      <div className="cyber-card-rarity">
        <span className="rarity-icon">{rarityConfig.icon}</span>
        <span className="rarity-name">{rarityConfig.name}</span>
      </div>

      {/* 卡名 */}
      <div className="cyber-card-name">
        <h3>{card.name}</h3>
      </div>

      {/* 卡面（方块形状 + 效果图标） */}
      <div className="cyber-card-face">
        <BlockVisual
          pieceType={card.pieceType}
          size={size === 'small' ? 40 : size === 'medium' ? 56 : 80}
          showBorder={true}
          showShadow={true}
        />
        {/* v1.9.16 特殊效果方块效果图标 */}
        {isSpecialBlock && effectIcon && (
          <div className="cyber-card-effect-icon">
            <span className="effect-icon-emoji">{effectIcon}</span>
          </div>
        )}
      </div>

      {/* 效果描述 */}
      <div className="cyber-card-description">
        <p>{card.description}</p>
      </div>

      {/* 稀有度边框装饰 */}
      <div className="cyber-card-border-decoration"></div>
    </div>
  );
};

/**
 * 创建卡牌数据
 * @param pieceType 方块类型
 * @param name 卡名
 * @param description 效果描述
 * @param rarity 稀有度
 * @param color 方块颜色
 * @returns 卡牌对象
 */
export function createCard(
  pieceType: string,
  name: string,
  description: string,
  rarity: Rarity,
  color: string
): Card {
  return {
    pieceType,
    name,
    description,
    rarity,
    color,
  };
}

export default CardComponent;
