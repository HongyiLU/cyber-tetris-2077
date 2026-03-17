import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// ==================== 卡组管理界面组件 ====================
// v1.9.14 - 卡牌视觉优化
// v1.9.16 - 添加特殊效果方块卡牌
import { useState, useEffect } from 'react';
import Card from './Card';
import { isDeckValidForUse, getDeckStatusText, DEFAULT_DECK_CONFIG } from '../../types/deck';
import { GAME_CONFIG } from '../../config/game-config';
import './CardDeck.css';
const CardDeck = ({ deckManager, onClose }) => {
    const [activeTab, setActiveTab] = useState('deck');
    const [selectedCard, setSelectedCard] = useState(null);
    const [rarityFilter, setRarityFilter] = useState('all');
    const [decks, setDecks] = useState([]);
    const [activeDeckId, setActiveDeckId] = useState(null);
    const [showNewDeckModal, setShowNewDeckModal] = useState(false);
    const [newDeckName, setNewDeckName] = useState('');
    const [newDeckDescription, setNewDeckDescription] = useState('');
    // v1.9.5 新增：卡组编辑状态
    const [deckConfig, setDeckConfig] = useState({});
    // v1.9.11 新增：弹窗编辑状态（移除编辑页签，改为弹窗）
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingDeckId, setEditingDeckId] = useState(null);
    const [editConfig, setEditConfig] = useState({});
    const [editDeckName, setEditDeckName] = useState('');
    // 所有可用卡牌
    const allCards = deckManager.getAllCards();
    // 加载卡组列表
    useEffect(() => {
        const loadDecks = () => {
            const allDecks = deckManager.listDecks();
            setDecks(allDecks);
            const active = deckManager.getActiveDeck();
            setActiveDeckId(active?.id || null);
        };
        loadDecks();
    }, [deckManager]);
    // v1.9.9 新增：判断卡组是否可用（使用类型定义中的 helper）
    const isDeckUsable = (deck) => {
        return isDeckValidForUse(deck, DEFAULT_DECK_CONFIG.minDeckSize);
    };
    // v1.9.9 新增：获取卡组可用性提示
    const getDeckUsabilityMessage = (deck) => {
        return getDeckStatusText(deck);
    };
    // v1.9.11 新增：打开编辑弹窗
    // v1.9.19 修复：确保加载的是当前卡组的数据
    const handleOpenEdit = (deckId) => {
        const deck = deckManager.getDeck(deckId);
        if (!deck) {
            console.error('卡组不存在:', deckId);
            alert('卡组不存在，请刷新页面后重试');
            return;
        }
        // v1.9.19 修复：从卡组数据加载配置，而不是全局配置
        const cardCounts = {};
        deck.cards.forEach(card => {
            const cardId = typeof card === 'string' ? card : card.cardId;
            const count = typeof card === 'string' ? 1 : card.count;
            cardCounts[cardId] = count;
        });
        setEditConfig(cardCounts);
        setEditingDeckId(deckId);
        setEditDeckName(deck.name);
        setShowEditModal(true);
    };
    // v1.9.11 新增：保存编辑
    // v1.9.20 修复：使用 updateDeck 更新卡组，而不是 saveDeckConfig
    const handleSaveEdit = () => {
        if (!editingDeckId)
            return;
        try {
            // v1.9.20 修复：将编辑配置转换为 DeckCard[] 格式并更新卡组
            const cards = Object.entries(editConfig)
                .filter(([_, count]) => count > 0) // 只保存数量>0 的卡牌
                .map(([cardId, count]) => ({ cardId, count }));
            // 使用 updateDeck 更新卡组
            deckManager.updateDeck(editingDeckId, { cards });
            setShowEditModal(false);
            setEditingDeckId(null);
            setDecks(deckManager.listDecks());
            // 刷新配置显示
            const config = deckManager.getDeckConfig();
            setDeckConfig(config);
        }
        catch (error) {
            console.error('保存编辑失败:', error);
            if (error instanceof Error) {
                alert(`保存失败：${error.message}`);
            }
            else {
                alert('保存失败');
            }
        }
    };
    // v1.9.11 新增：取消编辑
    const handleCancelEdit = () => {
        setShowEditModal(false);
        setEditingDeckId(null);
        // 重置配置
        const config = deckManager.getDeckConfig();
        setEditConfig(config);
    };
    // v1.9.11 新增：修改配置（弹窗内）
    const handleEditSetCardCount = (pieceType, count) => {
        setEditConfig({ ...editConfig, [pieceType]: count });
    };
    // v1.9.11 新增：获取编辑卡组名称
    const getEditingDeckName = () => {
        if (!editingDeckId)
            return '';
        const deck = deckManager.getDeck(editingDeckId);
        return deck?.name || '';
    };
    // v1.9.5 新增：加载卡组配置
    useEffect(() => {
        const config = deckManager.getDeckConfig();
        setDeckConfig(config);
    }, [deckManager]);
    // 过滤卡牌
    const filterCards = (cards) => {
        if (rarityFilter === 'all')
            return cards;
        return cards.filter(card => card.rarity === rarityFilter);
    };
    // 设置激活卡组
    const handleSetActiveDeck = (deckId) => {
        try {
            deckManager.setActiveDeck(deckId);
            setActiveDeckId(deckId);
            setDecks(deckManager.listDecks());
        }
        catch (error) {
            console.error('设置激活卡组失败:', error);
        }
    };
    // 创建新卡组
    const handleCreateDeck = () => {
        if (!newDeckName.trim()) {
            alert('请输入卡组名称');
            return;
        }
        try {
            deckManager.createDeck(newDeckName.trim(), [], newDeckDescription.trim());
            setShowNewDeckModal(false);
            setNewDeckName('');
            setNewDeckDescription('');
            setDecks(deckManager.listDecks());
        }
        catch (error) {
            console.error('创建卡组失败:', error);
            if (error instanceof Error) {
                alert(`创建失败：${error.message}`);
            }
        }
    };
    // 删除卡组
    // v1.9.10 优化：允许删除预设卡组，但最后一个卡组无法删除
    const handleDeleteDeck = (deckId) => {
        // 检查是否为最后一个卡组
        if (decks.length <= 1) {
            alert('无法删除最后一个卡组，请至少保留一个卡组');
            return;
        }
        const deck = decks.find(d => d.id === deckId);
        const isPreset = deck?.id?.startsWith('preset-');
        const remainingCount = decks.length - 1;
        // 确认删除（v1.9.10: 显示更多信息）
        const confirmMsg = isPreset
            ? `确定要删除预设卡组"${deck?.name}"吗？\n\n删除后剩余 ${remainingCount} 个卡组`
            : `确定要删除卡组"${deck?.name}"吗？\n\n删除后剩余 ${remainingCount} 个卡组`;
        if (!confirm(confirmMsg))
            return;
        try {
            deckManager.deleteDeck(deckId);
            setDecks(deckManager.listDecks());
            if (activeDeckId === deckId) {
                setActiveDeckId(null);
            }
        }
        catch (error) {
            console.error('删除卡组失败:', error);
            if (error instanceof Error) {
                alert(`删除失败：${error.message}`);
            }
        }
    };
    // 复制卡组
    const handleCopyDeck = (deckId) => {
        try {
            deckManager.copyDeck(deckId);
            setDecks(deckManager.listDecks());
        }
        catch (error) {
            console.error('复制卡组失败:', error);
            if (error instanceof Error) {
                alert(`复制失败：${error.message}`);
            }
        }
    };
    // 导出卡组
    const handleExportDeck = (deckId) => {
        try {
            const jsonString = deckManager.exportDeck(deckId);
            const deck = deckManager.getDeck(deckId);
            const filename = `${deck?.name || 'deck'}.json`;
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        catch (error) {
            console.error('导出卡组失败:', error);
            if (error instanceof Error) {
                alert(`导出失败：${error.message}`);
            }
        }
    };
    // 导入卡组
    const handleImportDeck = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files?.[0];
            if (!file)
                return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const jsonString = event.target?.result;
                    deckManager.importDeck(jsonString, true);
                    setDecks(deckManager.listDecks());
                    alert('卡组导入成功！');
                }
                catch (error) {
                    console.error('导入卡组失败:', error);
                    if (error instanceof Error) {
                        alert(`导入失败：${error.message}`);
                    }
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };
    // 从收藏添加卡牌到卡组（用于编辑模式）
    const handleAddCardToDeck = (cardId, targetDeckId) => {
        try {
            const deck = deckManager.getDeck(targetDeckId);
            if (!deck)
                return;
            // v1.9.19 修复：检查 DeckCard[] 类型
            const cardExists = deck.cards.some(c => typeof c === 'string' ? c === cardId : c.cardId === cardId);
            if (cardExists) {
                alert('该卡牌已在卡组中');
                return;
            }
            if (deck.cards.length >= 7) {
                alert('卡组已满（7/7）');
                return;
            }
            deckManager.updateDeck(targetDeckId, {
                // v1.9.19 修复：添加 DeckCard 对象
                cards: [...deck.cards, { cardId, count: 1 }],
            });
            setDecks(deckManager.listDecks());
        }
        catch (error) {
            console.error('添加卡牌失败:', error);
            if (error instanceof Error) {
                alert(`添加失败：${error.message}`);
            }
        }
    };
    // 从卡组移除卡牌
    const handleRemoveCardFromDeck = (cardId, deckId) => {
        try {
            const deck = deckManager.getDeck(deckId);
            if (!deck)
                return;
            deckManager.updateDeck(deckId, {
                // v1.9.19 修复：过滤 DeckCard[] 类型
                cards: deck.cards.filter(c => typeof c === 'string' ? c !== cardId : c.cardId !== cardId),
            });
            setDecks(deckManager.listDecks());
        }
        catch (error) {
            console.error('移除卡牌失败:', error);
        }
    };
    // v1.9.5 新增：卡组编辑功能（弹窗内使用临时配置）
    // v1.9.15 修复 P0-2: 注释说明 - 临时配置仅在保存时同步到 DeckManager，避免频繁更新导致性能问题
    const handleSetCardCount = (pieceType, count) => {
        setEditConfig({ ...editConfig, [pieceType]: count });
    };
    const handleSaveDeckConfig = () => {
        try {
            // v1.9.11: 保存弹窗中的编辑配置
            // 首先应用临时配置到 DeckManager
            Object.entries(editConfig).forEach(([pieceType, count]) => {
                deckManager.setCardCount(pieceType, count);
            });
            const result = deckManager.saveDeckConfig();
            if (result.success) {
                alert('卡组配置已保存！');
                setShowEditModal(false);
                setEditingDeckId(null);
                // 刷新显示
                const config = deckManager.getDeckConfig();
                setDeckConfig(config);
                setDecks(deckManager.listDecks());
            }
            else {
                alert(`保存失败：${result.error}`);
            }
        }
        catch (error) {
            console.error('保存卡组配置失败:', error);
            if (error instanceof Error) {
                alert(`保存失败：${error.message}`);
            }
        }
    };
    const handleResetDeckConfig = () => {
        if (confirm('确定要重置为默认卡组配置吗？')) {
            deckManager.resetDeckConfig();
            const config = deckManager.getDeckConfig();
            setEditConfig(config);
        }
    };
    const getTotalCardCount = () => {
        return Object.values(deckConfig).reduce((sum, count) => sum + count, 0);
    };
    const getRarityClass = (rarity) => {
        switch (rarity) {
            case 'legendary': return 'legendary';
            case 'epic': return 'epic';
            case 'rare': return 'rare';
            case 'uncommon': return 'uncommon';
            default: return 'common';
        }
    };
    const getCardColor = (cardId) => {
        const colors = {
            'I': '#00ffff',
            'O': '#ffff00',
            'T': '#da70d6',
            'S': '#00ff00',
            'Z': '#ff4444',
            'L': '#ff8c00',
            'J': '#4169e1',
        };
        return colors[cardId] || '#888';
    };
    // v1.9.13: 获取方块图标（保留用于预设卡组预览文本）
    const getCardIcon = (cardId) => {
        switch (cardId) {
            case 'I': return '📏';
            case 'O': return '⬜';
            case 'T': return '⏲️';
            case 'S': return '📐';
            case 'Z': return '⚡';
            case 'L': return '🔨';
            case 'J': return '🎯';
            default: return '🎴';
        }
    };
    return (_jsx("div", { className: "card-deck-container", children: _jsxs("div", { className: "card-deck-content", children: [_jsxs("div", { className: "card-deck-header", children: [_jsx("h2", { className: "card-deck-title", children: "\uD83C\uDFB4 \u5361\u7EC4\u7BA1\u7406" }), onClose && (_jsx("button", { onClick: onClose, className: "card-deck-close-btn", children: "\u5173\u95ED" }))] }), activeDeckId && (_jsxs("div", { className: "active-deck-banner", children: [_jsx("span", { className: "active-deck-label", children: "\u2705 \u5F53\u524D\u4F7F\u7528\uFF1A" }), _jsx("span", { className: "active-deck-name", children: decks.find(d => d.id === activeDeckId)?.name || '未知卡组' })] })), _jsxs("div", { className: "card-deck-stats", children: [_jsxs("div", { className: "card-deck-stat-item", children: [_jsx("div", { className: "card-deck-stat-label", children: "\u5361\u7EC4\u6570\u91CF" }), _jsx("div", { className: "card-deck-stat-value collected", children: decks.length })] }), _jsxs("div", { className: "card-deck-stat-item", children: [_jsx("div", { className: "card-deck-stat-label", children: "\u5361\u724C\u603B\u6570" }), _jsx("div", { className: "card-deck-stat-value deck-size", children: allCards.length })] })] }), _jsxs("div", { className: "card-deck-tabs", children: [_jsx("button", { onClick: () => setActiveTab('presets'), className: `card-deck-tab-btn ${activeTab === 'presets' ? 'active' : ''}`, children: "\uD83D\uDCE6 \u9884\u8BBE\u5361\u7EC4" }), _jsxs("button", { onClick: () => setActiveTab('deck'), className: `card-deck-tab-btn ${activeTab === 'deck' ? 'active' : ''}`, children: ["\uD83C\uDFB4 \u6211\u7684\u5361\u7EC4 (", decks.length, ")"] }), _jsx("button", { onClick: () => setActiveTab('collection'), className: `card-deck-tab-btn ${activeTab === 'collection' ? 'active' : ''}`, children: "\uD83D\uDCDA \u5361\u724C\u6536\u85CF" })] }), activeTab === 'deck' && activeDeckId && (_jsx("div", { className: "card-deck-edit-action", children: _jsx("button", { onClick: () => handleOpenEdit(activeDeckId), className: "card-deck-edit-global-btn", children: "\u270F\uFE0F \u7F16\u8F91\u5F53\u524D\u5361\u7EC4\u914D\u7F6E" }) })), activeTab === 'presets' && (_jsxs("div", { className: "preset-decks-list", children: [_jsx("h3", { className: "section-title", children: "\u9009\u62E9\u9884\u8BBE\u5361\u7EC4" }), deckManager.getPresetDecks().map(preset => {
                            const isActive = activeDeckId === preset.id;
                            return (_jsxs("div", { className: `preset-deck-item ${isActive ? 'active' : ''}`, children: [_jsxs("div", { className: "preset-deck-info", children: [_jsx("h4", { className: "preset-deck-name", children: preset.name }), _jsx("p", { className: "preset-deck-desc", children: preset.description }), _jsxs("div", { className: "preset-deck-cards", children: ["\u5305\u542B\uFF1A", preset.cards.map(card => {
                                                        const cardId = typeof card === 'string' ? card : card.cardId;
                                                        return getCardIcon(cardId);
                                                    }).join(' · ')] })] }), _jsx("button", { onClick: () => handleSetActiveDeck(preset.id), className: `preset-deck-select-btn ${isActive ? 'active' : ''}`, children: isActive ? '✓ 使用中' : '使用此卡组' })] }, preset.id));
                        })] })), activeTab === 'deck' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "card-deck-actions", children: [_jsx("button", { onClick: () => setShowNewDeckModal(true), className: "card-deck-action-btn new-deck", children: "\u2795 \u65B0\u5EFA\u5361\u7EC4" }), _jsx("button", { onClick: handleImportDeck, className: "card-deck-action-btn import", children: "\uD83D\uDCE5 \u5BFC\u5165\u5361\u7EC4" })] }), _jsx("div", { className: "decks-list", children: decks.length > 0 ? (decks.map(deck => {
                                const isActive = activeDeckId === deck.id;
                                const usable = isDeckUsable(deck);
                                return (_jsxs("div", { className: `deck-item ${isActive ? 'active' : ''} ${!usable ? 'unusable' : ''}`, title: !usable ? getDeckUsabilityMessage(deck) : undefined, children: [_jsxs("div", { className: "deck-info", children: [_jsx("h4", { className: "deck-name", children: deck.name }), deck.description && (_jsx("p", { className: "deck-description", children: deck.description })), _jsxs("div", { className: "deck-meta", children: [_jsxs("span", { children: [deck.cards.length, "/7 \u5F20\u5361"] }), isActive && _jsx("span", { className: "active-badge", children: "\u25CF \u5F53\u524D\u4F7F\u7528" }), !usable && _jsx("span", { className: "unusable-badge", children: "\u26A0\uFE0F \u4E0D\u53EF\u7528" })] }), _jsx("div", { className: "deck-cards-preview", children: deck.cards.length > 0 ? (deck.cards.slice(0, 7).map(card => {
                                                        const cardId = typeof card === 'string' ? card : card.cardId;
                                                        return getCardIcon(cardId);
                                                    }).join(' · ')) : (_jsx("span", { className: "empty-deck", children: "\u7A7A\u5361\u7EC4" })) }), !usable && (_jsx("div", { className: "deck-usability-hint", children: getDeckUsabilityMessage(deck) }))] }), _jsxs("div", { className: "deck-actions", children: [_jsx("button", { onClick: () => handleOpenEdit(deck.id), className: "deck-action-btn edit", title: "\u7F16\u8F91\u5361\u7EC4", children: "\u270F\uFE0F" }), _jsx("button", { onClick: () => handleSetActiveDeck(deck.id), className: `deck-action-btn use ${isActive ? 'active' : ''} ${!usable ? 'disabled' : ''}`, title: isActive ? '当前使用' : (!usable ? '卡组卡牌数量不足，无法使用' : '使用此卡组'), disabled: !usable, children: isActive ? '✓' : '使用' }), _jsx("button", { onClick: () => handleCopyDeck(deck.id), className: "deck-action-btn copy", title: "\u590D\u5236\u5361\u7EC4", children: "\uD83D\uDCCB" }), _jsx("button", { onClick: () => handleExportDeck(deck.id), className: "deck-action-btn export", title: "\u5BFC\u51FA\u5361\u7EC4", children: "\uD83D\uDCE4" }), _jsx("button", { onClick: () => handleDeleteDeck(deck.id), className: "deck-action-btn delete", title: "\u5220\u9664\u5361\u7EC4", disabled: decks.length <= 1, children: "\uD83D\uDDD1\uFE0F" })] })] }, deck.id));
                            })) : (_jsx("div", { className: "card-deck-empty-message", children: "\u6682\u65E0\u5361\u7EC4\uFF0C\u70B9\u51FB\"\u65B0\u5EFA\u5361\u7EC4\"\u521B\u5EFA\u4F60\u7684\u7B2C\u4E00\u4E2A\u5361\u7EC4" })) })] })), showEditModal && editingDeckId && (_jsx("div", { onClick: handleCancelEdit, className: "card-deck-modal-overlay", children: _jsxs("div", { onClick: (e) => e.stopPropagation(), className: "card-deck-modal-content common", children: [_jsxs("h3", { className: "card-deck-modal-title", children: ["\u7F16\u8F91\u5361\u7EC4\u914D\u7F6E\uFF1A", getEditingDeckName()] }), _jsxs("div", { className: "deck-edit-stats", children: [_jsxs("div", { className: "deck-edit-stat-item", children: [_jsx("span", { className: "stat-label", children: "\u5F53\u524D\u5361\u7EC4\u603B\u6570\uFF1A" }), _jsxs("span", { className: `stat-value ${Object.values(editConfig).reduce((sum, count) => sum + count, 0) < 3 ? 'warning' : 'success'}`, children: [Object.values(editConfig).reduce((sum, count) => sum + count, 0), " \u5F20"] })] }), Object.values(editConfig).reduce((sum, count) => sum + count, 0) < 3 && (_jsx("div", { className: "deck-edit-warning", children: "\u26A0\uFE0F \u5361\u7EC4\u81F3\u5C11\u9700\u8981 3 \u5F20\u5361\u724C\u624D\u80FD\u4F7F\u7528" }))] }), _jsx("div", { className: "deck-edit-list", children: _jsx("div", { className: "deck-edit-cards-grid", children: allCards.map(card => {
                                        const count = editConfig[card.id] ?? 1;
                                        // v1.9.15 修复 P0-1: 添加类型转换验证
                                        const cardData = {
                                            pieceType: card.id,
                                            name: card.name,
                                            description: card.desc || '',
                                            rarity: card.rarity,
                                            color: card.color || GAME_CONFIG.COLORS[card.id] || '#ffffff',
                                        };
                                        return (_jsxs("div", { className: "deck-edit-card-item", children: [_jsx(Card, { card: cardData, size: "small", clickable: true, onClick: () => handleEditSetCardCount(card.id, count > 0 ? 0 : 1) }), _jsxs("div", { className: "deck-edit-card-controls", children: [_jsx("button", { onClick: () => handleEditSetCardCount(card.id, count - 1), className: "deck-edit-btn minus", disabled: count <= 0, "aria-label": "\u51CF\u5C11\u6570\u91CF", children: "\u2212" }), _jsxs("div", { className: "deck-edit-count", children: [_jsx("span", { className: `count-value ${count === 0 ? 'zero' : ''}`, children: count }), count > 0 && (_jsx("span", { className: "count-label", children: "\u5F20" }))] }), _jsx("button", { onClick: () => handleEditSetCardCount(card.id, count + 1), className: "deck-edit-btn plus", disabled: count >= 3, "aria-label": "\u589E\u52A0\u6570\u91CF", children: "+" })] })] }, card.id));
                                    }) }) }), _jsxs("div", { className: "deck-edit-actions", children: [_jsx("button", { onClick: handleCancelEdit, className: "deck-edit-action-btn close", children: "\u53D6\u6D88" }), _jsx("button", { onClick: handleSaveDeckConfig, className: "deck-edit-action-btn save", children: "\uD83D\uDCBE \u4FDD\u5B58" })] })] }) })), activeTab === 'collection' && (_jsx("div", { className: "card-deck-rarity-filter", children: ['all', 'common', 'uncommon', 'rare', 'epic', 'legendary'].map(rarity => (_jsx("button", { onClick: () => setRarityFilter(rarity), className: `card-deck-rarity-btn ${rarityFilter === rarity ? 'active' : ''}`, "data-rarity": rarity, children: rarity === 'all' ? '全部' : rarity }, rarity))) })), activeTab === 'collection' && (_jsx("div", { className: "card-deck-grid", children: filterCards(allCards).map(card => {
                        // v1.9.14: 将 CardData 转换为 Card 类型
                        // v1.9.15-fix2: 添加默认值防止 undefined
                        const cardData = {
                            pieceType: card.id,
                            name: card.name,
                            description: card.desc || '',
                            rarity: card.rarity,
                            color: card.color || GAME_CONFIG.COLORS[card.id] || '#ffffff',
                        };
                        return (_jsx(Card, { card: cardData, size: "medium", clickable: true, onClick: () => setSelectedCard(card) }, card.id));
                    }) })), selectedCard && activeTab === 'collection' && (_jsx("div", { onClick: () => setSelectedCard(null), className: "card-deck-modal-overlay", children: _jsxs("div", { onClick: (e) => e.stopPropagation(), className: `card-deck-modal-content ${getRarityClass(selectedCard.rarity)}`, children: [_jsx("h3", { className: "card-deck-modal-title", children: selectedCard.name }), _jsx("div", { className: "card-deck-modal-icon", children: getCardIcon(selectedCard.id) }), _jsxs("div", { className: "card-deck-modal-meta", children: [selectedCard.type.toUpperCase(), " \u2022 ", selectedCard.rarity.toUpperCase()] }), _jsx("p", { className: "card-deck-modal-desc", children: selectedCard.desc }), _jsxs("div", { className: "card-deck-modal-actions", children: [_jsxs("div", { className: "add-to-deck-section", children: [_jsx("label", { className: "add-to-deck-label", children: "\u6DFB\u52A0\u5230\u5361\u7EC4\uFF1A" }), _jsxs("select", { className: "add-to-deck-select", onChange: (e) => {
                                                    const deckId = e.target.value;
                                                    if (deckId) {
                                                        handleAddCardToDeck(selectedCard.id, deckId);
                                                    }
                                                }, defaultValue: "", children: [_jsx("option", { value: "", disabled: true, children: "\u9009\u62E9\u5361\u7EC4" }), decks.filter(d => d.cards.length < 7).map(deck => (_jsxs("option", { value: deck.id, children: [deck.name, " (", deck.cards.length, "/7)"] }, deck.id)))] })] }), _jsx("button", { onClick: () => setSelectedCard(null), className: "card-deck-modal-btn close", children: "\u5173\u95ED" })] })] }) })), showNewDeckModal && (_jsx("div", { onClick: () => setShowNewDeckModal(false), className: "card-deck-modal-overlay", children: _jsxs("div", { onClick: (e) => e.stopPropagation(), className: "card-deck-modal-content common", children: [_jsx("h3", { className: "card-deck-modal-title", children: "\u65B0\u5EFA\u5361\u7EC4" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "deck-name", children: "\u5361\u7EC4\u540D\u79F0 *" }), _jsx("input", { id: "deck-name", type: "text", value: newDeckName, onChange: (e) => setNewDeckName(e.target.value), placeholder: "\u8F93\u5165\u5361\u7EC4\u540D\u79F0", maxLength: 30, autoFocus: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "deck-description", children: "\u5361\u7EC4\u63CF\u8FF0\uFF08\u53EF\u9009\uFF09" }), _jsx("textarea", { id: "deck-description", value: newDeckDescription, onChange: (e) => setNewDeckDescription(e.target.value), placeholder: "\u63CF\u8FF0\u5361\u7EC4\u7684\u7B56\u7565\u6216\u7528\u9014", maxLength: 200, rows: 3 })] }), _jsxs("div", { className: "card-deck-modal-actions", children: [_jsx("button", { onClick: handleCreateDeck, className: "card-deck-modal-btn add", disabled: !newDeckName.trim(), children: "\u521B\u5EFA" }), _jsx("button", { onClick: () => {
                                            setShowNewDeckModal(false);
                                            setNewDeckName('');
                                            setNewDeckDescription('');
                                        }, className: "card-deck-modal-btn close", children: "\u53D6\u6D88" })] })] }) }))] }) }));
};
export default CardDeck;
