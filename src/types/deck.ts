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
 * v1.9.9 优化：minDeckSize 仅用于使用验证，不用于创建/保存验证
 */
export const DEFAULT_DECK_CONFIG: DeckConfig = {
  minDeckSize: 7,  // v1.9.9: 至少 7 张卡牌才能使用（经典 7 种方块各 1 个）
  maxDeckSize: 21, // v1.9.9: 最大 21 张（7 种 × 3 张）
  rarityWeights: {
    common: 50,
    uncommon: 30,
    rare: 15,
    epic: 4,
    legendary: 1,
  },
};

/**
 * 卡组验证选项接口
 * v1.9.9 新增：支持不同场景下的验证模式
 */
export interface DeckValidationOptions {
  /** 是否验证最小组牌数（创建/保存时为 false，使用时为 true） */
  checkMinSize?: boolean;
}

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

// ==================== 卡组辅助函数（v1.9.9 新增） ====================

/**
 * 计算卡组方块数量
 * @param deck 卡组对象
 * @returns 方块数量
 */
export function getDeckBlockCount(deck: Deck): number {
  return deck.cards.length;
}

/**
 * 检查卡组是否有效（可用于游戏）
 * @param deck 卡组对象
 * @param minDeckSize 最小卡组大小（默认从配置获取）
 * @returns 是否有效
 */
export function isDeckValidForUse(deck: Deck, minDeckSize: number = DEFAULT_DECK_CONFIG.minDeckSize): boolean {
  return deck.cards.length >= minDeckSize;
}

/**
 * 获取卡组状态描述
 * @param deck 卡组对象
 * @returns 状态描述字符串
 */
export function getDeckStatusText(deck: Deck): string {
  const count = deck.cards.length;
  if (count >= DEFAULT_DECK_CONFIG.minDeckSize) {
    return `✅ 可用（${count}张）`;
  } else {
    return `⚠️ 不可用（${count}/${DEFAULT_DECK_CONFIG.minDeckSize}张）`;
  }
}
