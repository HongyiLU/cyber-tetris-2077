// ==================== 卡组管理器 ====================

import { GAME_CONFIG } from '../config/game-config';
import type { Deck, DeckConfig, DeckValidationResult, PresetDeck, DeckCard, DrawResult } from '../types/deck';
import { DEFAULT_DECK_CONFIG } from '../types/deck';
import type { CardData } from '../types';

/**
 * localStorage 操作结果
 */
export interface StorageOperationResult {
  success: boolean;
  error?: string;
  data?: string;
}

/**
 * 错误回调函数类型
 */
export type StorageErrorCallback = (error: Error, operation: 'save' | 'load') => void;

/**
 * 卡组配置数据结构（用于自定义每种方块数量）
 */
export interface DeckConfigData {
  [pieceType: string]: number; // 方块类型 -> 数量 (0-3)
}

/**
 * 卡牌稀有度权重（用于奖励系统）
 */
const RARITY_WEIGHTS: Record<string, number> = {
  common: 50,
  uncommon: 30,
  rare: 15,
  epic: 4,
  legendary: 1,
};

/**
 * 卡组管理器类
 * 负责卡组的 CRUD 操作、验证和持久化
 * 
 * 功能：
 * - 创建、读取、更新、删除卡组
 * - 卡组验证（大小、重复等）
 * - localStorage 持久化（带错误处理）
 * - 预设卡组管理
 * - 卡牌收集系统（向后兼容）
 * - 卡组配置管理（v1.9.5 新增）
 */
export class DeckManager {
  private decks: Map<string, Deck>;
  private activeDeckId: string | null;
  private readonly storageKey: string;
  private readonly config: DeckConfig;
  
  // v1.9.5 新增：卡组配置（每种方块的数量）
  private deckConfig: DeckConfigData;
  private readonly deckConfigStorageKey: string = 'tetris_deck_config_v1';
  
  // 牌堆模式：当前抽取池（会减少）
  private currentDrawPool: string[] = [];
  
  // 错误处理
  private onErrorCallback?: StorageErrorCallback;
  private lastStorageError?: Error;

  /**
   * 预设卡组定义
   * 提供 3 个默认卡组供新手使用
   * 注意：只包含经典 7 种方块，已移除所有特殊方块
   */
  private readonly PRESET_DECKS: PresetDeck[] = [
    {
      id: 'preset-classic',
      name: '经典卡组',
      description: '只包含 7 种经典方块（I、O、T、S、Z、L、J）',
      cards: ['I', 'O', 'T', 'S', 'Z', 'L', 'J'],
    },
    {
      id: 'preset-beginner',
      name: '新手卡组',
      description: '只包含经典 7 种方块，适合新手练习',
      cards: ['I', 'O', 'T', 'S', 'Z', 'L', 'J'],
    },
    {
      id: 'preset-complete',
      name: '全卡卡组',
      description: '只包含经典 7 种方块（特殊方块已移除）',
      // 只包含经典 7 种
      cards: ['I', 'O', 'T', 'S', 'Z', 'L', 'J'],
    },
  ];

  /**
   * 默认卡组配置（每种方块 1 个）
   */
  private readonly DEFAULT_DECK_CONFIG: DeckConfigData = {
    'I': 1,
    'O': 1,
    'T': 1,
    'S': 1,
    'Z': 1,
    'L': 1,
    'J': 1,
  };

  constructor(config: Partial<DeckConfig> = {}) {
    this.decks = new Map();
    this.activeDeckId = null;
    this.storageKey = 'cyber-blocks-decks';
    this.deckConfig = { ...this.DEFAULT_DECK_CONFIG };
    
    // 合并默认配置和用户配置
    // v1.9.9: 使用类型定义中的默认配置（minDeckSize = 7）
    this.config = {
      minDeckSize: config.minDeckSize ?? DEFAULT_DECK_CONFIG.minDeckSize,
      maxDeckSize: config.maxDeckSize ?? DEFAULT_DECK_CONFIG.maxDeckSize,
      rarityWeights: config.rarityWeights ?? DEFAULT_DECK_CONFIG.rarityWeights,
    };

    // 版本检测
    const storedVersion = localStorage.getItem('deck_version');
    const currentVersion = 'v1.9.5';
    
    // 版本变更时清除旧数据
    if (storedVersion && storedVersion !== currentVersion) {
      const hasOldData = localStorage.getItem('cyber-blocks-decks');
      if (hasOldData) {
        localStorage.removeItem('cyber-blocks-decks');
      }
    }
    localStorage.setItem('deck_version', currentVersion);

    // 加载已保存的卡组
    this.loadDecks();
    
    // 加载卡组配置（v1.9.5 新增）
    this.loadDeckConfig();
  }

  // ==================== 错误处理 ====================

  /**
   * 设置错误回调
   * @param callback 错误回调函数
   */
  public setOnErrorCallback(callback: StorageErrorCallback): void {
    this.onErrorCallback = callback;
  }

  /**
   * 获取最后的存储错误
   */
  public getLastStorageError(): Error | undefined {
    return this.lastStorageError;
  }

  /**
   * 清除错误状态
   */
  public clearError(): void {
    this.lastStorageError = undefined;
  }

  /**
   * 处理存储错误
   * @param error 错误对象
   * @param operation 操作类型（save 或 load）
   */
  private handleStorageError(error: unknown, operation: 'save' | 'load'): void {
    const err = error instanceof Error ? error : new Error(String(error));
    this.lastStorageError = err;
    
    // 通过回调通知错误（如果有注册）
    if (this.onErrorCallback) {
      this.onErrorCallback(err, operation);
    }
  }

  // ==================== 卡组配置管理（v1.9.5 新增） ====================

  /**
   * 设置方块数量（0-3）
   * @param pieceType 方块类型（I, O, T, S, Z, L, J）
   * @param count 数量（0-3）
   * @throws 如果方块类型无效或数量超出范围
   */
  public setCardCount(pieceType: string, count: number): void {
    // 验证方块类型
    const validPieceTypes = GAME_CONFIG.CARDS.map(card => card.id);
    if (!validPieceTypes.includes(pieceType)) {
      throw new Error(`无效的方块类型：${pieceType}`);
    }

    // 验证数量范围
    if (!Number.isInteger(count) || count < 0 || count > 3) {
      throw new Error(`数量必须在 0-3 之间：${count}`);
    }

    this.deckConfig[pieceType] = count;
  }

  /**
   * 获取方块数量
   * @param pieceType 方块类型
   * @returns 方块数量（0-3），如果方块类型无效则返回 0
   */
  public getCardCount(pieceType: string): number {
    const validPieceTypes = GAME_CONFIG.CARDS.map(card => card.id);
    if (!validPieceTypes.includes(pieceType)) {
      return 0;
    }
    return this.deckConfig[pieceType] ?? 0;
  }

  /**
   * 获取所有方块配置
   * @returns 卡组配置数据
   */
  public getDeckConfig(): DeckConfigData {
    return { ...this.deckConfig };
  }

  /**
   * 保存卡组配置到 localStorage
   * @returns 操作结果
   */
  public saveDeckConfig(): StorageOperationResult {
    try {
      localStorage.setItem(this.deckConfigStorageKey, JSON.stringify(this.deckConfig));
      return { success: true };
    } catch (error) {
      this.handleStorageError(error, 'save');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '保存配置失败' 
      };
    }
  }

  /**
   * 从 localStorage 加载卡组配置
   * @returns 操作结果
   */
  public loadDeckConfig(): StorageOperationResult {
    try {
      const data = localStorage.getItem(this.deckConfigStorageKey);
      if (!data) {
        // 首次使用，使用默认配置
        this.deckConfig = { ...this.DEFAULT_DECK_CONFIG };
        return { success: true };
      }

      const parsed = JSON.parse(data);
      
      // 验证并加载配置
      const validPieceTypes = GAME_CONFIG.CARDS.map(card => card.id);
      const newConfig: DeckConfigData = {};
      
      for (const pieceType of validPieceTypes) {
        const count = parsed[pieceType];
        if (typeof count === 'number' && count >= 0 && count <= 3) {
          newConfig[pieceType] = count;
        } else {
          newConfig[pieceType] = 1; // 默认值
        }
      }
      
      this.deckConfig = newConfig;
      return { success: true, data };
    } catch (error) {
      this.handleStorageError(error, 'load');
      // 加载失败时使用默认配置
      this.deckConfig = { ...this.DEFAULT_DECK_CONFIG };
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '加载配置失败' 
      };
    }
  }

  /**
   * 重置为默认卡组配置
   */
  public resetDeckConfig(): void {
    this.deckConfig = { ...this.DEFAULT_DECK_CONFIG };
    this.saveDeckConfig();
  }

  /**
   * 获取当前卡组总卡牌数
   * @returns 总卡牌数
   */
  public getTotalCardCount(): number {
    return Object.values(this.deckConfig).reduce((sum, count) => sum + count, 0);
  }

  // ==================== 卡组 CRUD 操作 ====================

  /**
   * 创建新卡组
   * v1.9.9 优化：创建时不验证最小组牌数，允许保存空卡组
   * v1.9.19 升级：支持 (string | DeckCard)[] 类型（向后兼容）
   * @param name 卡组名称
   * @param cards 方块 ID 列表（支持 string[] 或 DeckCard[]）
   * @param description 卡组描述（可选）
   * @returns 创建的卡组对象，如果验证失败则抛出错误
   */
  public createDeck(name: string, cards: (string | DeckCard)[] = [], description?: string): Deck {
    // 生成唯一 ID
    const id = `deck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const now = Date.now();
    
    // v1.9.19 修复：统一转换为 DeckCard[] 格式
    const normalizedCards: DeckCard[] = cards.map(card => {
      if (typeof card === 'string') {
        return { cardId: card, count: 1 };
      } else {
        return { ...card, count: Math.max(1, card.count) };
      }
    });
    
    const deck: Deck = {
      id,
      name,
      description: description?.trim() || undefined,
      cards: normalizedCards,
      createdAt: now,
      updatedAt: now,
    };

    // 验证卡组（创建时不检查最小组牌数）
    const validation = this.validateDeck(deck, { checkMinSize: false });
    if (!validation.valid) {
      throw new Error(`卡组验证失败：${validation.errors.join(', ')}`);
    }

    // 保存到内存
    this.decks.set(id, deck);
    
    // 持久化
    this.saveDecks();

    return deck;
  }

  /**
   * 复制现有卡组创建新卡组
   * @param deckId 要复制的卡组 ID
   * @param newName 新卡组名称（可选，默认为原名称 + "副本"）
   * @returns 复制的卡组对象
   */
  public copyDeck(deckId: string, newName?: string): Deck {
    const originalDeck = this.decks.get(deckId);
    if (!originalDeck) {
      throw new Error(`卡组不存在：${deckId}`);
    }

    const deckName = newName || `${originalDeck.name} 副本`;
    // v1.9.19 修复：传递 (string | DeckCard)[] 给 createDeck
    return this.createDeck(deckName, [...originalDeck.cards], originalDeck.description);
  }

  /**
   * 导出单个卡组为 JSON 字符串
   * @param deckId 卡组 ID
   * @returns JSON 字符串
   */
  public exportDeck(deckId: string): string {
    const deck = this.decks.get(deckId);
    if (!deck) {
      throw new Error(`卡组不存在：${deckId}`);
    }

    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      deck: {
        id: deck.id,
        name: deck.name,
        description: deck.description,
        cards: [...deck.cards],
        createdAt: deck.createdAt,
      },
    };
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * 从 JSON 字符串导入单个卡组
   * @param jsonString JSON 字符串
   * @param rename 是否重命名导入的卡组（避免名称冲突）
   * @returns 导入的卡组对象
   */
  public importDeck(jsonString: string, rename: boolean = false): Deck {
    try {
      const parsed = JSON.parse(jsonString);
      
      // 支持旧格式（只有 deck 对象）和新格式（包含 version 等元数据）
      const deckData = parsed.deck || parsed;
      
      if (!deckData.name || !deckData.cards) {
        throw new Error('无效的卡组数据格式');
      }

      const deckName = rename ? `${deckData.name} (导入)` : deckData.name;
      const description = deckData.description;
      const cards = Array.isArray(deckData.cards) ? deckData.cards : [];

      return this.createDeck(deckName, cards, description);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('导入失败：无效的 JSON 格式');
    }
  }

  /**
   * 获取卡组
   * @param deckId 卡组 ID
   * @returns 卡组对象，不存在则返回 undefined
   */
  public getDeck(deckId: string): Deck | undefined {
    return this.decks.get(deckId);
  }

  /**
   * 更新卡组
   * v1.9.9 优化：更新时不验证最小组牌数，允许保存任意大小的卡组
   * @param deckId 卡组 ID
   * @param updates 要更新的字段
   * @throws 如果卡组不存在或验证失败
   */
  public updateDeck(deckId: string, updates: Partial<Deck>): void {
    const deck = this.decks.get(deckId);
    if (!deck) {
      throw new Error(`卡组不存在：${deckId}`);
    }

    // 合并更新
    const updatedDeck: Deck = {
      ...deck,
      ...updates,
      // 确保 cards 是新的数组
      cards: updates.cards ? [...updates.cards] : deck.cards,
      // 自动更新 updatedAt
      updatedAt: Date.now(),
    };

    // 验证更新后的卡组（更新时不检查最小组牌数）
    const validation = this.validateDeck(updatedDeck, { checkMinSize: false });
    if (!validation.valid) {
      throw new Error(`卡组验证失败：${validation.errors.join(', ')}`);
    }

    // 保存到内存
    this.decks.set(deckId, updatedDeck);
    
    // 持久化
    this.saveDecks();
  }

  /**
   * 删除卡组
   * v1.9.10 优化：允许删除预设卡组，但最后一个卡组无法删除
   * @param deckId 卡组 ID
   * @throws 如果卡组不存在或尝试删除最后一个卡组
   */
  public deleteDeck(deckId: string): void {
    // v1.9.10: 检查是否为最后一个卡组
    if (this.decks.size <= 1) {
      throw new Error('无法删除最后一个卡组，请至少保留一个卡组');
    }

    if (!this.decks.has(deckId)) {
      throw new Error(`卡组不存在：${deckId}`);
    }

    // 如果删除的是当前激活的卡组，清空激活状态
    if (this.activeDeckId === deckId) {
      this.activeDeckId = null;
    }

    this.decks.delete(deckId);
    this.saveDecks();
  }

  /**
   * 列出所有卡组
   * @returns 所有卡组的数组
   */
  public listDecks(): Deck[] {
    return Array.from(this.decks.values());
  }

  // ==================== 卡组验证 ====================

  /**
   * 验证卡组是否有效
   * v1.9.9 优化：支持不同场景下的验证模式
   * @param deck 要验证的卡组
   * @param options 验证选项
   * @returns 验证结果
   */
  public validateDeck(deck: Deck, options: { checkMinSize?: boolean } = {}): DeckValidationResult {
    const { checkMinSize = true } = options;
    const errors: string[] = [];

    // 检查名称
    if (!deck.name || deck.name.trim().length === 0) {
      errors.push('卡组名称不能为空');
    }

    // 检查卡片数量（v1.9.9 优化：根据选项决定是否检查最小数量）
    if (checkMinSize && deck.cards.length < this.config.minDeckSize) {
      errors.push(`卡组至少需要 ${this.config.minDeckSize} 张卡牌才能使用（当前：${deck.cards.length}）`);
    }
    if (deck.cards.length > this.config.maxDeckSize) {
      errors.push(`卡组最多容纳 ${this.config.maxDeckSize} 张卡牌（当前：${deck.cards.length}）`);
    }

    // 检查是否有重复的卡牌
    const uniqueCards = new Set(deck.cards);
    if (uniqueCards.size !== deck.cards.length) {
      errors.push('卡组中包含重复的卡牌');
    }

    // 检查所有卡牌是否有效
    const validCardIds = GAME_CONFIG.CARDS.map(card => card.id);
    for (const card of deck.cards) {
      const cardId = typeof card === 'string' ? card : card.cardId;
      if (!validCardIds.includes(cardId)) {
        errors.push(`无效的卡牌 ID: ${cardId}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 检查卡组是否可用（用于 UI 显示和游戏开始验证）
   * v1.9.9 新增：快速判断卡组是否满足使用条件（只检查最小组牌数）
   * @param deck 卡组对象
   * @returns 是否可用
   */
  public isDeckUsable(deck: Deck): boolean {
    return deck.cards.length >= this.config.minDeckSize;
  }

  /**
   * 获取所有可用卡组（满足最小组牌数要求）
   * v1.9.9 新增：过滤出可使用的卡组
   * @returns 可用卡组列表
   */
  public getUsableDecks(): Deck[] {
    return Array.from(this.decks.values()).filter(deck => this.isDeckUsable(deck));
  }

  // ==================== 卡组持久化（带错误处理） ====================

  /**
   * 保存卡组到 localStorage
   * @returns 操作结果
   */
  public saveDecks(): StorageOperationResult {
    try {
      const data = {
        decks: Array.from(this.decks.entries()),
        activeDeckId: this.activeDeckId,
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return { success: true };
    } catch (error) {
      this.handleStorageError(error, 'save');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '保存失败' 
      };
    }
  }

  /**
   * 从 localStorage 加载卡组
   * @returns 操作结果
   */
  public loadDecks(): StorageOperationResult {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) {
        // 首次使用，加载预设卡组
        this.loadPresetDecks();
        // 默认激活经典卡组
        if (this.decks.has('preset-classic')) {
          this.activeDeckId = 'preset-classic';
          this.saveDecks();
        }
        return { success: true };
      }

      const parsed = JSON.parse(data);
      
      // 获取所有有效的卡牌 ID
      const validCardIds = new Set(GAME_CONFIG.CARDS.map(card => card.id));
      
      // 恢复卡组（过滤掉无效的卡牌 ID）
      // v1.9.9 优化：保留所有卡组，包括不满足最小组牌数的卡组
      if (parsed.decks && Array.isArray(parsed.decks)) {
        const cleanedDecks: Array<[string, Deck]> = [];
        let hasInvalidCards = false;
        
        for (const [deckId, deck] of parsed.decks) {
          const originalCards = deck.cards;
          // 过滤掉无效的卡牌 ID
          const filteredCards = deck.cards.filter((cardId: string) => {
            const isValid = validCardIds.has(cardId);
            if (!isValid) {
              hasInvalidCards = true;
            }
            return isValid;
          });
          
          // v1.9.9 优化：保留所有卡组，包括过滤后太小的卡组
          cleanedDecks.push([deckId, { ...deck, cards: filteredCards }]);
        }
        
        this.decks = new Map(cleanedDecks);
        
        // 如果有无效卡牌被清理，保存更新后的卡组
        if (hasInvalidCards) {
          this.saveDecks();
        }
      }

      // 恢复激活状态
      if (parsed.activeDeckId) {
        // 检查激活的卡组是否仍然存在
        if (this.decks.has(parsed.activeDeckId)) {
          this.activeDeckId = parsed.activeDeckId;
        } else {
          this.activeDeckId = null;
        }
      }

      // 默认激活经典卡组
      if (!this.activeDeckId && this.decks.has('preset-classic')) {
        this.activeDeckId = 'preset-classic';
        this.saveDecks();
      }

      // 如果没有任何卡组，加载预设卡组
      if (this.decks.size === 0) {
        this.loadPresetDecks();
        // 加载预设卡组后，激活经典卡组
        if (this.decks.has('preset-classic')) {
          this.activeDeckId = 'preset-classic';
          this.saveDecks();
        }
      }

      return { success: true, data };
    } catch (error) {
      this.handleStorageError(error, 'load');
      // 加载失败时，使用预设卡组
      this.loadPresetDecks();
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '加载失败' 
      };
    }
  }

  /**
   * 加载预设卡组
   */
  private loadPresetDecks(): void {
    const now = Date.now();
    for (const preset of this.PRESET_DECKS) {
      const deck: Deck = {
        id: preset.id,
        name: preset.name,
        cards: [...preset.cards],
        createdAt: now,
        updatedAt: now,
      };
      this.decks.set(preset.id, deck);
    }
    this.saveDecks();
  }

  // ==================== 数据导出/导入（备份功能） ====================

  /**
   * 导出所有卡组数据为 JSON 字符串（用于备份）
   * @returns JSON 字符串
   */
  public exportAllData(): string {
    const data = {
      version: '1.9.5',
      exportDate: new Date().toISOString(),
      decks: Array.from(this.decks.entries()),
      activeDeckId: this.activeDeckId,
      deckConfig: this.deckConfig,
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * 从 JSON 字符串导入数据（用于恢复备份）
   * @param jsonString JSON 字符串
   * @returns 导入结果
   */
  public importAllData(jsonString: string): StorageOperationResult {
    try {
      const parsed = JSON.parse(jsonString);
      
      if (parsed.decks && Array.isArray(parsed.decks)) {
        this.decks = new Map(parsed.decks);
      }

      if (parsed.activeDeckId) {
        this.activeDeckId = parsed.activeDeckId;
      }

      // 导入卡组配置（如果存在）
      if (parsed.deckConfig) {
        this.deckConfig = parsed.deckConfig;
      }

      // 保存导入的数据
      return this.saveDecks();
    } catch (error) {
      this.handleStorageError(error, 'load');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '导入失败' 
      };
    }
  }

  /**
   * 下载数据备份文件
   * @param filename 文件名（可选）
   */
  public downloadBackup(filename: string = 'cyber-blocks-backup.json'): void {
    const data = this.exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ==================== 激活卡组管理 ====================

  /**
   * 设置当前激活的卡组
   * v1.9.9 优化：验证卡组是否满足最小组牌数要求
   * @param deckId 卡组 ID，null 表示不使用卡组（使用默认随机）
   * @throws 如果卡组不存在或不满足使用条件
   */
  public setActiveDeck(deckId: string | null): void {
    if (deckId !== null) {
      const deck = this.decks.get(deckId);
      if (!deck) {
        throw new Error(`卡组不存在：${deckId}`);
      }
      
      // v1.9.9 新增：验证卡组是否可用
      if (!this.isDeckUsable(deck)) {
        const validation = this.validateDeck(deck, { checkMinSize: true });
        // 提取第一个错误信息（通常是卡组大小问题）
        const errorMessage = validation.errors.find(e => e.includes('至少需要')) || validation.errors.join(', ');
        throw new Error(errorMessage);
      }
    }
    this.activeDeckId = deckId;
    this.saveDecks();
  }

  /**
   * 获取当前激活的卡组
   * @returns 激活的卡组，未设置则返回 null
   */
  public getActiveDeck(): Deck | null {
    if (!this.activeDeckId) {
      return null;
    }
    return this.decks.get(this.activeDeckId) || null;
  }

  // ==================== 牌堆模式（无放回抽样） ====================

  /**
   * 重新填充抽取池（洗牌）
   * 从激活的卡组中构建抽取池，使用 Fisher-Yates 洗牌算法
   * v1.9.19 修复：使用 DeckCard[] 类型的实际数量配置
   */
  private refillDrawPool(): void {
    const deck = this.getActiveDeck();
    if (!deck) return;
    
    this.currentDrawPool = [];
    
    // v1.9.19 修复：遍历 (string | DeckCard)[]，支持两种类型
    deck.cards.forEach((card) => {
      let cardId: string;
      let poolCount: number;
      
      if (typeof card === 'string') {
        // 向后兼容：string[] 格式
        cardId = card;
        poolCount = 1;
      } else {
        // DeckCard[] 格式，使用实际数量
        cardId = card.cardId;
        poolCount = Math.max(1, card.count);
      }
      
      for (let i = 0; i < poolCount; i++) {
        this.currentDrawPool.push(cardId);
      }
    });
    
    // 洗牌（Fisher-Yates 算法）
    for (let i = this.currentDrawPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.currentDrawPool[i], this.currentDrawPool[j]] = 
      [this.currentDrawPool[j], this.currentDrawPool[i]];
    }
  }

  /**
   * 从牌堆抽取卡牌（无放回抽样）
   * 抽一张少一张，抽空后自动洗牌
   * @returns 抽卡结果
   */
  public drawFromDeck(): DrawResult {
    // 如果抽取池为空，先填充并标记为"抽空"
    const wasEmpty = this.currentDrawPool.length === 0;
    
    if (wasEmpty) {
      this.refillDrawPool();
    }
    
    if (this.currentDrawPool.length === 0) {
      // 仍然为空，返回回退卡牌
      return {
        success: false,
        card: this.getFallbackCard(),
        message: '卡组为空',
        wasRefilled: false,
      };
    }
    
    // 抽取最后一张（栈顶）
    const cardId = this.currentDrawPool.pop()!;
    
    return {
      success: true,
      card: { id: cardId },
      wasRefilled: wasEmpty, // 标记是否刚洗牌
    };
  }

  /**
   * 获取回退卡牌（当卡组为空时使用）
   * @returns 回退卡牌 ID
   */
  private getFallbackCard(): { id: string } {
    // 返回一个经典的 T 方块作为回退
    return { id: 'T' };
  }

  /**
   * 重置抽取池（用于重新开始游戏）
   * 清空抽取池，下次抽取时会自动填充
   */
  public resetDrawPool(): void {
    this.currentDrawPool = [];
  }

  /**
   * 初始化抽取池（用于游戏开始时）
   * 填充抽取池但不标记为"抽空"（避免触发惩罚）
   */
  public initializeDrawPool(): void {
    this.currentDrawPool = [];
    this.refillDrawPool();
  }

  /**
   * 获取当前抽取池剩余数量（用于 UI 显示）
   * @returns 剩余卡牌数量
   */
  public getDrawPoolSize(): number {
    return this.currentDrawPool.length;
  }

  /**
   * 获取所有可用卡牌数据
   */
  public getAllCards(): CardData[] {
    return GAME_CONFIG.CARDS as CardData[];
  }

  /**
   * 获取预设卡组列表
   */
  public getPresetDecks(): PresetDeck[] {
    return [...this.PRESET_DECKS];
  }

  /**
   * 将卡组保存为模板
   * @param deckId 卡组 ID
   * @param templateName 模板名称
   */
  public saveAsTemplate(deckId: string, templateName: string): void {
    const deck = this.decks.get(deckId);
    if (!deck) {
      throw new Error(`卡组不存在：${deckId}`);
    }

    // 更新卡组标记为模板
    this.updateDeck(deckId, {
      isTemplate: true,
      name: templateName,
    });
  }

  /**
   * 从模板加载卡组
   * @param templateId 模板卡组 ID
   * @param newDeckName 新卡组名称（可选）
   * @returns 从模板创建的卡组
   */
  public loadTemplate(templateId: string, newDeckName?: string): Deck {
    const template = this.decks.get(templateId);
    if (!template) {
      throw new Error(`模板不存在：${templateId}`);
    }

    const deckName = newDeckName || `${template.name} 卡组`;
    return this.createDeck(deckName, [...template.cards], template.description);
  }

  /**
   * 获取所有模板卡组
   * @returns 模板卡组列表
   */
  public listTemplates(): Deck[] {
    return Array.from(this.decks.values()).filter(deck => deck.isTemplate === true);
  }

  // ==================== 卡组配置 ====================

  /**
   * 获取卡组配置
   */
  public getConfig(): DeckConfig {
    return { ...this.config };
  }

  /**
   * 获取稀有度权重
   */
  public getRarityWeights(): Record<string, number> {
    return { ...this.config.rarityWeights };
  }

  /**
   * 使用当前配置构建牌堆（用于测试）
   * @returns 构建的牌堆
   */
  public buildDeck(): string[] {
    const deck: string[] = [];
    
    // 遍历所有方块类型
    const validPieceTypes = GAME_CONFIG.CARDS.map(card => card.id);
    for (const pieceType of validPieceTypes) {
      const count = this.deckConfig[pieceType] ?? 1;
      for (let i = 0; i < count; i++) {
        deck.push(pieceType);
      }
    }
    
    return deck;
  }

  /**
   * 重置进度（用于测试）
   */
  public reset(): void {
    this.decks.clear();
    this.activeDeckId = null;
    this.deckConfig = { ...this.DEFAULT_DECK_CONFIG };
    this.loadPresetDecks();
    this.activeDeckId = 'preset-classic';
    this.saveDecks();
  }
}
