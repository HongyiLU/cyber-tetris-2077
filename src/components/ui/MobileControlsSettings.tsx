// ==================== 移动端控制设置面板 ====================

import React, { useState, useEffect } from 'react';
import { loadMobileSettings, saveMobileSettings, type MobileSettings } from './MobileControls';

interface MobileControlsSettingsProps {
  onClose?: () => void;
  onSettingsChange?: (settings: MobileSettings) => void;
}

const MobileControlsSettings: React.FC<MobileControlsSettingsProps> = ({
  onClose,
  onSettingsChange,
}) => {
  const [settings, setSettings] = useState<MobileSettings>(() => loadMobileSettings());

  const updateSetting = <K extends keyof MobileSettings>(
    key: K,
    value: MobileSettings[K]
  ) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveMobileSettings({ [key]: value });
    onSettingsChange?.(updated);
    
    // 触发自定义事件通知其他组件
    const event = new CustomEvent('mobileControlsSettingsUpdate', { detail: { [key]: value } });
    window.dispatchEvent(event);
  };

  const handleReset = () => {
    const defaultSettings: MobileSettings = {
      layout: 'portrait',
      opacity: 0.9,
      showTouchArea: true,
      hapticFeedback: true,
      controlsSize: 'medium',
    };
    setSettings(defaultSettings);
    saveMobileSettings(defaultSettings);
    onSettingsChange?.(defaultSettings);
  };

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.95)',
      border: '2px solid rgba(0, 255, 255, 0.3)',
      borderRadius: '12px',
      padding: '20px',
      maxWidth: '400px',
      margin: '0 auto',
      color: '#00ffff',
      fontFamily: 'Orbitron, monospace',
    }}>
      <h2 style={{
        margin: '0 0 20px 0',
        fontSize: '20px',
        textAlign: 'center',
        color: '#00ffff',
        textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
      }}>
        📱 虚拟按键设置
      </h2>

      {/* 布局模式 */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
          布局模式
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          {(['portrait', 'landscape', 'floating'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => updateSetting('layout', mode)}
              style={{
                flex: 1,
                padding: '10px',
                background: settings.layout === mode 
                  ? 'rgba(0, 255, 255, 0.3)' 
                  : 'rgba(0, 255, 255, 0.1)',
                border: `2px solid ${settings.layout === mode ? '#00ffff' : 'rgba(0, 255, 255, 0.3)'}`,
                borderRadius: '8px',
                color: '#00ffff',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'all 0.2s',
              }}
            >
              {mode === 'portrait' && '📱 竖屏'}
              {mode === 'landscape' && '📐 横屏'}
              {mode === 'floating' && '🎈 浮动'}
            </button>
          ))}
        </div>
      </div>

      {/* 按键尺寸 */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
          按键尺寸
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          {(['small', 'medium', 'large'] as const).map((size) => (
            <button
              key={size}
              onClick={() => updateSetting('controlsSize', size)}
              style={{
                flex: 1,
                padding: '10px',
                background: settings.controlsSize === size 
                  ? 'rgba(0, 255, 128, 0.3)' 
                  : 'rgba(0, 255, 128, 0.1)',
                border: `2px solid ${settings.controlsSize === size ? '#00ff80' : 'rgba(0, 255, 128, 0.3)'}`,
                borderRadius: '8px',
                color: '#00ff80',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'all 0.2s',
              }}
            >
              {size === 'small' && '小'}
              {size === 'medium' && '中'}
              {size === 'large' && '大'}
            </button>
          ))}
        </div>
      </div>

      {/* 透明度 */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
          透明度：{Math.round(settings.opacity * 100)}%
        </label>
        <input
          type="range"
          min="0.5"
          max="1"
          step="0.05"
          value={settings.opacity}
          onChange={(e) => updateSetting('opacity', parseFloat(e.target.value))}
          style={{
            width: '100%',
            cursor: 'pointer',
          }}
        />
      </div>

      {/* 触摸控制区 */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}>
          <span style={{ fontSize: '14px' }}>显示触摸控制区</span>
          <div style={{
            width: '50px',
            height: '26px',
            background: settings.showTouchArea ? 'rgba(0, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.2)',
            borderRadius: '13px',
            position: 'relative',
            transition: 'background 0.2s',
          }}>
            <div style={{
              width: '22px',
              height: '22px',
              background: '#00ffff',
              borderRadius: '50%',
              position: 'absolute',
              top: '2px',
              left: settings.showTouchArea ? '26px' : '2px',
              transition: 'left 0.2s',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            }} />
          </div>
          <input
            type="checkbox"
            checked={settings.showTouchArea}
            onChange={(e) => updateSetting('showTouchArea', e.target.checked)}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {/* 触觉反馈 */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}>
          <span style={{ fontSize: '14px' }}>触觉反馈 (震动)</span>
          <div style={{
            width: '50px',
            height: '26px',
            background: settings.hapticFeedback ? 'rgba(255, 166, 0, 0.5)' : 'rgba(255, 255, 255, 0.2)',
            borderRadius: '13px',
            position: 'relative',
            transition: 'background 0.2s',
          }}>
            <div style={{
              width: '22px',
              height: '22px',
              background: '#ffa600',
              borderRadius: '50%',
              position: 'absolute',
              top: '2px',
              left: settings.hapticFeedback ? '26px' : '2px',
              transition: 'left 0.2s',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            }} />
          </div>
          <input
            type="checkbox"
            checked={settings.hapticFeedback}
            onChange={(e) => updateSetting('hapticFeedback', e.target.checked)}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {/* 重置按钮 */}
      <button
        onClick={handleReset}
        style={{
          width: '100%',
          padding: '12px',
          background: 'rgba(255, 0, 64, 0.2)',
          border: '2px solid #ff0040',
          borderRadius: '8px',
          color: '#ff0040',
          cursor: 'pointer',
          fontSize: '14px',
          fontFamily: 'Orbitron, monospace',
          marginBottom: '10px',
          transition: 'all 0.2s',
        }}
      >
        🔄 恢复默认设置
      </button>

      {/* 关闭按钮 */}
      {onClose && (
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px',
            background: 'rgba(0, 255, 255, 0.2)',
            border: '2px solid #00ffff',
            borderRadius: '8px',
            color: '#00ffff',
            cursor: 'pointer',
            fontSize: '14px',
            fontFamily: 'Orbitron, monospace',
            transition: 'all 0.2s',
          }}
        >
          ✓ 完成
        </button>
      )}
    </div>
  );
};

export default MobileControlsSettings;
