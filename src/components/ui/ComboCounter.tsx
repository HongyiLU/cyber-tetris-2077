// ==================== 连击计数器组件 ====================

import React from 'react';
import './ComboCounter.css';

interface ComboCounterProps {
  combo: number;
  maxCombo: number;
  visible: boolean;
}

/**
 * 连击计数器组件
 * 显示当前连击数和最大连击数
 */
export const ComboCounter: React.FC<ComboCounterProps> = ({
  combo,
  maxCombo,
  visible,
}) => {
  if (!visible || combo <= 1) return null;

  const getComboLevel = () => {
    if (combo >= 20) return 'legendary';
    if (combo >= 15) return 'epic';
    if (combo >= 10) return 'rare';
    if (combo >= 5) return 'uncommon';
    return 'common';
  };

  const comboLevel = getComboLevel();

  return (
    <div className={`combo-counter ${comboLevel}`}>
      <div className="combo-main">
        <span className="combo-label">COMBO</span>
        <span className="combo-value">{combo}x</span>
      </div>
      
      {maxCombo > combo && (
        <div className="combo-max">
          <span className="combo-max-label">MAX</span>
          <span className="combo-max-value">{maxCombo}x</span>
        </div>
      )}

      <div className="combo-effect"></div>
    </div>
  );
};
