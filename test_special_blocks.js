// 特殊方块数据流测试
import { GAME_CONFIG } from './src/config/game-config';
import { CARD_DATABASE } from './src/core/CardDatabase';

console.log('=== 特殊方块数据流测试 ===\n');

// 1. 检查 GAME_CONFIG.CARDS 中的特殊方块 ID
console.log('1. GAME_CONFIG.CARDS 中的特殊方块:');
const specialCards = GAME_CONFIG.CARDS.filter(c => c.type === 'special');
specialCards.forEach(card => {
  console.log(`   - ${card.id}`);
});

// 2. 检查 GAME_CONFIG.SHAPES 中的键
console.log('\n2. GAME_CONFIG.SHAPES 中的特殊方块:');
const specialShapes = Object.keys(GAME_CONFIG.SHAPES).filter(k => 
  ['bomb_block', 'time_stop', 'heal_block', 'shield_block', 'combo_block', 'clear_block', 'lucky_block', 'freeze_block', 'fire_block', 'lightning_block'].includes(k)
);
specialShapes.forEach(key => {
  console.log(`   - ${key}: ${JSON.stringify(GAME_CONFIG.SHAPES[key])}`);
});

// 3. 检查 CardDatabase 中的特殊方块
console.log('\n3. CardDatabase 中的特殊方块:');
const specialBlockIds = ['bomb_block', 'time_stop', 'heal_block', 'shield_block', 'combo_block', 'clear_block', 'lucky_block', 'freeze_block', 'fire_block', 'lightning_block'];
specialBlockIds.forEach(id => {
  const card = CARD_DATABASE.getCard(id);
  if (card) {
    console.log(`   ✅ ${id}: blockType=${card.blockType}, special=${card.special}`);
  } else {
    console.log(`   ❌ ${id}: 未找到`);
  }
});

// 4. 模拟数据流
console.log('\n4. 模拟数据流测试:');
const testCardId = 'bomb_block';
console.log(`   从卡组抽取：cardId = '${testCardId}'`);
console.log(`   pieceType = cardId = '${testCardId}'`);

const shape = GAME_CONFIG.SHAPES[testCardId as keyof typeof GAME_CONFIG.SHAPES];
const color = GAME_CONFIG.COLORS[testCardId as keyof typeof GAME_CONFIG.COLORS];
console.log(`   GAME_CONFIG.SHAPES['${testCardId}'] = ${shape ? JSON.stringify(shape) : 'undefined'}`);
console.log(`   GAME_CONFIG.COLORS['${testCardId}'] = ${color || 'undefined'}`);

const card = CARD_DATABASE.getCard(testCardId);
console.log(`   CARD_DATABASE.getCard('${testCardId}') = ${card ? `✅ ${card.name}` : '❌ undefined'}`);
console.log(`   card.special = ${card?.special || 'undefined'}`);

console.log('\n=== 测试完成 ===');
