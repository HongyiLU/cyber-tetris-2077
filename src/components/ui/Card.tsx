// ==================== 卡牌显示组件 ====================

import React from 'react';
import { GAME_CONFIG } from '../../config/game-config';
import type { CardData } from '../../types';

interface CardProps {
  card: CardData;
  collected?: boolean;
  onClick?: () => void;
  selected?: boolean;
  small?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  card, 
  collected = true,
  onClick,
  selected = false,
  small = false
}) => {
  const getRarityColor = (rarity: string): string => {
    const colors: Record<string, string> = {
      common: '#888888',
      uncommon: '#00cc66',
      rare: '#0099ff',
      epic: '#bf00ff',
      legendary: '#ffd700',
    };
    return colors[rarity] || '#888888';
  };

  const getBlockColor = (pieceId: string): string => {
    const colors = GAME_CONFIG.COLORS as Record<string, string>;
    return colors[pieceId] || '#ffffff';
  };

  const getShapeSize = (pieceId: string): number => {
    const shapes = GAME_CONFIG.SHAPES as Record<string, number[][]>;
    const shape = shapes[pieceId];
    return shape ? shape[0].length : 2;
  };

  const getShapeBlocks = (pieceId: string, color: string): string[] => {
    const shapes = GAME_CONFIG.SHAPES as Record<string, number[][]>;
    const shape = shapes[pieceId];
    if (!shape) return [];
    
    const blocks: string[] = [];
    shape.forEach(row => {
      row.forEach(cell => {
        blocks.push(cell ? color : 'transparent');
      });
    });
    return blocks;
  };

  const size = small ? {
    width: '80px',
    height: '120px',
    fontSize: '10px',
  } : {
    width: '140px',
    height: '200px',
    fontSize: '12px',
  };

  return (
    <div
      onClick={onClick}
      style={{
        width: size.width,
        height: size.height,
        background: collected 
          ? 'linear-gradient(135deg, rgba(20, 20, 40, 0.9), rgba(40, 40, 80, 0.9))'
          : 'linear-gradient(135deg, rgba(40, 40, 40, 0.5), rgba(60, 60, 60, 0.5))',
        border: selected 
          ? '3px solid #00ffff' 
          : `${card.rarity === 'legendary' ? '3px' : card.rarity === 'epic' ? '3px' : '2px'} solid ${getRarityColor(card.rarity)}`,
        borderRadius: '8px',
        padding: '10px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s',
        transform: selected ? 'scale(1.05)' : 'scale(1)',
        boxShadow: selected 
          ? '0 0 20px rgba(0, 255, 255, 0.6)' 
          : collected 
            ? `0 0 10px ${getRarityColor(card.rarity)}40`
            : 'none',
        opacity: collected ? 1 : 0.5,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
      onMouseEnter={onClick ? (e) => {
        e.currentTarget.style.transform = 'scale(1.08)';
      } : undefined}
      onMouseLeave={onClick ? (e) => {
        e.currentTarget.style.transform = selected ? 'scale(1.05)' : 'scale(1)';
      } : undefined}
    >
      {/* 稀有度标识 */}
      <div style={{
        position: 'absolute',
        top: '5px',
        right: '5px',
        fontSize: '8px',
        color: getRarityColor(card.rarity),
        textTransform: 'uppercase',
        letterSpacing: '1px',
      }}>
        {card.rarity}
      </div>

      {/* 卡牌类型标识 */}
      <div style={{
        position: 'absolute',
        top: '5px',
        left: '5px',
        fontSize: '8px',
        color: card.type === 'special' ? '#ff00ff' : '#00ffff',
      }}>
        {card.type === 'special' ? '⚡' : '🎮'}
      </div>

      {/* 卡牌名称 */}
      <div style={{
        fontSize: small ? '12px' : '16px',
        fontWeight: 'bold',
        color: collected ? '#fff' : '#666',
        textAlign: 'center',
        marginTop: '15px',
        textShadow: collected ? '0 0 5px rgba(255,255,255,0.5)' : 'none',
      }}>
        {card.name}
      </div>

      {/* 卡牌图标/类型 - 使用方块形状 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${getShapeSize(card.id)}, ${small ? '8px' : '12px'})`,
        gap: '2px',
        margin: '10px 0',
        filter: collected ? 'none' : 'grayscale(100%)',
      }}>
        {getShapeBlocks(card.id, card.type === 'special' ? getRarityColor(card.rarity) : getBlockColor(card.id)).map((color, index) => (
          <div
            key={index}
            style={{
              width: small ? '8px' : '12px',
              height: small ? '8px' : '12px',
              background: color,
              borderRadius: '1px',
              boxShadow: `inset 1px 1px 2px rgba(255,255,255,0.3), inset -1px -1px 2px rgba(0,0,0,0.3)`,
            }}
          />
        ))}
      </div>

      {/* 卡牌描述 */}
      <div style={{
        fontSize: size.fontSize,
        color: collected ? '#aaa' : '#444',
        textAlign: 'center',
        lineHeight: '1.4',
        padding: '0 5px',
      }}>
        {card.desc}
      </div>

      {/* 未收集遮罩 */}
      {!collected && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          color: '#666',
        }}>
          🔒
        </div>
      )}
    </div>
  );
};

export default Card;
