// ==================== 卡组系统类型定义 ====================

/**
 * 卡组接口
 * 表示玩家自定义的方块卡组
 */
export interface Deck {
  /** 卡组唯一标识符 */
  id: string;
  /** 卡组名称 */
  name: string;
  /** 卡组描述（可选） */
  description?: string;
  /** 方块 ID 列表 */
  cards: string[];
  /** 创建时间戳 */
  createdAt: number;
  /** 最后更新时间戳 */
  updatedAt: number;
  /** 是否为模板（可选） */
  isTemplate?: boolean;
  /** 标签列表（可选） */
  tags?: string[];
}

/**
 * 卡组配置接口
 * 定义卡组的规则限制和稀有度权重
 */
export interface DeckConfig {
  /** 最小组牌数 */
  minDeckSize: number;
  /** 最大组牌数 */
  maxDeckSize: number;
  /** 稀有度权重配置 */
  rarityWeights: {
    /** 普通 */
    common: number;
    /** 罕见 */
    uncommon: number;
    /** 稀有 */
    rare: number;
    /** 史诗 */
    epic: number;
    /** 传说 */
    legendary: number;
  };
}

/**
 * 卡组验证结果接口
 */
export interface DeckValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误信息列表 */
  errors: string[];
}

/**
 * 默认卡组配置
 */
export const DEFAULT_DECK_CONFIG: DeckConfig = {
  minDeckSize: 3,
  maxDeckSize: 7,  // 匹配现有 7 种基础方块
  rarityWeights: {
    common: 50,
    uncommon: 30,
    rare: 15,
    epic: 4,
    legendary: 1,
  },
};

/**
 * 预设卡组接口
 */
export interface PresetDeck {
  /** 预设卡组 ID */
  id: string;
  /** 预设卡组名称 */
  name: string;
  /** 预设卡组描述 */
  description: string;
  /** 方块 ID 列表 */
  cards: string[];
}

/**
 * 卡组卡牌配置（支持数量）
 */
export interface DeckCard {
  /** 卡牌 ID */
  cardId: string;
  /** 卡牌数量（默认 1） */
  count: number;
}

/**
 * 抽卡结果
 */
export interface DrawResult {
  /** 是否成功 */
  success: boolean;
  /** 抽到的卡牌 */
  card: { id: string } | null;
  /** 提示信息 */
  message?: string;
  /** 是否刚重新填充（洗牌） */
  wasRefilled: boolean;
}
