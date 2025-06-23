#!/usr/bin/env node

import { writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { existsSync } from "node:fs";
import { 
  loadComponentsList, 
  writeJsonFile 
} from "../utils/index.js";
import { 
  BEST_PRACTICES_COMPONENTS_PATH,
  CRAWLED_PRACTICE_FILE_NAME,
  BEST_PRACTICES_DIR 
} from "../path.js";

interface CrawlSource {
  name: string;
  url: string;
  selector?: string;
  transform?: (content: string) => string;
}

// 定义爬取源配置
const CRAWL_SOURCES: CrawlSource[] = [
  {
    name: "Ant Design官方最佳实践",
    url: "https://ant.design/docs/react/practical-projects-cn",
  },
  {
    name: "GitHub讨论",
    url: "https://github.com/ant-design/ant-design/discussions",
  },
  {
    name: "社区博客",
    url: "https://juejin.cn/tag/Ant%20Design",
  }
];

/**
 * 模拟爬取单个组件的最佳实践
 * 注意：这是一个示例实现，实际爬取需要根据具体网站结构调整
 */
async function crawlComponentBestPractice(componentName: string): Promise<string> {
  // 这里是模拟的爬取逻辑
  // 实际实现时需要使用真实的爬虫库如 puppeteer, cheerio 等
  
  const mockPractices = [
    `### ${componentName} 使用建议

1. **性能优化**
   - 避免在渲染循环中创建新的对象
   - 使用 useMemo 和 useCallback 优化重渲染
   - 合理设置 shouldUpdate 条件

2. **用户体验**
   - 提供合适的加载状态
   - 设置合理的默认值
   - 考虑无障碍访问性（a11y）

3. **代码组织**
   - 将复杂逻辑抽取为自定义 Hook
   - 使用 TypeScript 提升类型安全
   - 遵循组件单一职责原则`,

    `### 常见问题解决方案

1. **样式冲突**
   - 使用 CSS Modules 或 styled-components
   - 避免全局样式污染
   - 合理使用 CSS-in-JS

2. **数据管理**
   - 复杂状态使用 useReducer
   - 跨组件状态考虑 Context
   - 大型应用使用状态管理库

3. **测试策略**
   - 单元测试覆盖核心逻辑
   - 集成测试验证用户交互
   - 快照测试确保UI稳定性`
  ];

  // 随机选择一些实践内容（实际应该从真实源爬取）
  const selectedPractices = mockPractices.slice(0, Math.floor(Math.random() * 2) + 1);
  
  return selectedPractices.join('\n\n');
}

/**
 * 确保目录存在
 */
async function ensureDirectoryExists(dirPath: string) {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true });
  }
}

/**
 * 爬取所有组件的最佳实践
 */
async function crawlAllBestPractices() {
  console.log("开始爬取组件最佳实践...");
  
  try {
    // 确保最佳实践目录存在
    await ensureDirectoryExists(BEST_PRACTICES_DIR);
    await ensureDirectoryExists(BEST_PRACTICES_COMPONENTS_PATH);

    // 获取所有组件列表
    const components = await loadComponentsList();
    console.log(`找到 ${components.length} 个组件`);

    interface CrawlResult {
      component: string;
      status: "success" | "failed";
      filePath?: string;
      error?: string;
    }

    const results: CrawlResult[] = [];
    
    for (const component of components) {
      console.log(`正在爬取 ${component.name} 的最佳实践...`);
      
      try {
        // 确保组件目录存在
        const componentDir = join(BEST_PRACTICES_COMPONENTS_PATH, component.dirName);
        await ensureDirectoryExists(componentDir);
        
        // 爬取最佳实践内容
        const bestPracticeContent = await crawlComponentBestPractice(component.name);
        
        // 保存到文件
        const crawledFilePath = join(componentDir, CRAWLED_PRACTICE_FILE_NAME);
        await writeFile(crawledFilePath, bestPracticeContent, "utf-8");
        
        results.push({
          component: component.name,
          status: "success",
          filePath: crawledFilePath
        });
        
        console.log(`✅ ${component.name} 最佳实践已保存`);
        
        // 添加延迟避免请求过频
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ 爬取 ${component.name} 失败:`, error);
        results.push({
          component: component.name,
          status: "failed",
          error: (error as Error).message
        });
      }
    }

    // 保存爬取结果摘要
    const summaryPath = join(BEST_PRACTICES_DIR, "crawl-summary.json");
    await writeJsonFile(summaryPath, {
      timestamp: new Date().toISOString(),
      totalComponents: components.length,
      successCount: results.filter(r => r.status === "success").length,
      failedCount: results.filter(r => r.status === "failed").length,
      results
    });

    console.log("\n爬取完成！");
    console.log(`成功: ${results.filter(r => r.status === "success").length}`);
    console.log(`失败: ${results.filter(r => r.status === "failed").length}`);
    console.log(`总计: ${results.length}`);
    
  } catch (error) {
    console.error("爬取过程中出现错误:", error);
    process.exit(1);
  }
}

/**
 * 爬取特定组件的最佳实践
 */
async function crawlComponentPractice(componentName: string) {
  console.log(`开始爬取 ${componentName} 的最佳实践...`);
  
  try {
    // 确保目录存在
    await ensureDirectoryExists(BEST_PRACTICES_DIR);
    await ensureDirectoryExists(BEST_PRACTICES_COMPONENTS_PATH);

    // 查找组件
    const components = await loadComponentsList();
    const component = components.find(c => 
      c.name.toLowerCase() === componentName.toLowerCase() ||
      c.dirName.toLowerCase() === componentName.toLowerCase()
    );

    if (!component) {
      console.error(`❌ 未找到组件: ${componentName}`);
      process.exit(1);
    }

    // 确保组件目录存在
    const componentDir = join(BEST_PRACTICES_COMPONENTS_PATH, component.dirName);
    await ensureDirectoryExists(componentDir);
    
    // 爬取最佳实践内容
    const bestPracticeContent = await crawlComponentBestPractice(component.name);
    
    // 保存到文件
    const crawledFilePath = join(componentDir, CRAWLED_PRACTICE_FILE_NAME);
    await writeFile(crawledFilePath, bestPracticeContent, "utf-8");
    
    console.log(`✅ ${component.name} 最佳实践已保存到: ${crawledFilePath}`);
    
  } catch (error) {
    console.error("爬取过程中出现错误:", error);
    process.exit(1);
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // 爬取所有组件
    await crawlAllBestPractices();
  } else if (args.length === 1) {
    // 爬取特定组件
    await crawlComponentPractice(args[0]);
  } else {
    console.log("用法:");
    console.log("  npm run crawl-practices           # 爬取所有组件");
    console.log("  npm run crawl-practices button    # 爬取特定组件");
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { crawlAllBestPractices, crawlComponentPractice }; 