/**
 * 简化的LRU缓存管理器
 * 用于缓存 Ant Design 组件文档、API 定义、示例代码等
 */
interface CacheItem<T> {
  value: T;
  timestamp: number;
  ttl?: number;
}

export class LRUCache<T = any> {
  private cache: Map<string, CacheItem<T>>;
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize: number = 100, defaultTTL: number = 3600) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL * 1000; // 转换为毫秒
  }

  /**
   * 设置缓存
   */
  set(key: string, value: T, ttl?: number): this {
    // 如果已存在，先删除（为了更新LRU顺序）
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // 如果缓存已满，删除最旧的项
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    const item: CacheItem<T> = {
      value,
      timestamp: Date.now(),
      ttl: ttl ? ttl * 1000 : this.defaultTTL
    };

    this.cache.set(key, item);
    return this;
  }

  /**
   * 获取缓存
   */
  get(key: string): T | undefined {
    const item = this.cache.get(key);
    
    if (!item) {
      return undefined;
    }

    // 检查是否过期
    if (this.isExpired(item)) {
      this.cache.delete(key);
      return undefined;
    }

    // 更新LRU顺序：删除后重新添加
    this.cache.delete(key);
    this.cache.set(key, item);
    
    return item.value;
  }

  /**
   * 检查缓存是否存在且未过期
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (this.isExpired(item)) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存大小
   */
  getSize(): number {
    this.cleanExpired();
    return this.cache.size;
  }

  /**
   * 获取所有有效的缓存键
   */
  keys(): string[] {
    this.cleanExpired();
    return Array.from(this.cache.keys());
  }

  /**
   * 检查项是否过期
   */
  private isExpired(item: CacheItem<T>): boolean {
    if (!item.ttl) return false;
    return Date.now() - item.timestamp > item.ttl;
  }

  /**
   * 清理过期项
   */
  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    this.cleanExpired();
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0
    };
  }
}

// 创建全局缓存实例
export const globalCache = new LRUCache(200, 600); // 200个项目，10分钟TTL

export default LRUCache; 