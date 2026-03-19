// ==================== HandUI - 手牌显示组件 ====================
// v2.0.0 Day 5 - UI 集成

import React from 'react';
import type { CardData } from '../../types';
import './HandUI.css';

interface HandUIProps {
  /** 当前手牌列表 */
  hand: CardData[];
  /** 当前能量 */
  energy: number;
  /** 最大能量 */
  maxEnergy: number;
  /** 卡牌点击回调 */
  onCardClick: (index: number) => void;
  /** 是否禁用（敌人回合） */
  disabled?: boolean;
  /** 卡牌详细数据映射（可选，用于显示消耗/伤害/防御） */
  cardDetails?: Map<string, { cost: number; damage: number; block: number }>;
}

export const HandUI: React.FC<HandUIProps> = ({
  hand,
  energy,
  maxEnergy,
  onCardClick,
  disabled = false,
  cardDetails,
}) => {
  /**
   * 检查卡牌是否可打出（能量足够）
   */
  const canPlayCard = (card: CardData, index: number): boolean => {
    if (disabled) return false;
    const details = cardDetails?.get(card.id);
    const cost = details?.cost ?? 1;
    return energy >= cost;
  };

  /**
   * 获取卡牌能量消耗
   */
  const getCardCost = (card: CardData): number => {
    const details = cardDetails?.get(card.id);
    return details?.cost ?? 1;
  };

  /**
   * 获取卡牌伤害
   */
  const getCardDamage = (card: CardData): number => {
    const details = cardDetails?.get(card.id);
    return details?.damage ?? 0;
  };

  /**
   * 获取卡牌防御
   */
  const getCardBlock = (card: CardData): number => {
    const details = cardDetails?.get(card.id);
    return details?.block ?? 0;
  };

  /**
   * 获取卡牌类型样式类
   */
  const getCardTypeClass = (card: CardData): string => {
    const typeClass = card.type === 'basic' ? 'type-basic' : 'type-special';
    const rarityClass = `rarity-${card.rarity}`;
    return `${typeClass} ${rarityClass}`;
  };

  return (
    <div className="hand-ui">
      {/* 能量显示 */}
      <div className="energy-display">
        <div className="energy-icon">⚡</div>
        <div className="energy-info">
          <span className="energy-label">能量</span>
          <span className="energy-value">
            <span className="energy-current">{energy}</span>
            <span className="energy-separator">/</span>
            <span className="energy-max">{maxEnergy}</span>
          </span>
        </div>
        {/* 能量条动画 */}
        <div className="energy-bar">
          <div
            className="energy-fill"
            style={{ width: `${(energy / maxEnergy) * 100}%` }}
          />
        </div>
      </div>

      {/* 手牌区域 */}
      <div className="hand-cards">
        {hand.length === 0 ? (
          <div className="hand-empty">
            <span>没有手牌</span>
          </div>
        ) : (
          hand.map((card, index) => {
            const playable = canPlayCard(card, index);
            const cost = getCardCost(card);
            const damage = getCardDamage(card);
            const block = getCardBlock(card);

            return (
              <div
                key={`${card.id}-${index}`}
                className={`hand-card ${getCardTypeClass(card)} ${!playable ? 'disabled' : ''} ${disabled ? 'disabled-turn' : ''}`}
                onClick={() => playable && onCardClick(index)}
                role={playable ? 'button' : 'img'}
                tabIndex={playable ? 0 : -1}
                aria-label={`${card.name}，消耗 ${cost} 能量`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && playable) {
                    onCardClick(index);
                  }
                }}
              >
                {/* 卡牌能量角标 */}
                <div className="card-cost-badge">
                  <span className="cost-value">{cost}</span>
                </div>

                {/* 卡牌名称 */}
                <div className="card-name">{card.name}</div>

                {/* 卡牌颜色/方块预览 */}
                <div className="card-visual">
                  <div
                    className="card-block-preview"
                    style={{ backgroundColor: card.color || '#888' }}
                  />
                </div>

                {/* 卡牌效果 */}
                <div className="card-effects">
                  {damage > 0 && (
                    <div className="card-effect damage">
                      <span className="effect-icon">⚔️</span>
                      <span className="effect-value">{damage}</span>
                    </div>
                  )}
                  {block > 0 && (
                    <div className="card-effect block">
                      <span className="effect-icon">🛡️</span>
                      <span className="effect-value">{block}</span>
                    </div>
                  )}
                </div>

                {/* 不可用遮罩 */}
                {!playable && !disabled && (
                  <div className="card-disabled-overlay">
                    <span className="disabled-reason">
                      {energy < cost ? '能量不足' : '无法使用'}
                    </span>
                  </div>
                )}
                {disabled && (
                  <div className="card-disabled-overlay turn">
                    <span className="disabled-reason">回合结束</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HandUI;
