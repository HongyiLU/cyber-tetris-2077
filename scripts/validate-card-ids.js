/**
 * 卡牌 ID 一致性验证脚本
 * 
 * 使用方法：
 * 1. 在浏览器控制台中运行
 * 2. 或在 Node.js 环境中运行（需要构建后）
 * 
 * 验证内容：
 * - GAME_CONFIG.CARDS 中的 ID 是否存在于 CardDatabase
 * - CardDatabase 中的卡牌是否有对应的 SHAPE 和 COLOR
 */

// 在浏览器控制台中运行以下代码：
(function validateCardIds() {
  console.log('=== 卡牌 ID 一致性验证 ===\n');
  
  const errors = [];
  const warnings = [];
  
  // 检查 GAME_CONFIG.CARDS 中的每张卡牌
  GAME_CONFIG.CARDS.forEach(card => {
    const dbCard = CARD_DATABASE.getCard(card.id);
    
    if (!dbCard) {
      errors.push(`❌ 卡牌 "${card.id}" 在 CardDatabase 中不存在`);
    } else {
      console.log(`✅ ${card.id}: ${dbCard.name}`);
    }
    
    // 检查是否有对应的 shape
    if (!GAME_CONFIG.SHAPES[card.id]) {
      warnings.push(`⚠️  卡牌 "${card.id}" 在 SHAPES 中没有定义`);
    }
    
    // 检查是否有对应的 color
    if (!GAME_CONFIG.COLORS[card.id]) {
      warnings.push(`⚠️  卡牌 "${card.id}" 在 COLORS 中没有定义`);
    }
  });
  
  // 检查 CardDatabase 中的所有卡牌
  const allCards = CARD_DATABASE.getAllCards();
  console.log(`\nCardDatabase 共有 ${allCards.length} 张卡牌\n`);
  
  allCards.forEach(card => {
    const configCard = GAME_CONFIG.CARDS.find(c => c.id === card.id);
    
    if (!configCard) {
      warnings.push(`⚠️  CardDatabase 中的卡牌 "${card.id}" 在 GAME_CONFIG.CARDS 中没有定义`);
    }
    
    // 检查 blockType 是否有效
    if (!GAME_CONFIG.SHAPES[card.blockType]) {
      errors.push(`❌ 卡牌 "${card.id}" 的 blockType "${card.blockType}" 在 SHAPES 中没有定义`);
    }
  });
  
  // 输出结果
  console.log('\n=== 验证结果 ===\n');
  
  if (errors.length > 0) {
    console.error('❌ 错误:', errors.length);
    errors.forEach(e => console.error(e));
  } else {
    console.log('✅ 没有发现错误');
  }
  
  if (warnings.length > 0) {
    console.warn('\n⚠️  警告:', warnings.length);
    warnings.forEach(w => console.warn(w));
  } else {
    console.log('✅ 没有发现警告');
  }
  
  console.log('\n=== 验证完成 ===');
})();
