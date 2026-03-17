// ==================== 卡组系统 ====================
import { GAME_CONFIG } from '../config/game-config';
/**
 * 卡组系统 - 管理玩家的方块卡组
 */
export class DeckSystem {
    constructor() {
        Object.defineProperty(this, "selectedDeck", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // 玩家选择的卡组 ID 列表
        Object.defineProperty(this, "drawPile", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // 抽牌堆
        Object.defineProperty(this, "discardPile", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // 弃牌堆
        this.selectedDeck = [];
        this.drawPile = [];
        this.discardPile = [];
    }
    /**
     * 初始化卡组（从配置中获取所有基础方块）
     */
    initializeDeck() {
        const basicPieces = GAME_CONFIG.CARDS
            .filter(card => card.type === 'basic')
            .map(card => card.id);
        this.selectedDeck = basicPieces;
        this.shuffleDeck();
    }
    /**
     * 设置自定义卡组
     */
    setDeck(pieceIds) {
        this.selectedDeck = pieceIds;
        this.shuffleDeck();
    }
    /**
     * 洗牌
     */
    shuffleDeck() {
        // 将选中的卡组复制到抽牌堆
        this.drawPile = [...this.selectedDeck];
        this.discardPile = [];
        // Fisher-Yates 洗牌算法
        for (let i = this.drawPile.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.drawPile[i], this.drawPile[j]] = [this.drawPile[j], this.drawPile[i]];
        }
    }
    /**
     * 抽取一个方块类型
     */
    drawPiece() {
        // 如果抽牌堆为空，重新洗牌
        if (this.drawPile.length === 0) {
            if (this.discardPile.length === 0) {
                // 如果弃牌堆也为空，初始化卡组
                this.initializeDeck();
            }
            else {
                // 将弃牌堆洗入抽牌堆
                this.drawPile = [...this.discardPile];
                this.discardPile = [];
                this.shuffleDeck();
            }
        }
        // 从抽牌堆顶部抽取
        return this.drawPile.pop() || 'I';
    }
    /**
     * 将方块类型放回弃牌堆
     */
    discardPiece(pieceId) {
        this.discardPile.push(pieceId);
    }
    /**
     * 获取当前卡组信息
     */
    getDeckInfo() {
        return {
            selectedCount: this.selectedDeck.length,
            drawCount: this.drawPile.length,
            discardCount: this.discardPile.length,
        };
    }
    /**
     * 获取可用的基础方块列表
     */
    getAvailablePieces() {
        return GAME_CONFIG.CARDS
            .filter(card => card.type === 'basic')
            .map(card => ({
            id: card.id,
            name: card.name,
            rarity: card.rarity,
        }));
    }
}
