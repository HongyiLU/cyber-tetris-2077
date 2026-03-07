// ==================== 敌人类型定义 ====================

/**
 * 敌人类型接口
 * 定义不同敌人的属性和行为
 */
export interface EnemyType {
  /** 敌人唯一标识 */
  id: string;
  /** 敌人名称 */
  name: string;
  /** 敌人表情符号/头像 */
  emoji: string;
  /** 敌人血量 */
  hp: number;
  /** 攻击间隔（毫秒） */
  attackInterval: number;
  /** 攻击伤害 */
  attackDamage: number;
  /** 攻击时生成的垃圾行数 */
  garbageRows: number;
  /** 敌人描述 */
  description: string;
  /** 敌人稀有度（影响解锁难度） */
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

/**
 * 敌人实例接口
 * 用于战斗中的具体敌人实例
 */
export interface EnemyInstance {
  /** 敌人类型 ID */
  typeId: string;
  /** 当前血量 */
  currentHp: number;
  /** 最大血量 */
  maxHp: number;
  /** 上次攻击时间 */
  lastAttackTime: number;
}
