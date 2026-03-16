// ==================== 游戏信息面板组件 ====================

import React, { useState, useEffect } from 'react';
import { GAME_CONFIG } from '../../config/game-config';
import type { GameState } from '../../types';

interface GameInfoProps {
  gameState: GameState | null;
}

const GameInfo: React.FC<GameInfoProps> = ({ gameState }) => {
  if (!gameState) return null;

  // 检测移动端 - 使用 useState + useEffect 避免 SSR hydration 不匹配
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 根据方块类型获取卡牌数据
  const getCardData = (pieceType: string) => {
    return GAME_CONFIG.CARDS.find(card => card.id === pieceType);
  };

  // 移动端紧凑布局
  if (isMobile) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '8px',
        width: '100%',
      }}>
        {/* 下一个方块 - 小尺寸 */}
        {gameState.nextPiece && (() => {
          const cardData = getCardData(gameState.nextPiece.type);
          const isSpecial = cardData?.type === 'special';
          
          return (
            <div style={{
              background: 'rgba(0, 0, 0, 0.6)',
              border: isSpecial ? '2px solid var(--neon-pink)' : '1px solid var(--neon-cyan)',
              borderRadius: '4px',
              padding: '8px',
              boxShadow: isSpecial ? '0 0 8px rgba(255, 105, 180, 0.4)' : '0 0 5px rgba(0, 255, 255, 0.2)',
              minWidth: '80px',
              maxWidth: '120px',
            }}>
              <div style={{ fontSize: '10px', color: 'var(--neon-cyan)', marginBottom: '5px', textAlign: 'center' }}>
                下一个
              </div>
              {/* 方块形状预览 */}
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: `repeat(${gameState.nextPiece.shape[0].length}, 15px)`,
                gap: '1px',
                justifyContent: 'center',
                marginBottom: isSpecial ? '5px' : '0',
              }}>
                {gameState.nextPiece.shape.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      style={{
                        width: '15px',
                        height: '15px',
                        background: cell ? gameState.nextPiece!.color : 'transparent',
                        borderRadius: '1px',
                      }}
                    />
                  ))
                )}
              </div>
              {/* 特殊方块显示名称和效果 */}
              {isSpecial && cardData && (
                <div style={{ fontSize: '9px', color: '#fff', textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', color: cardData.color, marginBottom: '2px' }}>
                    {cardData.name}
                  </div>
                  <div style={{ color: '#aaa', fontSize: '8px' }}>
                    {cardData.desc}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* 分数 */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.6)',
          border: '1px solid var(--neon-cyan)',
          borderRadius: '4px',
          padding: '8px 12px',
          boxShadow: '0 0 5px rgba(0, 255, 255, 0.2)',
          minWidth: '70px',
        }}>
          <div style={{ fontSize: '10px', color: 'var(--neon-cyan)', marginBottom: '3px' }}>
            分数
          </div>
          <div style={{ fontSize: '14px', color: 'var(--neon-yellow)', fontWeight: 'bold' }}>
            {gameState.score.toLocaleString()}
          </div>
        </div>

        {/* 消除行数 */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.6)',
          border: '1px solid var(--neon-cyan)',
          borderRadius: '4px',
          padding: '8px 12px',
          boxShadow: '0 0 5px rgba(0, 255, 255, 0.2)',
          minWidth: '50px',
        }}>
          <div style={{ fontSize: '10px', color: 'var(--neon-cyan)', marginBottom: '3px' }}>
            消除
          </div>
          <div style={{ fontSize: '14px', color: 'var(--neon-yellow)', fontWeight: 'bold' }}>
            {gameState.lines}
          </div>
        </div>

        {/* 等级 */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.6)',
          border: '1px solid var(--neon-cyan)',
          borderRadius: '4px',
          padding: '8px 12px',
          boxShadow: '0 0 5px rgba(0, 255, 255, 0.2)',
          minWidth: '40px',
        }}>
          <div style={{ fontSize: '10px', color: 'var(--neon-cyan)', marginBottom: '3px' }}>
            等级
          </div>
          <div style={{ fontSize: '14px', color: 'var(--neon-yellow)', fontWeight: 'bold' }}>
            {gameState.level}
          </div>
        </div>

        {/* 游戏结束/暂停提示 */}
        {gameState.gameOver && (
          <div style={{
            background: 'rgba(255, 0, 0, 0.2)',
            border: '2px solid var(--neon-pink)',
            borderRadius: '4px',
            padding: '8px',
            textAlign: 'center',
            width: '100%',
          }}>
            <div style={{ fontSize: '14px', color: 'var(--neon-pink)', fontWeight: 'bold' }}>
              游戏结束
            </div>
          </div>
        )}

        {gameState.paused && !gameState.gameOver && (
          <div style={{
            background: 'rgba(255, 255, 0, 0.2)',
            border: '2px solid var(--neon-yellow)',
            borderRadius: '4px',
            padding: '8px',
            textAlign: 'center',
            width: '100%',
          }}>
            <div style={{ fontSize: '14px', color: 'var(--neon-yellow)', fontWeight: 'bold' }}>
              已暂停
            </div>
          </div>
        )}
      </div>
    );
  }

  // 桌面端布局（保持不变）
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '20px',
      minWidth: '150px'
    }}>
      {/* 下一个方块 - SVG 预览 */}
      {gameState.nextPiece && (() => {
        const cardData = getCardData(gameState.nextPiece.type);
        const isSpecial = cardData?.type === 'special';
        
        return (
          <div style={{
            background: 'rgba(0, 0, 0, 0.6)',
            border: isSpecial ? '2px solid var(--neon-pink)' : '1px solid var(--neon-cyan)',
            borderRadius: '4px',
            padding: '15px',
            boxShadow: isSpecial ? '0 0 15px rgba(255, 105, 180, 0.4)' : '0 0 10px rgba(0, 255, 255, 0.3)',
          }}>
            <div style={{ fontSize: '12px', color: 'var(--neon-cyan)', marginBottom: '10px' }}>
              下一个
            </div>
            {/* 方块形状预览 */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: '60px'
            }}>
              <svg width="80" height="60" style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: '4px' }}>
                {gameState.nextPiece.shape.map((row, rowIndex) => (
                  row.map((cell, colIndex) => {
                    if (cell) {
                      const previewSize = 20;
                      return (
                        <rect
                          key={`${rowIndex}-${colIndex}`}
                          x={colIndex * previewSize + (80 - gameState.nextPiece!.shape[0].length * previewSize) / 2}
                          y={rowIndex * previewSize + (60 - gameState.nextPiece!.shape.length * previewSize) / 2}
                          width={previewSize - 2}
                          height={previewSize - 2}
                          fill={gameState.nextPiece!.color}
                          style={{
                            filter: `drop-shadow(0 0 3px ${gameState.nextPiece!.color})`,
                          }}
                        />
                      );
                    }
                    return null;
                  })
                ))}
              </svg>
            </div>
            {/* 特殊方块显示名称和效果 */}
            {isSpecial && cardData && (
              <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: cardData.color, marginBottom: '5px' }}>
                  {cardData.name}
                </div>
                <div style={{ fontSize: '11px', color: '#ccc' }}>
                  {cardData.desc}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      <div style={{
        background: 'rgba(0, 0, 0, 0.6)',
        border: '1px solid var(--neon-cyan)',
        borderRadius: '4px',
        padding: '15px',
        boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
      }}>
        <div style={{ fontSize: '12px', color: 'var(--neon-cyan)', marginBottom: '5px' }}>
          分数
        </div>
        <div style={{ fontSize: '24px', color: 'var(--neon-yellow)', fontWeight: 'bold' }}>
          {gameState.score.toLocaleString()}
        </div>
      </div>

      <div style={{
        background: 'rgba(0, 0, 0, 0.6)',
        border: '1px solid var(--neon-cyan)',
        borderRadius: '4px',
        padding: '15px',
        boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
      }}>
        <div style={{ fontSize: '12px', color: 'var(--neon-cyan)', marginBottom: '5px' }}>
          消除行数
        </div>
        <div style={{ fontSize: '24px', color: 'var(--neon-yellow)', fontWeight: 'bold' }}>
          {gameState.lines}
        </div>
      </div>

      <div style={{
        background: 'rgba(0, 0, 0, 0.6)',
        border: '1px solid var(--neon-cyan)',
        borderRadius: '4px',
        padding: '15px',
        boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
      }}>
        <div style={{ fontSize: '12px', color: 'var(--neon-cyan)', marginBottom: '5px' }}>
          等级
        </div>
        <div style={{ fontSize: '24px', color: 'var(--neon-yellow)', fontWeight: 'bold' }}>
          {gameState.level}
        </div>
      </div>

      {gameState.gameOver && (
        <div style={{
          background: 'rgba(255, 0, 0, 0.2)',
          border: '2px solid var(--neon-pink)',
          borderRadius: '4px',
          padding: '15px',
          textAlign: 'center',
          boxShadow: '0 0 20px rgba(255, 0, 255, 0.5)',
        }}>
          <div style={{ fontSize: '18px', color: 'var(--neon-pink)', fontWeight: 'bold' }}>
            游戏结束
          </div>
        </div>
      )}

      {gameState.paused && !gameState.gameOver && (
        <div style={{
          background: 'rgba(255, 255, 0, 0.2)',
          border: '2px solid var(--neon-yellow)',
          borderRadius: '4px',
          padding: '15px',
          textAlign: 'center',
          boxShadow: '0 0 20px rgba(255, 255, 0, 0.5)',
        }}>
          <div style={{ fontSize: '18px', color: 'var(--neon-yellow)', fontWeight: 'bold' }}>
            已暂停
          </div>
        </div>
      )}
    </div>
  );
};

export default GameInfo;
