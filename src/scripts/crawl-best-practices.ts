/**
 * Ant Design 最佳实践爬虫工具
 * 
 * 该文件实现了一个多源爬虫系统，用于搜集 Ant Design 组件的最佳实践信息
 * 支持从以下数据源获取信息：
 * 1. Ant Design 官方文档
 * 2. GitHub Issues 和 PR
 * 3. 社区博客（掘金）
 * 
 * 爬虫遵循 robots.txt 协议，并实现了请求频率限制
 * 
 * 使用方法：
 * - 爬取所有组件: npm run crawl-practices
 * - 爬取指定组件: npm run crawl-practices Button Table
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { loadComponentsList } from '../utils/index.js';

// 获取项目根目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

/**
 * 搜索结果接口定义
 */
interface SearchResult {
    title: string;     // 结果标题
    url: string;       // 结果链接
    snippet: string;   // 内容摘要
    source: 'antd' | 'github' | 'community';  // 数据源类型
    relevance: number; // 相关性评分（0-100）
}

/**
 * 最佳实践数据结构
 */
interface BestPracticeData {
    componentName: string;
    updateTime: string;
    totalResults: number;
    sources: {
        antd: SearchResult[];
        github: SearchResult[];
        community: SearchResult[];
    };
    summary: string;
}

/**
 * robots.txt 规则接口定义
 */
interface RobotsTxtRule {
    userAgent: string;    // 用户代理
    disallow: string[];   // 禁止访问的路径
    allow: string[];      // 允许访问的路径
    crawlDelay?: number;  // 爬取延迟（秒）
}

/**
 * 带延迟的 fetch 请求函数
 * 用于控制请求频率，避免对目标服务器造成过大压力
 * 
 * @param url - 请求的 URL
 * @param delay - 延迟时间（毫秒），默认 1000ms
 * @param options - fetch 选项
 * @returns Promise<Response>
 */
async function fetchWithDelay(url: string, delay: number = 1000, options?: RequestInit): Promise<Response> {
    // 等待指定的延迟时间
    await new Promise(resolve => setTimeout(resolve, delay));
    return fetch(url, options);
}

/**
 * 解析 robots.txt 文件
 * 获取网站的爬虫访问规则
 * 
 * @param domain - 目标域名
 * @returns Promise<RobotsTxtRule[]> - 解析后的规则数组
 */
async function parseRobotsTxt(domain: string): Promise<RobotsTxtRule[]> {
    const robotsUrl = `${domain}/robots.txt`;
    try {
      const response = await fetchWithDelay(robotsUrl);
      if (!response.ok) return [];
      
      const text = await response.text();
      const rules: RobotsTxtRule[] = [];
      let currentRule: RobotsTxtRule | null = null;
      
      // 逐行解析 robots.txt 内容
      text.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return; // 跳过空行和注释
        
        const [directive, value] = trimmed.split(':').map(s => s.trim());
        
        switch (directive.toLowerCase()) {
          case 'user-agent':
            // 开始新的用户代理规则
            if (currentRule) rules.push(currentRule);
            currentRule = { userAgent: value, disallow: [], allow: [] };
            break;
          case 'disallow':
            // 添加禁止访问的路径
            if (currentRule && value) currentRule.disallow.push(value);
            break;
          case 'allow':
            // 添加允许访问的路径
            if (currentRule && value) currentRule.allow.push(value);
            break;
          case 'crawl-delay':
            // 设置爬取延迟
            if (currentRule && value) currentRule.crawlDelay = parseInt(value);
            break;
        }
      });
      
      // 添加最后一个规则
      if (currentRule) rules.push(currentRule);
      return rules;
    } catch (error) {
      console.error(`Error parsing robots.txt for ${domain}:`, error);
      return [];
    }
}

/**
 * 检查 URL 是否被 robots.txt 允许访问
 * 
 * @param url - 要检查的 URL
 * @param rules - robots.txt 规则数组
 * @returns boolean - 是否允许访问
 */
function isUrlAllowed(url: string, rules: RobotsTxtRule[]): boolean {
    // 查找适用的用户代理规则（只检查通用规则 *）
    const userAgentRule = rules.find(rule => rule.userAgent === '*');
    
    if (!userAgentRule) return true; // 没有规则则默认允许
    
    const path = new URL(url).pathname;
    
    // 检查是否在禁止列表中
    const isDisallowed = userAgentRule.disallow.some(disallowedPath => {
      if (disallowedPath === '') return false; // 空 Disallow 允许所有
      const regex = new RegExp(`^${disallowedPath.replace(/\*/g, '.*')}`);
      return regex.test(path);
    });
    
    // 检查是否在允许列表中
    const isAllowed = userAgentRule.allow.some(allowedPath => {
      const regex = new RegExp(`^${allowedPath.replace(/\*/g, '.*')}`);
      return regex.test(path);
    });
    
    // 允许列表优先级高于禁止列表
    return isAllowed || !isDisallowed;
}

/**
 * 爬取 Ant Design 官方文档
 * 从组件的官方文档页面提取相关的最佳实践信息
 * 
 * @param componentName - 组件名称
 * @param keywords - 搜索关键词数组
 * @returns Promise<SearchResult[]> - 搜索结果数组
 */
async function crawlAntdDocs(componentName: string, keywords: string[]): Promise<SearchResult[]> {
    const domain = 'https://ant.design';
    const robotsRules = await parseRobotsTxt(domain);
    
    const url = `${domain}/components/${componentName.toLowerCase()}-cn`;
    
    // 检查是否允许爬取该 URL
    if (!isUrlAllowed(url, robotsRules)) {
      console.log(`Skipping ${url} due to robots.txt restrictions`);
      return [];
    }
    
    try {
      console.log(`  正在爬取 Ant Design 官方文档: ${componentName}`);
      const response = await fetchWithDelay(url, 1500);
      if (!response.ok) {
        console.warn(`  官方文档访问失败: ${response.status}`);
        return [];
      }
      
      const html = await response.text();
      
      // 提取页面标题
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : `Ant Design ${componentName} 文档`;
      
      // 提取主要内容段落
      const contentMatches = html.match(/<p[^>]*>([^<]+)<\/p>/gi) || [];
      
      console.log(`  从官方文档提取到 ${contentMatches.length} 条原始信息`);
      const results = contentMatches
        .map((match, index) => {
          const text = match.replace(/<[^>]*>/g, '').trim();
          if (!text || text.length < 20) return null;
          
          // 计算关键词在内容中的匹配数量
          const keywordMatches = keywords.filter(kw => 
            text.toLowerCase().includes(kw.toLowerCase()) ||
            title.toLowerCase().includes(kw.toLowerCase())
          ).length;
          
          // 计算相关性评分：关键词匹配度 + 内容长度奖励 + 官方权威性奖励
          const relevance = Math.min(100, keywordMatches * 25 + (text.length > 100 ? 15 : 0) + 20);
          
          return {
            title: `${title} - 段落 ${index + 1}`,
            url,
            snippet: text.slice(0, 200) + (text.length > 200 ? '...' : ''),
            source: 'antd' as const,
            relevance
          } as SearchResult;
        })
        .filter((result) => result !== null && result.relevance > 0) as SearchResult[];
      
      console.log(`  从官方文档提取到 ${results.length} 条相关信息`);
      return results;
    } catch (error) {
      console.error(`  爬取 Ant Design 文档时出错 (${componentName}):`, error);
      return [];
    }
}

/**
 * 爬取 GitHub 相关内容
 * 从 Ant Design 仓库的 Issues 和 PR 中搜索相关讨论
 * 
 * @param componentName - 组件名称
 * @param keywords - 搜索关键词数组
 * @returns Promise<SearchResult[]> - 搜索结果数组
 */
async function crawlGitHub(componentName: string, keywords: string[]): Promise<SearchResult[]> {
    try {
      console.log(`  正在搜索 GitHub 相关讨论: ${componentName}`);
      
      // 构建 GitHub 搜索查询
      // 搜索范围：标题、内容、评论；仓库：ant-design/ant-design；按反应数排序
      const query = encodeURIComponent(
        `${componentName} ${keywords.join(' ')} in:title,body,comments repo:ant-design/ant-design`
      );
      const url = `https://api.github.com/search/issues?q=${query}&sort=reactions&order=desc&per_page=30`;
      
      console.log(`  🔍 GitHub 搜索查询: ${componentName} ${keywords.join(' ')}`);
      console.log(`  🌐 完整 URL: ${url}`);
      
      // 添加必要的请求头
      const headers: any = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Ant-Design-Best-Practices-Crawler/1.0'
      };
      
      console.log(`  📡 发送请求...`);
      const response = await fetchWithDelay(url, 2000, { headers }); // GitHub API 需要更长的延迟
      
      console.log(`  📡 GitHub API 响应状态: ${response.status}`);
      console.log(`  📡 响应头 Content-Type: ${response.headers.get('content-type')}`);
      
      if (!response.ok) {
        if (response.status === 403) {
          console.warn('  ⚠️  GitHub API 访问限制，跳过 GitHub 搜索');
          console.warn('  💡 建议：设置 GITHUB_TOKEN 环境变量以增加 API 限制');
        } else if (response.status === 422) {
          console.warn('  ⚠️  GitHub API 查询格式错误');
        } else {
          console.warn(`  ⚠️  GitHub API 访问失败: ${response.status} ${response.statusText}`);
        }
        
        // 尝试获取错误详情
        try {
          const errorText = await response.text();
          console.warn('  🔍 错误响应内容:', errorText.slice(0, 200));
        } catch (e) {
          console.warn('  🔍 无法获取错误响应内容');
        }
        
        return [];
      }
      
      console.log(`  📄 解析响应数据...`);
      const data = await response.json();
      
      console.log(`  📊 从 GitHub API 获取到 ${data.items?.length || 0} 条原始信息 (总计: ${data.total_count || 0})`);
      
      // 详细调试信息
      if (!data.items) {
        console.log(`  ❌ data.items 为空或未定义`);
        console.log(`  🔍 响应数据结构:`, Object.keys(data));
        return [];
      }
      
      if (data.items.length === 0) {
        console.log(`  ❌ GitHub 搜索无结果，total_count: ${data.total_count}`);
        console.log(`  💡 建议：尝试在浏览器中访问URL确认是否有数据`);
        return [];
      }
      
      console.log(`  🔍 前3个结果概览:`);
      data.items.slice(0, 3).forEach((item: any, index: number) => {
        console.log(`    ${index + 1}. "${item.title}" (#${item.number})`);
        console.log(`       反应: ${item.reactions?.total_count || 0}, 评论: ${item.comments || 0}, 状态: ${item.state}`);
      });
      
      const results = (data.items || []).map((item: any, index: number) => {
        const title = item.title || '';
        const body = item.body || '';
        const snippet = body.slice(0, 200);
        const reactions = item.reactions?.total_count || 0;
        const comments = item.comments || 0;
        const isOpen = item.state === 'open';
        
        // 计算关键词在标题和内容中的匹配数量
        const keywordMatches = keywords.filter(kw => 
          title.toLowerCase().includes(kw.toLowerCase()) || 
          body.toLowerCase().includes(kw.toLowerCase())
        ).length;
        
        // 计算相关性评分：
        // - 关键词匹配度：每个匹配关键词 +20分
        // - 社区活跃度：反应数量 * 0.5 (最多+25分) + 评论数量 * 0.1 (最多+10分)
        // - 状态加权：开放状态的 issue +5分（更具时效性）
        // - GitHub 平台权重：+15分
        const activityScore = Math.min(25, reactions * 0.5) + Math.min(10, comments * 0.1);
        const statusBonus = isOpen ? 5 : 0;
        const relevance = Math.min(100, 
          keywordMatches * 20 + 
          activityScore + 
          statusBonus + 
          15
        );
        
        const result = {
          title,
          url: item.html_url,
          snippet: snippet + (snippet.length >= 200 ? '...' : ''),
          source: 'github' as const,
          relevance
        } as SearchResult;
        
        // 显示前3个结果的详细评分
        if (index < 3) {
          console.log(`    第${index + 1}项详细评分:`);
          console.log(`      关键词匹配: ${keywordMatches} 个 (${keywordMatches * 20}分)`);
          console.log(`      活跃度: ${Math.round(activityScore)}分 (反应:${reactions}, 评论:${comments})`);
          console.log(`      状态加分: ${statusBonus}分 (${isOpen ? '开放' : '关闭'})`);
          console.log(`      总相关性: ${relevance}分`);
        }
        
        return result;
      }).filter((result: SearchResult) => result.relevance > 0); // 降低门槛，获取更多相关结果
      
      console.log(`  ✅ 从 GitHub 提取到 ${results.length} 条相关信息`);
      
      if (results.length === 0) {
        console.log(`  ❌ 过滤后无有效结果`);
        console.log(`  💡 建议：检查关键词匹配逻辑或降低相关性门槛`);
      } else {
        console.log(`  🏆 相关性最高的3个结果:`);
        results.slice(0, 3).forEach((result: SearchResult, index: number) => {
          console.log(`    ${index + 1}. [${result.relevance}分] ${result.title.slice(0, 50)}...`);
        });
      }
      
      return results;
    } catch (error) {
      console.error(`  爬取 GitHub 时出错 (${componentName}):`, error);
      return [];
    }
}

/**
 * 爬取社区博客内容
 * 模拟从技术社区获取相关的技术文章
 * 
 * @param componentName - 组件名称
 * @param keywords - 搜索关键词数组
 * @returns Promise<SearchResult[]> - 搜索结果数组
 */
async function crawlCommunityBlogs(componentName: string, keywords: string[]): Promise<SearchResult[]> {
    try {
      console.log(`  正在搜索社区博客: ${componentName}`);
      
      const query = encodeURIComponent(`Ant Design ${componentName} ${keywords.join(' ')}`);
      const url = `https://api.juejin.cn/search_api/v1/search?query=${query}&type=0`;

      const response = await fetchWithDelay(url, 2000);
      if (!response.ok) {
        console.warn(` 社区博客访问失败: ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      
      console.log(`  从社区博客提取到 ${data.data.length} 条相关信息`);
      return data.data.map((item: any) => {
        const title = item.result_model.article_info.title;
        const content = item.result_model.article_info.brief_content;
        
        // 计算关键词在标题和内容中的匹配数量
        const keywordMatches = keywords.filter(kw => 
          title.toLowerCase().includes(kw.toLowerCase()) || 
          content.toLowerCase().includes(kw.toLowerCase())
        ).length;
        
        // 计算相关性评分：关键词匹配度 + 内容长度奖励 + 社区权重
        const relevance = Math.min(100, keywordMatches * 20 + (content.length > 100 ? 10 : 0) + 30);
        
        return {
          title,
          url: `https://juejin.cn/post/${item.result_model.article_id}`,
          snippet: content.slice(0, 200) + (content.length > 200 ? '...' : ''),
          source: 'community' as const,
          relevance
        };
      });
    } catch (error) {
      console.error(`  爬取社区博客时出错 (${componentName}):`, error);
      return [];
    }
}

/**
 * 生成最佳实践总结
 */
function generateSummary(componentName: string, results: SearchResult[]): string {
    const totalResults = results.length;
    const sourceStats = {
        antd: results.filter(r => r.source === 'antd').length,
        github: results.filter(r => r.source === 'github').length,
        community: results.filter(r => r.source === 'community').length
    };
    
    return `# ${componentName} 组件最佳实践总结

## 数据概览
- 总计收集信息: ${totalResults} 条
- 官方文档: ${sourceStats.antd} 条
- GitHub 讨论: ${sourceStats.github} 条  
- 社区博客: ${sourceStats.community} 条

## 主要收获
${results.slice(0, 3).map((result, index) => 
    `${index + 1}. **${result.title}**\n   ${result.snippet}`
).join('\n\n')}

---
*数据更新时间: ${new Date().toLocaleString('zh-CN')}*
`;
}

/**
 * 将爬取结果写入文件
 */
async function saveBestPractices(componentName: string, results: SearchResult[]): Promise<void> {
    const componentDir = path.join(rootDir, 'practice/components', componentName.toLowerCase());
    const crawledFile = path.join(componentDir, 'crawled.md');
    
    try {
        // 确保目录存在
        if (!fs.existsSync(componentDir)) {
            fs.mkdirSync(componentDir, { recursive: true });
        }
        
        // 构建最佳实践数据
        const practiceData: BestPracticeData = {
            componentName,
            updateTime: new Date().toISOString(),
            totalResults: results.length,
            sources: {
                antd: results.filter(r => r.source === 'antd'),
                github: results.filter(r => r.source === 'github'),
                community: results.filter(r => r.source === 'community')
            },
            summary: generateSummary(componentName, results)
        };
        
        // 生成 Markdown 内容
        const markdownContent = `# ${componentName} 组件最佳实践

> 更新时间: ${new Date().toLocaleString('zh-CN')}  
> 数据来源: Ant Design 官方文档、GitHub Issues/PR、技术社区

## 📊 数据统计

- **总计收集**: ${results.length} 条信息
- **官方文档**: ${practiceData.sources.antd.length} 条
- **GitHub 讨论**: ${practiceData.sources.github.length} 条
- **社区博客**: ${practiceData.sources.community.length} 条

## 🏆 高质量内容

${results
  .filter(r => r.relevance !== undefined && r.relevance >= 60)
  .slice(0, 5)
  .map((result, index) => `### ${index + 1}. ${result.title}

**来源**: ${result.source === 'antd' ? '官方文档' : result.source === 'github' ? 'GitHub' : '社区博客'}  
**链接**: ${result.url}  
**相关性**: ${result.relevance}%

${result.snippet}

---`).join('\n\n')}

## 📋 完整数据列表

### Ant Design 官方文档 (${practiceData.sources.antd.length} 条)

${practiceData.sources.antd.map((result, index) => 
`${index + 1}. **${result.title}** (相关性: ${result.relevance || 0}%)
   - 链接: ${result.url}
   - 摘要: ${result.snippet}`
).join('\n\n') || '暂无数据'}

### GitHub 讨论 (${practiceData.sources.github.length} 条)

${practiceData.sources.github.map((result, index) => 
`${index + 1}. **${result.title}** (相关性: ${result.relevance || 0}%)
   - 链接: ${result.url}
   - 摘要: ${result.snippet}`
).join('\n\n') || '暂无数据'}

### 社区博客 (${practiceData.sources.community.length} 条)

${practiceData.sources.community.map((result, index) => 
`${index + 1}. **${result.title}** (相关性: ${result.relevance || 0}%)
   - 链接: ${result.url}
   - 摘要: ${result.snippet}`
).join('\n\n') || '暂无数据'}

## 💡 使用建议

基于收集到的信息，建议在使用 ${componentName} 组件时注意以下几点：

1. **性能优化**: 关注组件的渲染性能和数据处理效率
2. **用户体验**: 确保组件交互符合用户习惯和无障碍设计标准  
3. **最佳实践**: 遵循官方文档推荐的使用方式
4. **社区反馈**: 参考 GitHub 上的常见问题和解决方案

---

*此文档由 Ant Design 最佳实践爬虫自动生成*
`;
        
        // 写入文件
        fs.writeFileSync(crawledFile, markdownContent, 'utf8');
        console.log(`✅ 已保存到: ${crawledFile}`);
        
    } catch (error) {
        console.error(`❌ 保存文件失败 (${componentName}):`, error);
    }
}

/**
 * 搜索最佳实践的主入口函数
 * 并行从多个数据源搜索指定组件的最佳实践信息
 * 
 * @param componentName - 组件名称
 * @param keywords - 搜索关键词数组，默认为 ['最佳实践']
 * @returns Promise<SearchResult[]> - 按相关性排序的搜索结果数组
 */
export async function searchBestPractices(
    componentName: string,
    keywords: string[] = ['最佳实践', '使用技巧', '注意事项']
): Promise<SearchResult[]> {
    console.log(`🔍 开始搜索 ${componentName} 组件的最佳实践...`);
    
    // 并行爬取所有数据源，提高效率
    const [antdResults, githubResults, communityResults] = await Promise.all([
      crawlAntdDocs(componentName, keywords),
      crawlGitHub(componentName, keywords),
      crawlCommunityBlogs(componentName, keywords)
    ]);
    
    // 合并所有结果
    const allResults = [...antdResults, ...githubResults, ...communityResults];
    
    // 过滤低相关性结果并按相关性降序排序
    const filteredResults = allResults
      .filter(result => result.relevance !== undefined && result.relevance >= 30) // 过滤相关性低于 30 的结果
      .sort((a, b) => (b.relevance || 0) - (a.relevance || 0)); // 按相关性降序排序
    
    console.log(`📊 ${componentName} 搜索完成，共收集到 ${filteredResults.length} 条有效信息`);
    return filteredResults;
}

/**
 * 批量处理组件列表
 */
export async function processComponents(componentNames: string[]): Promise<void> {
    if(componentNames.length === 0){
        const componentsList = await loadComponentsList();
        componentNames = componentsList.map((component: any) => typeof component === 'string' ? component : component.name || component.componentName);
    }

    console.log(`🚀 开始批量处理 ${componentNames.length} 个组件...\n`);
    
    const startTime = Date.now();
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < componentNames.length; i++) {
        const componentName = componentNames[i];
        console.log(`\n[${i + 1}/${componentNames.length}] 处理组件: ${componentName}`);
        console.log('='.repeat(50));
        
        try {
            const results = await searchBestPractices(componentName);
            await saveBestPractices(componentName, results);
            successCount++;
            
            // 添加组件间的延迟，避免请求过于频繁
            if (i < componentNames.length - 1) {
                console.log('⏳ 等待 3 秒后处理下一个组件...');
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
            
        } catch (error) {
            console.error(`❌ 处理组件 ${componentName} 时出错:`, error);
            failCount++;
        }
    }
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 批量处理完成！');
    console.log(`📈 统计信息:`);
    console.log(`  - 总耗时: ${duration} 秒`);
    console.log(`  - 成功处理: ${successCount} 个组件`);
    console.log(`  - 失败数量: ${failCount} 个组件`);
    console.log(`  - 成功率: ${Math.round(successCount / componentNames.length * 100)}%`);
}