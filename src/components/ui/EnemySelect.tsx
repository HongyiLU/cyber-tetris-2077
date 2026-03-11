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
      {/* 顶部：当前选择预览 - 固定可见 */}
      {selectedEnemy && (
        <div className="selected-enemy-preview" style={{
          position: 'sticky',
          top: '0',
          zIndex: '100',
          marginBottom: '15px',
        }}>
          <h4 style={{
            margin: '0 0 10px 0',
            color: '#00ffff',
            fontFamily: 'Orbitron, monospace',
            fontSize: '14px',
          }}>
            👆 当前选择
          </h4>
          <div className="preview-content" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            padding: '15px',
            background: 'rgba(0, 255, 255, 0.1)',
            border: '2px solid #00ffff',
            borderRadius: '8px',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
          }}>
            <span className="preview-emoji" style={{
              fontSize: '48px',
              lineHeight: '1',
            }}>
              {selectedEnemy.emoji}
            </span>
            <div className="preview-info" style={{
              flex: '1',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
            }}>
              <span className="preview-name" style={{
                color: '#fff',
                fontFamily: 'Orbitron, monospace',
                fontSize: '18px',
                fontWeight: 'bold',
              }}>
                {selectedEnemy.name}
              </span>
              <div className="preview-stats" style={{
                display: 'flex',
                gap: '15px',
                fontSize: '14px',
                color: '#aaa',
              }}>
                <span>❤️ HP: {selectedEnemy.hp}</span>
                <span>⚔️ 伤害：{selectedEnemy.attackDamage}</span>
                <span>⏱️ 间隔：{selectedEnemy.attackInterval / 1000}s</span>
              </div>
              <span className="preview-desc" style={{
                color: '#888',
                fontSize: '12px',
                marginTop: '5px',
              }}>
                {selectedEnemy.description}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* 敌人列表 - 可滚动 */}
      <div className="enemy-list" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
        {enemies.map((enemy) => (
          <div
            key={enemy.id}
            className={`enemy-card ${selectedId === enemy.id ? 'selected' : ''}`}
            onClick={() => handleSelect(enemy.id)}
            style={{
              padding: '15px',
              background: selectedId === enemy.id 
                ? 'rgba(0, 255, 255, 0.15)' 
                : 'rgba(255, 255, 255, 0.05)',
              border: selectedId === enemy.id 
                ? '2px solid #00ffff' 
                : '2px solid transparent',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '8px',
            }}
          >
            <div className="enemy-card-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
            }}>
              <span className="enemy-emoji" style={{
                fontSize: '32px',
                marginRight: '10px',
              }}>
                {enemy.emoji}
              </span>
              <span
                className="enemy-rarity"
                style={{ 
                  color: getRarityColor(enemy.rarity),
                  fontSize: '12px',
                  fontFamily: 'Orbitron, monospace',
                  textTransform: 'uppercase',
                }}
              >
                {enemy.rarity}
              </span>
            </div>
            
            <h4 className="enemy-name" style={{
              color: '#fff',
              fontFamily: 'Orbitron, monospace',
              fontSize: '16px',
              margin: '0 0 10px 0',
            }}>
              {enemy.name}
            </h4>
            
            <div className="enemy-stats" style={{
              display: 'flex',
              gap: '15px',
              fontSize: '13px',
              color: '#aaa',
              marginBottom: '8px',
            }}>
              <div className="stat">
                <span className="stat-label">血量：</span>
                <span className="stat-value" style={{ color: '#ff6b6b' }}>{enemy.hp}</span>
              </div>
              <div className="stat">
                <span className="stat-label">伤害：</span>
                <span className="stat-value" style={{ color: '#f39c12' }}>{enemy.attackDamage}</span>
              </div>
              <div className="stat">
                <span className="stat-label">间隔：</span>
                <span className="stat-value">{enemy.attackInterval / 1000}s</span>
              </div>
            </div>
            
            <p className="enemy-description" style={{
              color: '#666',
              fontSize: '12px',
              margin: '0',
              lineHeight: '1.4',
            }}>
              {enemy.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
