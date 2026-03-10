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

    // 版本检测
    const storedVersion = localStorage.getItem('deck_version');
    const currentVersion = 'v1.7.0';
    
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

  // ==================== 卡组 CRUD 操作 ====================

  /**
   * 创建新卡组
   * @param name 卡组名称
   * @param cards 方块 ID 列表
   * @param description 卡组描述（可选）
   * @returns 创建的卡组对象，如果验证失败则抛出错误
   */
  public createDeck(name: string, cards: string[] = [], description?: string): Deck {
    // 生成唯一 ID
    const id = `deck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const now = Date.now();
    const deck: Deck = {
      id,
      name,
      description: description?.trim() || undefined,
      cards: [...cards],
      createdAt: now,
      updatedAt: now,
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
          
          // 如果过滤后卡组仍然有效，保留该卡组
          if (filteredCards.length >= this.config.minDeckSize) {
            cleanedDecks.push([deckId, { ...deck, cards: filteredCards }]);
          }
          // 过滤后卡组太小的卡组将被自动移除
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
      version: '1.7.0',
      exportDate: new Date().toISOString(),
      decks: Array.from(this.decks.entries()),
      activeDeckId: this.activeDeckId,
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
   * 重置进度（用于测试）
   */
  public reset(): void {
    this.decks.clear();
    this.activeDeckId = null;
    this.loadPresetDecks();
    this.activeDeckId = 'preset-classic';
    this.saveDecks();
  }
}
