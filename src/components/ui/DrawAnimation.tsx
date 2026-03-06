import React, { useEffect, useState, useCallback } from 'react';
import './DeckUI.css';

interface Block {
  id: string;
  name: string;
  shape: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
}

interface DrawAnimationProps {
  block: Block | null;
  isVisible: boolean;
  onAnimationComplete?: () => void;
  autoHide?: boolean;
  hideDelay?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  tx: string;
  ty: string;
  color: string;
}

/**
 * 抽卡动画组件
 * 功能：
 * - 旋转缩放动画
 * - 稀有度光效
 * - 粒子效果
 */
export const DrawAnimation: React.FC<DrawAnimationProps> = ({
  block,
  isVisible,
  onAnimationComplete,
  autoHide = true,
  hideDelay = 2000,
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [animationStage, setAnimationStage] = useState<'hidden' | 'drawing' | 'revealed'>('hidden');

  // 获取稀有度颜色
  const getRarityColor = (rarity: string): string => {
    const colors: Record<string, string> = {
      common: 'var(--rarity-common)',
      rare: 'var(--rarity-rare)',
      epic: 'var(--rarity-epic)',
      legendary: 'var(--rarity-legendary)',
      mythic: 'var(--rarity-mythic)',
    };
    return colors[rarity] || 'var(--text-primary)';
  };

  // 获取稀有度显示文本
  const getRarityLabel = (rarity: string): string => {
    const labels: Record<string, string> = {
      common: '普通',
      rare: '稀有',
      epic: '史诗',
      legendary: '传说',
      mythic: '神话',
    };
    return labels[rarity] || rarity;
  };

  // 生成粒子效果
  const generateParticles = useCallback((count: number, color: string): Particle[] => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * 360 * Math.PI) / 180;
      const distance = 100 + Math.random() * 150;
      newParticles.push({
        id: Date.now() + i,
        x: 0,
        y: 0,
        tx: `${Math.cos(angle) * distance}px`,
        ty: `${Math.sin(angle) * distance}px`,
        color,
      });
    }
    return newParticles;
  }, []);

  // 动画开始
  useEffect(() => {
    if (isVisible && block) {
      setAnimationStage('drawing');
      
      // 生成粒子
      const color = getRarityColor(block.rarity);
      const newParticles = generateParticles(
        block.rarity === 'mythic' ? 50 : 
        block.rarity === 'legendary' ? 40 :
        block.rarity === 'epic' ? 30 :
        block.rarity === 'rare' ? 20 : 10,
        color
      );
      setParticles(newParticles);

      // 动画完成后进入揭示阶段
      const revealTimer = setTimeout(() => {
        setAnimationStage('revealed');
        
        // 自动隐藏
        if (autoHide) {
          const hideTimer = setTimeout(() => {
            onAnimationComplete?.();
          }, hideDelay);
          return () => clearTimeout(hideTimer);
        }
      }, 1500);

      return () => clearTimeout(revealTimer);
    } else {
      setAnimationStage('hidden');
      setParticles([]);
    }
  }, [isVisible, block, autoHide, hideDelay, onAnimationComplete, generateParticles]);

  if (!isVisible || !block) {
    return null;
  }

  const rarityColor = getRarityColor(block.rarity);

  return (
    <div className="draw-animation-container">
      {/* 粒子效果层 */}
      <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `calc(50% + ${particle.x}px)`,
              top: `calc(50% + ${particle.y}px)`,
              backgroundColor: particle.color,
              '--tx': particle.tx,
              '--ty': particle.ty,
              boxShadow: `0 0 10px ${particle.color}`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* 抽卡卡片 */}
      <div
        className={`draw-card ${block.rarity}`}
        style={{
          animation: animationStage === 'drawing' ? 'cardDraw 1.5s ease-out forwards' : 'none',
        }}
      >
        {/* 稀有度光晕背景 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '16px',
            background: `radial-gradient(circle, ${rarityColor}22 0%, transparent 70%)`,
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />

        {/* 方块形状 */}
        <div
          className="draw-card-shape"
          style={{
            color: rarityColor,
            textShadow: `0 0 20px ${rarityColor}, 0 0 40px ${rarityColor}`,
            zIndex: 1,
          }}
        >
          {block.shape}
        </div>

        {/* 方块名称 */}
        <div className="draw-card-name" style={{ zIndex: 1 }}>
          {block.name}
        </div>

        {/* 稀有度标识 */}
        <div
          className="draw-card-rarity"
          style={{
            color: rarityColor,
            textShadow: `0 0 10px ${rarityColor}`,
            zIndex: 1,
          }}
        >
          ★ {getRarityLabel(block.rarity)}
        </div>

        {/* 稀有度边框动画 */}
        <div
          style={{
            position: 'absolute',
            top: '-3px',
            left: '-3px',
            right: '-3px',
            bottom: '-3px',
            borderRadius: '16px',
            border: `3px solid ${rarityColor}`,
            animation: 'borderRotate 3s linear infinite',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* 点击任意位置跳过动画 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          cursor: 'pointer',
        }}
        onClick={() => onAnimationComplete?.()}
      />

      {/* 额外动画关键帧 */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }

        @keyframes borderRotate {
          0% {
            box-shadow: 
              0 0 20px ${rarityColor},
              inset 0 0 20px ${rarityColor};
          }
          50% {
            box-shadow: 
              0 0 40px ${rarityColor},
              inset 0 0 40px ${rarityColor};
          }
          100% {
            box-shadow: 
              0 0 20px ${rarityColor},
              inset 0 0 20px ${rarityColor};
          }
        }
      `}</style>
    </div>
  );
};

export default DrawAnimation;
