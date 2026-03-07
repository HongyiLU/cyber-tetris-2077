// ==================== 伤害数字组件 ====================

import React, { useEffect, useState } from 'react';
import './DamageNumber.css';

interface DamageNumberProps {
  value: number;
  type: 'damage' | 'heal' | 'critical' | 'combo';
  position?: { x: number; y: number };
  onComplete?: () => void;
}

/**
 * 伤害数字组件
 * 显示飘动的伤害/治疗数字
 */
export const DamageNumber: React.FC<DamageNumberProps> = ({
  value,
  type,
  position,
  onComplete,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // 动画持续时间后移除组件
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 1000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  const getDamageClass = () => {
    switch (type) {
      case 'damage':
        return 'damage-normal';
      case 'heal':
        return 'damage-heal';
      case 'critical':
        return 'damage-critical';
      case 'combo':
        return 'damage-combo';
      default:
        return 'damage-normal';
    }
  };

  const getDamageText = () => {
    switch (type) {
      case 'heal':
        return `+${value}`;
      case 'critical':
        return `${value}!`;
      case 'combo':
        return `${value}x`;
      default:
        return value.toString();
    }
  };

  return (
    <div
      className={`damage-number ${getDamageClass()}`}
      style={
        position
          ? { left: `${position.x}px`, top: `${position.y}px` }
          : undefined
      }
    >
      {getDamageText()}
    </div>
  );
};
