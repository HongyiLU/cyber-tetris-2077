// ==================== 粒子画布组件 ====================

import React, { useEffect, useRef, useCallback } from 'react';
import { ParticleEffect } from '../../system/ParticleEffect';
import './ParticleCanvas.css';

interface ParticleCanvasProps {
  /** 画布宽度 */
  width?: number;
  /** 画布高度 */
  height?: number;
  /** 是否可见 */
  visible?: boolean;
  /** 获取粒子系统实例的回调 */
  onGetParticleSystem?: (system: ParticleEffect) => void;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * 粒子画布组件
 * 覆盖在游戏棋盘上方的透明 Canvas 层
 * 用于渲染粒子爆炸特效
 * 
 * 性能优化：
 * - 使用 requestAnimationFrame 渲染
 * - 透明背景
 * - 高性能渲染（60fps）
 * - 无粒子时自动停止渲染
 */
export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({
  width = 300,
  height = 600,
  visible = true,
  onGetParticleSystem,
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleSystemRef = useRef<ParticleEffect | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // 初始化粒子系统
  useEffect(() => {
    particleSystemRef.current = new ParticleEffect(500);
    
    // 暴露给父组件
    if (onGetParticleSystem && particleSystemRef.current) {
      onGetParticleSystem(particleSystemRef.current);
    }

    return () => {
      // 清理
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (particleSystemRef.current) {
        particleSystemRef.current.clear();
      }
    };
  }, [onGetParticleSystem]);

  // 渲染循环
  const render = useCallback((timestamp: number) => {
    if (!canvasRef.current || !particleSystemRef.current) return;

    // 计算时间增量
    const deltaTime = lastTimeRef.current ? timestamp - lastTimeRef.current : 16;
    lastTimeRef.current = timestamp;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 更新和渲染粒子
    particleSystemRef.current.update(deltaTime);
    particleSystemRef.current.draw(ctx);

    // 如果还有活跃粒子，继续渲染
    if (particleSystemRef.current.hasActiveParticles()) {
      animationFrameRef.current = requestAnimationFrame(render);
    } else {
      animationFrameRef.current = null;
    }
  }, []);

  /**
   * 在指定位置生成粒子效果
   * @param x X 坐标
   * @param y Y 坐标
   * @param color 颜色
   * @param lines 消除行数（决定效果强度）
   */
  const spawnEffect = useCallback((x: number, y: number, color: string, lines: number) => {
    if (!particleSystemRef.current) return;

    particleSystemRef.current.spawnForLines(x, y, color, lines);

    // 如果当前没有在渲染，启动渲染循环
    if (animationFrameRef.current === null) {
      lastTimeRef.current = 0;
      animationFrameRef.current = requestAnimationFrame(render);
    }
  }, [render]);

  // 暴露 spawnEffect 方法到全局（供 GameEngine 调用）
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 将 spawnEffect 挂载到 canvas 元素上
    (canvas as any).spawnEffect = spawnEffect;
    (canvas as any).getParticleSystem = () => particleSystemRef.current;

    return () => {
      delete (canvas as any).spawnEffect;
      delete (canvas as any).getParticleSystem;
    };
  }, [spawnEffect]);

  if (!visible) return null;

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="particle-canvas"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        ...style,
      }}
    />
  );
};

export default ParticleCanvas;
