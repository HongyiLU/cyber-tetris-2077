// ==================== 敌人选择组件 ====================

import React, { useState } from 'react';
import { getAllEnemies, getEnemyType } from '../../config/enemy-config';
import type { EnemyType } from '../../types/enemy';
import './EnemySelect.css';

interface EnemySelectProps {
  onEnemySelect: (enemyId: string) => void;
  selectedEnemyId?: string;
}

/**
 * 敌人选择组件
 * 用于在战斗开始前选择敌人
 */
export const EnemySelect: React.FC<EnemySelectProps> = ({
  onEnemySelect,
  selectedEnemyId = 'slime',
}) => {
  const [selectedId, setSelectedId] = useState<string>(selectedEnemyId);
  const enemies = getAllEnemies();

  const handleSelect = (enemyId: string) => {
    setSelectedId(enemyId);
    onEnemySelect(enemyId);
  };

  const getRarityColor = (rarity: string): string => {
    const colors: Record<string, string> = {
      common: '#888',
      uncommon: '#4caf50',
      rare: '#2196f3',
      epic: '#9c27b0',
      legendary: '#ff9800',
    };
    return colors[rarity] || '#888';
  };

  const selectedEnemy = getEnemyType(selectedId);

  return (
    <div className="enemy-select">
      <h3 className="enemy-select-title">选择敌人</h3>
      
      <div className="enemy-list">
        {enemies.map((enemy) => (
          <div
            key={enemy.id}
            className={`enemy-card ${selectedId === enemy.id ? 'selected' : ''}`}
            onClick={() => handleSelect(enemy.id)}
          >
            <div className="enemy-card-header">
              <span className="enemy-emoji">{enemy.emoji}</span>
              <span
                className="enemy-rarity"
                style={{ color: getRarityColor(enemy.rarity) }}
              >
                {enemy.rarity}
              </span>
            </div>
            
            <h4 className="enemy-name">{enemy.name}</h4>
            
            <div className="enemy-stats">
              <div className="stat">
                <span className="stat-label">血量</span>
                <span className="stat-value">{enemy.hp}</span>
              </div>
              <div className="stat">
                <span className="stat-label">伤害</span>
                <span className="stat-value">{enemy.attackDamage}</span>
              </div>
              <div className="stat">
                <span className="stat-label">间隔</span>
                <span className="stat-value">{enemy.attackInterval / 1000}s</span>
              </div>
            </div>
            
            <p className="enemy-description">{enemy.description}</p>
          </div>
        ))}
      </div>

      {selectedEnemy && (
        <div className="selected-enemy-preview">
          <h4>当前选择</h4>
          <div className="preview-content">
            <span className="preview-emoji">{selectedEnemy.emoji}</span>
            <div className="preview-info">
              <span className="preview-name">{selectedEnemy.name}</span>
              <span className="preview-desc">{selectedEnemy.description}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
