// ==================== 移动端控制设置面板 ====================

import React, { useState, useEffect, useCallback } from 'react';

export interface MobileControlsSettings {
  enabled: boolean;
  size: 'small' | 'medium' | 'large';
  opacity: number;
}

const STORAGE_KEY = 'mobileControlsSettings';

const defaultSettings: MobileControlsSettings = {
  enabled: true,
  size: 'medium',
  opacity: 0.9,
};

interface MobileControlsSettingsPanelProps {
  onClose: () => void;
  onSettingsChange?: (settings: MobileControlsSettings) => void;
}

const MobileControlsSettingsPanel: React.FC<MobileControlsSettingsPanelProps> = ({
  onClose,
  onSettingsChange,
}) => {
  const [settings, setSettings] = useState<MobileControlsSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load mobile controls settings:', e);
    }
    return defaultSettings;
  });

  // 保存设置到 localStorage
  const saveSettings = useCallback((newSettings: MobileControlsSettings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      onSettingsChange?.(newSettings);
    } catch (e) {
      console.warn('Failed to save mobile controls settings:', e);
    }
  }, [onSettingsChange]);

  // 更新设置
  const updateSetting = useCallback(<K extends keyof MobileControlsSettings>(
    key: K,
    value: MobileControlsSettings[K]
  ) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      saveSettings(updated);
      return updated;
    });
  }, [saveSettings]);

  // 切换启用状态
  const handleToggleEnabled = useCallback(() => {
    updateSetting('enabled', !settings.enabled);
  }, [settings.enabled, updateSetting]);

  // 更新尺寸
  const handleSizeChange = useCallback((size: 'small' | 'medium' | 'large') => {
    updateSetting('size', size);
  }, [updateSetting]);

  // 更新透明度
  const handleOpacityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value) / 100;
    updateSetting('opacity', value);
  }, [updateSetting]);

  // 重置为默认值
  const handleReset = useCallback(() => {
    setSettings(defaultSettings);
    saveSettings(defaultSettings);
  }, [saveSettings]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📱 虚拟按键设置</h2>

      {/* 开关 */}
      <div style={styles.section}>
        <div style={styles.row}>
          <span style={styles.label}>启用虚拟按键</span>
          <button
            onClick={handleToggleEnabled}
            style={{
              ...styles.toggleButton,
              background: settings.enabled ? 'rgba(46, 204, 113, 0.3)' : 'rgba(255, 68, 68, 0.3)',
              borderColor: settings.enabled ? '#2ecc71' : '#ff4444',
              color: settings.enabled ? '#2ecc71' : '#ff4444',
            }}
          >
            {settings.enabled ? '已启用' : '已禁用'}
          </button>
        </div>
        <p style={styles.hint}>
          {settings.enabled 
            ? '游戏中将显示虚拟按键' 
            : '仅使用触摸手势控制'}
        </p>
      </div>

      {/* 尺寸选择 */}
      <div style={styles.section}>
        <label style={styles.label}>按键尺寸</label>
        <div style={styles.buttonGroup}>
          {(['small', 'medium', 'large'] as const).map(size => (
            <button
              key={size}
              onClick={() => handleSizeChange(size)}
              style={{
                ...styles.sizeButton,
                background: settings.size === size ? 'rgba(0, 255, 255, 0.3)' : 'rgba(0, 255, 255, 0.1)',
                borderColor: settings.size === size ? '#00ffff' : 'rgba(0, 255, 255, 0.3)',
                color: settings.size === size ? '#00ffff' : '#888',
              }}
            >
              {size === 'small' && '小'}
              {size === 'medium' && '中'}
              {size === 'large' && '大'}
            </button>
          ))}
        </div>
        <p style={styles.hint}>
          {settings.size === 'small' && '小尺寸 (40px) - 适合小屏幕'}
          {settings.size === 'medium' && '中尺寸 (50px) - 默认推荐'}
          {settings.size === 'large' && '大尺寸 (60px) - 适合大屏幕'}
        </p>
      </div>

      {/* 透明度滑块 */}
      <div style={styles.section}>
        <label style={styles.label}>
          透明度：{Math.round(settings.opacity * 100)}%
        </label>
        <input
          type="range"
          min="50"
          max="100"
          value={settings.opacity * 100}
          onChange={handleOpacityChange}
          style={styles.slider}
        />
        <div style={styles.opacityPreview}>
          <div style={{
            ...styles.previewBox,
            opacity: settings.opacity,
          }}>
            预览
          </div>
        </div>
        <p style={styles.hint}>
          调节虚拟按键的透明度（50%-100%）
        </p>
      </div>

      {/* 重置按钮 */}
      <div style={styles.section}>
        <button
          onClick={handleReset}
          style={styles.resetButton}
        >
          🔄 重置为默认值
        </button>
      </div>

      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        style={styles.closeButton}
      >
        关闭
      </button>
    </div>
  );
};

// 样式
const styles: Record<string, React.CSSProperties> = {
  container: {
    background: 'rgba(0, 20, 40, 0.95)',
    border: '2px solid #00ffff',
    borderRadius: '16px',
    padding: '25px',
    boxShadow: '0 0 40px rgba(0, 255, 255, 0.3)',
  },
  title: {
    fontSize: '20px',
    color: '#00ffff',
    fontFamily: 'Orbitron, monospace',
    marginBottom: '20px',
    textAlign: 'center',
    textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
  },
  section: {
    marginBottom: '20px',
    padding: '15px',
    background: 'rgba(0, 255, 255, 0.05)',
    borderRadius: '8px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  label: {
    display: 'block',
    color: '#fff',
    fontFamily: 'Orbitron, monospace',
    fontSize: '14px',
    marginBottom: '10px',
  },
  hint: {
    color: '#888',
    fontSize: '12px',
    fontFamily: 'Orbitron, monospace',
    marginTop: '8px',
    lineHeight: '1.5',
  },
  toggleButton: {
    padding: '8px 20px',
    fontSize: '14px',
    border: '2px solid',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'Orbitron, monospace',
    transition: 'all 0.3s',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
  },
  sizeButton: {
    flex: 1,
    padding: '10px',
    fontSize: '14px',
    border: '2px solid',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'Orbitron, monospace',
    transition: 'all 0.3s',
  },
  slider: {
    width: '100%',
    height: '8px',
    borderRadius: '4px',
    background: 'rgba(0, 255, 255, 0.2)',
    outline: 'none',
    cursor: 'pointer',
    WebkitAppearance: 'none',
  },
  opacityPreview: {
    marginTop: '15px',
    display: 'flex',
    justifyContent: 'center',
  },
  previewBox: {
    padding: '15px 30px',
    background: 'rgba(0, 255, 255, 0.2)',
    border: '2px solid #00ffff',
    borderRadius: '8px',
    color: '#00ffff',
    fontFamily: 'Orbitron, monospace',
    fontSize: '14px',
  },
  resetButton: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    background: 'rgba(255, 166, 0, 0.2)',
    border: '2px solid #ffa600',
    borderRadius: '8px',
    color: '#ffa600',
    cursor: 'pointer',
    fontFamily: 'Orbitron, monospace',
    transition: 'all 0.3s',
  },
  closeButton: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    background: 'rgba(0, 255, 255, 0.2)',
    border: '2px solid #00ffff',
    borderRadius: '8px',
    color: '#00ffff',
    cursor: 'pointer',
    fontFamily: 'Orbitron, monospace',
    boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
    transition: 'all 0.3s',
  },
};

// 工具函数：加载设置
export const loadMobileControlsSettings = (): MobileControlsSettings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to load mobile controls settings:', e);
  }
  return defaultSettings;
};

// 工具函数：保存设置
export const saveMobileControlsSettings = (settings: MobileControlsSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save mobile controls settings:', e);
  }
};

export default MobileControlsSettingsPanel;
