/**
 * @fileoverview 奖励选择界面 v2.0.0
 * 战斗胜利后选择卡牌奖励
 */

import React, { useCallback } from 'react';
import { Card, CardRarity } from '../../types/card.v2';
import { RewardOption } from '../../types/deck-builder';
import './RewardSelect.css';

/**
 * 奖励选择组件 Props
 */
export interface RewardSelectProps {
  /** 奖励选项 */
  options: RewardOption[];
  /** 选择回调 */
  onSelect: (option: RewardOption) => void;
  /** 跳过回调 */
  onSkip: () => void;
  /** 当前关卡 */
  stage?: number;
}

/**
 * 获取稀有度颜色
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
 * 获取稀有度名称
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
 * 奖励选择组件
 */
const RewardSelect: React.FC<RewardSelectProps> = ({
  options,
  onSelect,
  onSkip,
  stage = 1,
}) => {
  /**
   * 处理选项点击
   */
  const handleOptionClick = useCallback(
    (option: RewardOption) => {
      onSelect(option);
    },
    [onSelect]
  );

  /**
   * 处理跳过
   */
  const handleSkip = useCallback(() => {
    onSkip();
  }, [onSkip]);

  return (
    <div className="reward-select">
      <div className="reward-select__overlay" />

      <div className="reward-select__container">
        {/* 标题 */}
        <div className="reward-select__header">
          <h2 className="reward-select__title">
            <span className="reward-select__title-icon">🎁</span>
            战斗胜利！
          </h2>
          <p className="reward-select__subtitle">
            选择一张卡牌加入你的卡组
          </p>
          <div className="reward-select__stage">
            第 {stage} 关
          </div>
        </div>

        {/* 奖励选项 */}
        <div className="reward-select__options">
          {options.map((option, index) => {
            const card = option.cards[0];
            if (!card) return null;

            const rarityColor = getRarityColor(card.rarity);

            return (
              <div
                key={index}
                className="reward-option"
                onClick={() => handleOptionClick(option)}
                style={{
                  '--rarity-color': rarityColor,
                } as React.CSSProperties}
              >
                {/* 稀有度光效 */}
                <div className="reward-option__glow" />

                {/* 卡牌内容 */}
                <div className="reward-option__content">
                  {/* 稀有度标签 */}
                  <div className="reward-option__rarity">
                    {getRarityName(card.rarity)}
                  </div>

                  {/* 卡牌名称 */}
                  <h3 className="reward-option__name">{card.name}</h3>

                  {/* 卡牌形状 */}
                  <div className="reward-option__shape">
                    <div
                      className="reward-option__shape-grid"
                      style={{
                        gridTemplateColumns: `repeat(${card.shape[0]?.length || 1}, 1fr)`,
                      }}
                    >
                      {card.shape.map((row, rowIndex) =>
                        row.map((cell, colIndex) => (
                          <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`reward-option__shape-cell ${
                              cell ? 'reward-option__shape-cell--filled' : ''
                            }`}
                          />
                        ))
                      )}
                    </div>
                  </div>

                  {/* 效果描述 */}
                  <p className="reward-option__description">
                    {card.description}
                  </p>

                  {/* 数值 */}
                  <div className="reward-option__stats">
                    {card.cost > 0 && (
                      <span className="reward-option__stat">
                        ⚡{card.cost}
                      </span>
                    )}
                    {card.damage !== undefined && (
                      <span className="reward-option__stat reward-option__stat--damage">
                        ⚔️{card.damage}
                      </span>
                    )}
                    {card.block !== undefined && (
                      <span className="reward-option__stat reward-option__stat--block">
                        🛡️{card.block}
                      </span>
                    )}
                    {card.heal !== undefined && (
                      <span className="reward-option__stat reward-option__stat--heal">
                        💖{card.heal}
                      </span>
                    )}
                  </div>

                  {/* 升级效果提示 */}
                  {card.upgrade && (
                    <div className="reward-option__upgrade-hint">
                      可升级: +{card.upgrade.damage || 0} 伤害
                    </div>
                  )}
                </div>

                {/* 选择提示 */}
                <div className="reward-option__select-hint">
                  点击选择
                </div>
              </div>
            );
          })}
        </div>

        {/* 跳过按钮 */}
        <div className="reward-select__skip">
          <button
            className="reward-select__skip-btn"
            onClick={handleSkip}
          >
            <span className="reward-select__skip-icon">⏭️</span>
            跳过 (+10 金币)
          </button>
        </div>
      </div>
    </div>
  );
};

export default RewardSelect;
