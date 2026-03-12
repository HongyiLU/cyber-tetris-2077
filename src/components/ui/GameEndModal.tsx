// ==================== 游戏结束弹窗组件 ====================

import React from 'react';

interface GameEndModalProps {
  /** 是否可见 */
  visible: boolean;
  /** 游戏得分 */
  score: number;
  /** 消除行数 */
  lines: number;
  /** 连击数 */
  combo?: number;
  /** 最大连击 */
  maxCombo?: number;
  /** 重新挑战回调 */
  onRestart: () => void;
  /** 返回标题页回调 */
  onBackToTitle: () => void;
  /** 战斗胜利状态 */
  isVictory?: boolean;
}

const GameEndModal: React.FC<GameEndModalProps> = ({
  visible,
  score,
  lines,
  combo = 0,
  maxCombo = 0,
  onRestart,
  onBackToTitle,
  isVictory = false,
}) => {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'modalFadeIn 0.4s ease-out',
      }}
    >
      <div
        style={{
          position: 'relative',
          background: 'rgba(0, 20, 40, 0.95)',
          border: '3px solid var(--neon-cyan, #00ffff)',
          borderRadius: '20px',
          padding: '40px',
          width: '100%',
          maxWidth: '500px',
          boxShadow: '0 0 60px rgba(0, 255, 255, 0.4), inset 0 0 40px rgba(0, 255, 255, 0.1)',
          animation: 'modalSlideIn 0.5s ease-out',
        }}
      >
        {/* 标题 */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '30px',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(28px, 8vw, 42px)',
              fontFamily: 'Orbitron, monospace',
              fontWeight: 'bold',
              color: isVictory ? '#f39c12' : '#ff4444',
              textShadow: isVictory
                ? '0 0 20px rgba(243, 156, 18, 0.8), 0 0 40px rgba(243, 156, 18, 0.5)'
                : '0 0 20px rgba(255, 68, 68, 0.8), 0 0 40px rgba(255, 68, 68, 0.5)',
              margin: '0 0 10px 0',
              letterSpacing: '3px',
            }}
          >
            {isVictory ? '🎉 战斗胜利!' : '💀 游戏结束'}
          </h2>
          <p
            style={{
              fontSize: 'clamp(14px, 4vw, 16px)',
              color: 'rgba(255, 255, 255, 0.7)',
              fontFamily: 'Orbitron, monospace',
              margin: 0,
            }}
          >
            {isVictory ? '恭喜击败敌人!' : '再接再厉，下次一定行!'}
          </p>
        </div>

        {/* 统计信息 */}
        <div
          style={{
            background: 'rgba(0, 255, 255, 0.05)',
            border: '2px solid rgba(0, 255, 255, 0.3)',
            borderRadius: '12px',
            padding: '25px',
            marginBottom: '30px',
          }}
        >
          {/* 得分 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px',
              paddingBottom: '15px',
              borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
            }}
          >
            <span
              style={{
                fontSize: 'clamp(16px, 4vw, 18px)',
                color: '#fff',
                fontFamily: 'Orbitron, monospace',
              }}
            >
              🎯 得分
            </span>
            <span
              style={{
                fontSize: 'clamp(24px, 6vw, 32px)',
                color: 'var(--neon-cyan, #00ffff)',
                fontFamily: 'Orbitron, monospace',
                fontWeight: 'bold',
                textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
              }}
            >
              {score.toLocaleString()}
            </span>
          </div>

          {/* 消除行数 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px',
              paddingBottom: '15px',
              borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
            }}
          >
            <span
              style={{
                fontSize: 'clamp(16px, 4vw, 18px)',
                color: '#fff',
                fontFamily: 'Orbitron, monospace',
              }}
            >
              📊 消除行数
            </span>
            <span
              style={{
                fontSize: 'clamp(20px, 5vw, 24px)',
                color: '#2ecc71',
                fontFamily: 'Orbitron, monospace',
                fontWeight: 'bold',
                textShadow: '0 0 10px rgba(46, 204, 113, 0.5)',
              }}
            >
              {lines}
            </span>
          </div>

          {/* 连击信息 (如果有) */}
          {maxCombo > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 'clamp(16px, 4vw, 18px)',
                  color: '#fff',
                  fontFamily: 'Orbitron, monospace',
                }}
              >
                🔥 最大连击
              </span>
              <span
                style={{
                  fontSize: 'clamp(20px, 5vw, 24px)',
                  color: '#f39c12',
                  fontFamily: 'Orbitron, monospace',
                  fontWeight: 'bold',
                  textShadow: '0 0 10px rgba(243, 156, 18, 0.5)',
                }}
              >
                {maxCombo}x
              </span>
            </div>
          )}
        </div>

        {/* 按钮组 */}
        <div
          style={{
            display: 'flex',
            gap: '15px',
            flexDirection: 'column',
          }}
        >
          {/* 重新挑战按钮 */}
          <button
            onClick={onRestart}
            style={{
              padding: 'clamp(14px, 4vw, 18px)',
              fontSize: 'clamp(16px, 4vw, 20px)',
              background: 'rgba(0, 255, 255, 0.15)',
              border: '3px solid var(--neon-cyan, #00ffff)',
              borderRadius: '12px',
              color: 'var(--neon-cyan, #00ffff)',
              cursor: 'pointer',
              fontFamily: 'Orbitron, monospace',
              fontWeight: 'bold',
              boxShadow: '0 0 30px rgba(0, 255, 255, 0.4)',
              transition: 'all 0.3s',
              textShadow: '0 0 5px rgba(0, 255, 255, 0.5)',
              letterSpacing: '2px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 255, 255, 0.3)';
              e.currentTarget.style.boxShadow = '0 0 60px rgba(0, 255, 255, 0.8)';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 255, 255, 0.15)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 255, 255, 0.4)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            🔄 重新挑战
          </button>

          {/* 回到标题页按钮 */}
          <button
            onClick={onBackToTitle}
            style={{
              padding: 'clamp(14px, 4vw, 18px)',
              fontSize: 'clamp(16px, 4vw, 20px)',
              background: 'rgba(255, 68, 68, 0.15)',
              border: '3px solid #ff4444',
              borderRadius: '12px',
              color: '#ff4444',
              cursor: 'pointer',
              fontFamily: 'Orbitron, monospace',
              fontWeight: 'bold',
              boxShadow: '0 0 30px rgba(255, 68, 68, 0.4)',
              transition: 'all 0.3s',
              textShadow: '0 0 5px rgba(255, 68, 68, 0.5)',
              letterSpacing: '2px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 68, 68, 0.3)';
              e.currentTarget.style.boxShadow = '0 0 60px rgba(255, 68, 68, 0.8)';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 68, 68, 0.15)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 68, 68, 0.4)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            🏠 回到标题页
          </button>
        </div>

        {/* 赛博朋克风格装饰角标 */}
        <div
          style={{
            position: 'absolute',
            top: '-2px',
            left: '-2px',
            width: '30px',
            height: '30px',
            borderTop: '4px solid var(--neon-cyan, #00ffff)',
            borderLeft: '4px solid var(--neon-cyan, #00ffff)',
            borderRadius: '20px 0 0 0',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '30px',
            height: '30px',
            borderTop: '4px solid var(--neon-cyan, #00ffff)',
            borderRight: '4px solid var(--neon-cyan, #00ffff)',
            borderRadius: '0 20px 0 0',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-2px',
            left: '-2px',
            width: '30px',
            height: '30px',
            borderBottom: '4px solid var(--neon-cyan, #00ffff)',
            borderLeft: '4px solid var(--neon-cyan, #00ffff)',
            borderRadius: '0 0 0 20px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-2px',
            right: '-2px',
            width: '30px',
            height: '30px',
            borderBottom: '4px solid var(--neon-cyan, #00ffff)',
            borderRight: '4px solid var(--neon-cyan, #00ffff)',
            borderRadius: '0 0 20px 0',
          }}
        />
      </div>

      {/* CSS 动画定义 */}
      <style>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes modalSlideIn {
          from {
            transform: translateY(-50px) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default GameEndModal;
