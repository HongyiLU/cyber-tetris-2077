// ==================== 卡组管理器 ====================

import { GAME_CONFIG } from '../config/game-config';
import type { Deck, DeckConfig, DeckValidationResult, PresetDeck, DeckCard, DrawResult } from '../types/deck';
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
 */
export class DeckManager {
  private decks: Map<string, Deck>;
  private activeDeckId: string | null;
  private readonly storageKey: string;
  private readonly config: DeckConfig;
  
  // 牌堆模式：当前抽取池（会减少）
  private currentDrawPool: string[] = [];
  
  // 向后兼容：卡牌收集系统
  private collectedCards: Set<string>;
  private currentDeck: string[];
  private readonly maxDeckSize: number;

  // 错误处理
  private onErrorCallback?: StorageErrorCallback;
  private lastStorageError?: Error;

  /**
   * 预设卡组定义
   * 提供 3 个默认卡组供新手使用
   */
  private readonly PRESET_DECKS: PresetDeck[] = [
    {
      id: 'preset-classic',
      name: '经典卡组',
      description: '只包含 7 种经典 4 块方块（I、O、T、S、Z、L、J）',
      cards: ['I', 'O', 'T', 'S', 'Z', 'L', 'J'],
    },
    {
      id: 'preset-beginner',
      name: '新手卡组',
      description: '包含所有 2 块、3 块和 4 块方块，适合新手练习',
      cards: ['I', 'O', 'T', 'S', 'Z', 'L', 'J', 'DOM', 'V3', 'COR'],
    },
    {
      id: 'preset-complete',
      name: '全卡卡组',
      description: '包含所有基础方块（不含特殊方块）',
      cards: ['I', 'O', 'T', 'S', 'Z', 'L', 'J', 'DOM', 'V3', 'COR', 'U5', 'W5', 'I5'],
    },
  ];

  constructor(config: Partial<DeckConfig> = {}) {
    this.decks = new Map();
    this.activeDeckId = null;
    this.storageKey = 'cyber-blocks-decks';
    
    // 合并默认配置和用户配置
    this.config = {
      minDeckSize: config.minDeckSize ?? 3,
      maxDeckSize: config.maxDeckSize ?? 15,
      rarityWeights: config.rarityWeights ?? {
        common: 50,
        uncommon: 30,
        rare: 15,
        epic: 4,
        legendary: 1,
      },
    };

    // 向后兼容：初始化卡牌收集系统
    this.collectedCards = new Set();
    this.currentDeck = [];
    this.maxDeckSize = 10;
    this.initializeBasicCards();

    // 加载已保存的卡组
    this.loadDecks();
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
   */
  private handleStorageError(error: unknown, operation: 'save' | 'load'): void {
    const err = error instanceof Error ? error : new Error(String(error));
    this.lastStorageError = err;
    
    console.error(`卡组${operation}失败:`, err);
    
    if (this.onErrorCallback) {
      this.onErrorCallback(err, operation);
    }
  }

  // ==================== 卡组 CRUD 操作 ====================

  /**
   * 创建新卡组
   * @param name 卡组名称
   * @param cards 方块 ID 列表
   * @returns 创建的卡组对象，如果验证失败则抛出错误
   */
  public createDeck(name: string, cards: string[]): Deck {
    // 生成唯一 ID
    const id = `deck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const deck: Deck = {
      id,
      name,
      cards: [...cards],
      createdAt: Date.now(),
    };

    // 验证卡组
    const validation = this.validateDeck(deck);
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
   * 获取卡组
   * @param deckId 卡组 ID
   * @returns 卡组对象，不存在则返回 undefined
   */
  public getDeck(deckId: string): Deck | undefined {
    return this.decks.get(deckId);
  }

  /**
   * 更新卡组
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
    };

    // 验证更新后的卡组
    const validation = this.validateDeck(updatedDeck);
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
   * @param deckId 卡组 ID
   * @throws 如果卡组不存在
   */
  public deleteDeck(deckId: string): void {
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
   * @param deck 要验证的卡组
   * @returns 验证结果
   */
  public validateDeck(deck: Deck): DeckValidationResult {
    const errors: string[] = [];

    // 检查名称
    if (!deck.name || deck.name.trim().length === 0) {
      errors.push('卡组名称不能为空');
    }

    // 检查卡片数量
    if (deck.cards.length < this.config.minDeckSize) {
      errors.push(`卡组至少需要 ${this.config.minDeckSize} 张卡牌（当前：${deck.cards.length}）`);
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
    for (const cardId of deck.cards) {
      if (!validCardIds.includes(cardId)) {
        errors.push(`无效的卡牌 ID: ${cardId}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
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
        return { success: true };
      }

      const parsed = JSON.parse(data);
      
      // 恢复卡组
      if (parsed.decks && Array.isArray(parsed.decks)) {
        this.decks = new Map(parsed.decks);
      }

      // 恢复激活状态
      if (parsed.activeDeckId) {
        this.activeDeckId = parsed.activeDeckId;
      }

      // 如果没有任何卡组，加载预设卡组
      if (this.decks.size === 0) {
        this.loadPresetDecks();
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
    for (const preset of this.PRESET_DECKS) {
      const deck: Deck = {
        id: preset.id,
        name: preset.name,
        cards: [...preset.cards],
        createdAt: Date.now(),
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
      version: '1.0',
      exportDate: new Date().toISOString(),
      decks: Array.from(this.decks.entries()),
      activeDeckId: this.activeDeckId,
      collectedCards: Array.from(this.collectedCards),
      currentDeck: [...this.currentDeck],
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

      if (parsed.collectedCards && Array.isArray(parsed.collectedCards)) {
        this.collectedCards = new Set(parsed.collectedCards);
      }

      if (parsed.currentDeck && Array.isArray(parsed.currentDeck)) {
        this.currentDeck = parsed.currentDeck;
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
   * @param deckId 卡组 ID，null 表示不使用卡组（使用默认随机）
   */
  public setActiveDeck(deckId: string | null): void {
    if (deckId !== null && !this.decks.has(deckId)) {
      throw new Error(`卡组不存在：${deckId}`);
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
   */
  private refillDrawPool(): void {
    const deck = this.getActiveDeck();
    if (!deck) return;
    
    this.currentDrawPool = [];
    
    // 遍历卡组中的每张卡牌
    deck.cards.forEach((cardId) => {
      // 默认每张卡牌数量为 1
      const poolCount = 1;
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
   */
  public resetDrawPool(): void {
    this.currentDrawPool = [];
  }

  /**
   * 获取当前抽取池剩余数量（用于 UI 显示）
   * @returns 剩余卡牌数量
   */
  public getDrawPoolSize(): number {
    return this.currentDrawPool.length;
  }

  /**
   * 获取预设卡组列表
   */
  public getPresetDecks(): PresetDeck[] {
    return [...this.PRESET_DECKS];
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

  // ==================== 向后兼容：卡牌收集系统 ====================
  // 以下方法用于支持旧的 UI 组件

  /**
   * 初始化基础卡牌（解锁所有基础方块）
   */
  private initializeBasicCards(): void {
    const basicCards = GAME_CONFIG.CARDS.filter(card => card.type === 'basic');
    basicCards.forEach(card => {
      this.collectedCards.add(card.id);
    });
  }

  /**
   * 获取所有卡牌数据
   */
  public getAllCards(): CardData[] {
    return GAME_CONFIG.CARDS as CardData[];
  }

  /**
   * 获取已收集的卡牌
   */
  public getCollectedCards(): CardData[] {
    const collectedIds = Array.from(this.collectedCards);
    return GAME_CONFIG.CARDS.filter(card => collectedIds.includes(card.id)) as CardData[];
  }

  /**
   * 获取未收集的卡牌
   */
  public getUncollectedCards(): CardData[] {
    const collectedIds = Array.from(this.collectedCards);
    return GAME_CONFIG.CARDS.filter(card => !collectedIds.includes(card.id)) as CardData[];
  }

  /**
   * 检查是否已收集某张卡牌
   */
  public hasCard(cardId: string): boolean {
    return this.collectedCards.has(cardId);
  }

  /**
   * 解锁新卡牌
   */
  public unlockCard(cardId: string): boolean {
    if (this.collectedCards.has(cardId)) {
      return false;
    }
    this.collectedCards.add(cardId);
    return true;
  }

  /**
   * @deprecated 使用 getActiveDeck() 和 listDecks() 代替
   * 获取当前卡组（旧 API）
   */
  public getCurrentDeck(): string[] {
    return [...this.currentDeck];
  }

  /**
   * @deprecated 使用 createDeck() 和 updateDeck() 代替
   * 向卡组添加卡牌（旧 API）
   */
  public addToDeck(cardId: string): boolean {
    if (!this.collectedCards.has(cardId)) {
      console.warn(`卡牌 ${cardId} 未收集，无法添加到卡组`);
      return false;
    }

    if (this.currentDeck.includes(cardId)) {
      console.warn(`卡牌 ${cardId} 已在卡组中`);
      return false;
    }

    if (this.currentDeck.length >= this.maxDeckSize) {
      console.warn(`卡组已达上限 (${this.maxDeckSize})`);
      return false;
    }

    this.currentDeck.push(cardId);
    return true;
  }

  /**
   * @deprecated 使用 updateDeck() 代替
   * 从卡组移除卡牌（旧 API）
   */
  public removeFromDeck(cardId: string): boolean {
    const index = this.currentDeck.indexOf(cardId);
    if (index === -1) {
      return false;
    }
    this.currentDeck.splice(index, 1);
    return true;
  }

  /**
   * @deprecated 使用 deleteDeck() 或 updateDeck() 代替
   * 清空卡组（旧 API）
   */
  public clearDeck(): void {
    this.currentDeck = [];
  }

  /**
   * @deprecated 使用预设卡组功能代替
   * 自动填充卡组（旧 API）
   */
  public autoFillDeck(): void {
    this.clearDeck();
    
    const basicCards = GAME_CONFIG.CARDS.filter(
      card => card.type === 'basic' && this.collectedCards.has(card.id)
    );
    
    basicCards.sort((a, b) => {
      const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
      return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
    });
    
    for (const card of basicCards) {
      if (this.currentDeck.length >= this.maxDeckSize) break;
      this.currentDeck.push(card.id);
    }
  }

  /**
   * @deprecated 使用新的统计 API 代替
   * 获取卡组统计信息（旧 API）
   */
  public getDeckStats(): {
    totalCards: number;
    collectedCount: number;
    totalCollected: number;
    deckSize: number;
  } {
    return {
      totalCards: GAME_CONFIG.CARDS.length,
      collectedCount: this.collectedCards.size,
      totalCollected: GAME_CONFIG.CARDS.length,
      deckSize: this.currentDeck.length,
    };
  }

  /**
   * 根据稀有度抽卡（用于奖励系统）
   */
  public drawByRarity(targetRarity?: string): CardData | null {
    const cards = GAME_CONFIG.CARDS.filter(card => {
      if (targetRarity) {
        return card.rarity === targetRarity && !this.collectedCards.has(card.id);
      }
      return !this.collectedCards.has(card.id);
    }) as CardData[];

    if (cards.length === 0) {
      return null;
    }

    if (!targetRarity) {
      const totalWeight = cards.reduce((sum, card) => {
        return sum + (RARITY_WEIGHTS[card.rarity] || 1);
      }, 0);

      let random = Math.random() * totalWeight;
      
      for (const card of cards) {
        const weight = RARITY_WEIGHTS[card.rarity] || 1;
        random -= weight;
        
        if (random <= 0) {
          return card;
        }
      }
      
      return cards[0];
    }

    const randomIndex = Math.floor(Math.random() * cards.length);
    return cards[randomIndex];
  }

  /**
   * @deprecated 使用 exportAllData() 代替
   * 导出卡组配置（旧 API）
   */
  public exportDeck(): string {
    return JSON.stringify({
      collected: Array.from(this.collectedCards),
      deck: [...this.currentDeck],
    });
  }

  /**
   * @deprecated 使用 importAllData() 代替
   * 导入卡组配置（旧 API）
   */
  public importDeck(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.collected && Array.isArray(parsed.collected)) {
        this.collectedCards = new Set(parsed.collected);
      }
      
      if (parsed.deck && Array.isArray(parsed.deck)) {
        this.currentDeck = parsed.deck.slice(0, this.maxDeckSize);
      }
      
      return true;
    } catch (error) {
      console.error('导入卡组失败:', error);
      return false;
    }
  }

  /**
   * 重置进度（用于测试）
   */
  public reset(): void {
    this.collectedCards.clear();
    this.currentDeck = [];
    this.initializeBasicCards();
  }
}
