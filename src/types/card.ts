// ==================== 卡牌类型定义 ====================
// v1.9.14 - 卡牌稀有度系统

/**
 * 稀有度枚举
 */
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

/**
 * 稀有度配置
 */
export interface RarityConfig {
  /** 稀有度 ID */
  id: Rarity;
  /** 显示名称 */
  name: string;
  /** 颜色（十六进制） */
  color: string;
  /** 边框颜色 */
  borderColor: string;
  /** 光晕颜色 */
  glowColor: string;
  /** 背景渐变 */
  background: string;
  /** 图标 */
  icon: string;
}

/**
 * 卡牌接口
 */
export interface Card {
  /** 方块类型 (I, O, T, S, Z, L, J) */
  pieceType: string;
  /** 卡名 */
  name: string;
  /** 效果描述 */
  description: string;
  /** 稀有度 */
  rarity: Rarity;
  /** 方块颜色 */
  color: string;
}

/**
 * 卡牌属性（用于组件 props）
 */
export interface CardProps {
  /** 卡牌数据 */
  card: Card;
  /** 卡牌尺寸 */
  size?: 'small' | 'medium' | 'large';
  /** 是否显示边框 */
  showBorder?: boolean;
  /** 是否显示阴影 */
  showShadow?: boolean;
  /** 是否可点击 */
  clickable?: boolean;
  /** 点击回调 */
  onClick?: () => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * 稀有度配置表
 */
export const RARITY_CONFIG: Record<Rarity, RarityConfig> = {
  common: {
    id: 'common',
    name: '普通',
    color: '#ffffff',
    borderColor: '#e5e5e5',
    glowColor: 'rgba(255, 255, 255, 0.3)',
    background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
    icon: '⚪',
  },
  uncommon: {
    id: 'uncommon',
    name: '罕见',
    color: '#00ff00',
    borderColor: '#00cc00',
    glowColor: 'rgba(0, 255, 0, 0.4)',
    background: 'linear-gradient(135deg, #00ff0015 0%, #00cc0025 100%)',
    icon: '🟢',
  },
  rare: {
    id: 'rare',
    name: '稀有',
    color: '#0088ff',
    borderColor: '#0066cc',
    glowColor: 'rgba(0, 136, 255, 0.5)',
    background: 'linear-gradient(135deg, #0088ff15 0%, #0066cc25 100%)',
    icon: '🔵',
  },
  epic: {
    id: 'epic',
    name: '史诗',
    color: '#a855f7',
    borderColor: '#7e22ce',
    glowColor: 'rgba(168, 85, 247, 0.6)',
    background: 'linear-gradient(135deg, #a855f715 0%, #7e22ce25 100%)',
    icon: '🟣',
  },
  legendary: {
    id: 'legendary',
    name: '传说',
    color: '#ff8800',
    borderColor: '#cc6600',
    glowColor: 'rgba(255, 136, 0, 0.7)',
    background: 'linear-gradient(135deg, #ff880015 0%, #cc660025 100%)',
    icon: '🟠',
  },
};

/**
 * 获取稀有度配置
 * @param rarity 稀有度
 * @returns 稀有度配置
 */
export function getRarityConfig(rarity: Rarity): RarityConfig {
  return RARITY_CONFIG[rarity];
}

/**
 * 获取稀有度类名
 * @param rarity 稀有度
 * @returns CSS 类名
 */
export function getRarityClassName(rarity: Rarity): string {
  return `card-rarity-${rarity}`;
}
