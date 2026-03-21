/**
 * @fileoverview 手牌展示组件 v2.0.0
 * 显示战斗中玩家的手牌
 */

import React, { useCallback } from 'react';
import { Card, CardRarity } from '../../types/card.v2';
import './HandDisplay.css';

/**
 * 手牌展示组件 Props
 */
export interface HandDisplayProps {
  /** 当前手牌 */
  cards: Card[];
  /** 当前能量 */
  energy: number;
  /** 最大能量 */
  maxEnergy: number;
  /** 点击卡牌回调 */
  onCardClick?: (card: Card) => void;
  /** 是否禁用（不能出牌） */
  disabled?: boolean;
  /** 玩家是否正在等待 */
  isWaiting?: boolean;
}

/**
 * 获取稀有度对应的颜色
 */
const getRarityColor = (rarity: CardRarity): string => {
  switch (rarity) {
    case CardRarity.COMMON:
      return '#8a8a8a';
    case CardRarity.UNCOMMON:
      return '#4CAF50';
    case CardRarity.RARE:
      return '#2196F3';
    case CardRarity.EPIC:
      return '#9C27B0';
    case CardRarity.LEGENDARY:
      return '#FF9800';
    default:
      return '#8a8a8a';
  }
};

/**
 * 获取稀有度名称（中文）
 */
const getRarityName = (rarity: CardRarity): string => {
  switch (rarity) {
    case CardRarity.COMMON:
      return '普通';
    case CardRarity.UNCOMMON:
      return '稀有';
    case CardRarity.RARE:
      return '罕见';
    case CardRarity.EPIC:
      return '史诗';
    case CardRarity.LEGENDARY:
      return '传说';
    default:
      return '普通';
  }
};

/**
 * 手牌展示组件
 */
const HandDisplay: React.FC<HandDisplayProps> = ({
  cards,
  energy,
  maxEnergy,
  onCardClick,
  disabled = false,
  isWaiting = false,
}) => {
  /**
   * 处理卡牌点击
   */
  const handleCardClick = useCallback(
    (card: Card) => {
      if (disabled || isWaiting) return;
      if (energy < card.cost) return;
      onCardClick?.(card);
    },
    [disabled, isWaiting, energy, onCardClick]
  );

  /**
   * 判断卡牌是否可点击
   */
  const isCardPlayable = useCallback(
    (card: Card) => {
      if (disabled || isWaiting) return false;
      return energy >= card.cost;
    },
    [disabled, isWaiting, energy]
  );

  return (
    <div className="hand-display">
      {/* 能量显示 */}
      <div className="hand-display__energy">
        <div className="hand-display__energy-label">能量</div>
        <div className="hand-display__energy-bar">
          {Array.from({ length: maxEnergy }).map((_, index) => (
            <div
              key={index}
              className={`hand-display__energy-orb ${
                index < energy ? 'hand-display__energy-orb--filled' : ''
              }`}
            >
              ⚡
            </div>
          ))}
        </div>
      </div>

      {/* 手牌区域 */}
      <div className="hand-display__cards">
        {cards.length === 0 ? (
          <div className="hand-display__empty">
            <span>没有手牌</span>
          </div>
        ) : (
          cards.map((card) => {
            const playable = isCardPlayable(card);
            const rarityColor = getRarityColor(card.rarity);

            return (
              <div
                key={card.id}
                className={`hand-card ${playable ? 'hand-card--playable' : 'hand-card--disabled'} ${
                  isWaiting ? 'hand-card--waiting' : ''
                }`}
                onClick={() => handleCardClick(card)}
                style={{
                  '--rarity-color': rarityColor,
                } as React.CSSProperties}
              >
                {/* 能量消耗 */}
                <div className="hand-card__cost">{card.cost}</div>

                {/* 卡牌名称 */}
                <div className="hand-card__name">{card.name}</div>

                {/* 卡牌形状 */}
                <div className="hand-card__shape">
                  <div
                    className="hand-card__shape-grid"
                    style={{
                      gridTemplateColumns: `repeat(${card.shape[0]?.length || 1}, 1fr)`,
                    }}
                  >
                    {card.shape.map((row, rowIndex) =>
                      row.map((cell, colIndex) => (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={`hand-card__shape-cell ${
                            cell ? 'hand-card__shape-cell--filled' : ''
                          }`}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* 卡牌效果描述 */}
                <div className="hand-card__description">
                  {card.description}
                </div>

                {/* 稀有度标签 */}
                <div className="hand-card__rarity">
                  {getRarityName(card.rarity)}
                </div>

                {/* 升级标记 */}
                {card.upgradeLevel > 0 && (
                  <div className="hand-card__upgrade">
                    {'+'.repeat(card.upgradeLevel)}
                  </div>
                )}

                {/* 伤害/护盾数值 */}
                {(card.damage !== undefined || card.block !== undefined || card.heal !== undefined) && (
                  <div className="hand-card__stats">
                    {card.damage !== undefined && (
                      <span className="hand-card__stat hand-card__stat--damage">
                        ⚔️{card.damage}
                      </span>
                    )}
                    {card.block !== undefined && (
                      <span className="hand-card__stat hand-card__stat--block">
                        🛡️{card.block}
                      </span>
                    )}
                    {card.heal !== undefined && (
                      <span className="hand-card__stat hand-card__stat--heal">
                        💖{card.heal}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 等待提示 */}
      {isWaiting && (
        <div className="hand-display__waiting">
          <span>等待中...</span>
        </div>
      )}
    </div>
  );
};

export default HandDisplay;
