const fs = require('fs');
const path = require('path');

const files = [
  'src/__tests__/BattleSystem.test.ts',
  'src/__tests__/GameEngine.test.ts',
  'src/App.tsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 替换 initBattle(数字) 为 initBattle('slime')
  content = content.replace(/initBattle\(\d+\)/g, 'initBattle(\'slime\')');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed: ${file}`);
});

console.log('Done!');
