import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";
import {
  BEST_PRACTICES_COMPONENTS_PATH,
  PRESET_PRACTICE_FILE_NAME,
  CRAWLED_PRACTICE_FILE_NAME,
} from "../../path.js";
import { globalCache } from "../cache/index.js";

export interface BestPracticeData {
  componentName: string;
  preset?: string;
  crawled?: string;
  combined?: string;
}

export interface PracticeComponent {
  name: string;
  dirName: string;
  hasPreset: boolean;
  hasCrawled: boolean;
}

/**
 * 获取practice目录下所有可用的组件列表
 * @returns 可用的最佳实践组件列表
 */
export const getPracticeComponentsList = async (): Promise<PracticeComponent[]> => {
  try {
    const cacheKey = 'practiceComponentsList';
    const cached = globalCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    if (!existsSync(BEST_PRACTICES_COMPONENTS_PATH)) {
      return [];
    }

    const dirs = await readdir(BEST_PRACTICES_COMPONENTS_PATH, { withFileTypes: true });
    const components: PracticeComponent[] = [];

    for (const dir of dirs) {
      if (dir.isDirectory()) {
        const componentDir = join(BEST_PRACTICES_COMPONENTS_PATH, dir.name);
        const presetPath = join(componentDir, PRESET_PRACTICE_FILE_NAME);
        const crawledPath = join(componentDir, CRAWLED_PRACTICE_FILE_NAME);
        
        const hasPreset = existsSync(presetPath);
        const hasCrawled = existsSync(crawledPath);
        
        if (hasPreset || hasCrawled) {
          components.push({
            name: dir.name,
            dirName: dir.name,
            hasPreset,
            hasCrawled
          });
        }
      }
    }

    globalCache.set(cacheKey, components);
    return components;
  } catch (error) {
    console.error(`获取practice组件列表错误: ${(error as Error).message}`);
    return [];
  }
};

/**
 * 根据组件名称在practice目录中查找组件
 * @param componentName 组件名称
 * @returns 找到的组件信息，如果未找到则返回null
 */
export const findPracticeComponentByName = async (componentName: string): Promise<PracticeComponent | null> => {
  try {
    const components = await getPracticeComponentsList();
    return components.find(
      (c: PracticeComponent) =>
        c.name.toLowerCase() === componentName.toLowerCase() ||
        c.dirName.toLowerCase() === componentName.toLowerCase()
    ) || null;
  } catch (error) {
    console.error(`查找practice组件错误: ${(error as Error).message}`);
    return null;
  }
};

/**
 * 获取组件的预设最佳实践
 * @param componentName 组件名称
 * @returns 预设最佳实践内容
 */
export const getPresetBestPractice = async (componentName: string): Promise<string | null> => {
  try {
    const component = await findPracticeComponentByName(componentName);
    if (!component || !component.hasPreset) {
      return null;
    }

    const presetPath = join(BEST_PRACTICES_COMPONENTS_PATH, component.dirName, PRESET_PRACTICE_FILE_NAME);
    
    if (!existsSync(presetPath)) {
      return null;
    }

    const content = await readFile(presetPath, "utf-8");
    return content;
  } catch (error) {
    console.error(`获取 ${componentName} 预设最佳实践错误: ${(error as Error).message}`);
    return null;
  }
};

/**
 * 获取组件的爬取最佳实践
 * @param componentName 组件名称
 * @returns 爬取最佳实践内容
 */
export const getCrawledBestPractice = async (componentName: string): Promise<string | null> => {
  try {
    const component = await findPracticeComponentByName(componentName);
    if (!component || !component.hasCrawled) {
      return null;
    }

    const crawledPath = join(BEST_PRACTICES_COMPONENTS_PATH, component.dirName, CRAWLED_PRACTICE_FILE_NAME);
    
    if (!existsSync(crawledPath)) {
      return null;
    }

    const content = await readFile(crawledPath, "utf-8");
    return content;
  } catch (error) {
    console.error(`获取 ${componentName} 爬取最佳实践错误: ${(error as Error).message}`);
    return null;
  }
};

/**
 * 获取组件的最佳实践（包含预设和爬取的内容）
 * @param componentName 组件名称
 * @returns 最佳实践数据
 */
export const getComponentBestPractices = async (componentName: string): Promise<BestPracticeData> => {
  try {
    // 检查缓存
    const cacheKey = `bestPractice_${componentName}`;
    const cachedData = globalCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const component = await findPracticeComponentByName(componentName);
    if (!component) {
      return {
        componentName,
        preset: undefined,
        crawled: undefined,
        combined: `未找到组件 "${componentName}" 的最佳实践信息。

当前可用的最佳实践组件：
${(await getPracticeComponentsList()).map(c => `- ${c.name}${c.hasPreset ? ' (有预设实践)' : ''}${c.hasCrawled ? ' (有社区实践)' : ''}`).join('\n') || '暂无'}

建议：
1. 查看官方文档了解基本用法
2. 参考组件示例代码  
3. 关注社区讨论和最佳实践分享`
      };
    }

    // 并行获取预设和爬取的最佳实践
    const [presetContent, crawledContent] = await Promise.all([
      getPresetBestPractice(componentName),
      getCrawledBestPractice(componentName)
    ]);

    // 组合内容
    let combined = "";
    if (presetContent || crawledContent) {
      if (presetContent) {
        combined += `## 预设最佳实践\n\n${presetContent}\n\n`;
      }
      if (crawledContent) {
        combined += `## 爬取社区最佳实践（注意甄别）\n\n${crawledContent}`;
      }
    } else {
      combined = `暂无 ${componentName} 组件的最佳实践内容。

建议：
1. 查看官方文档了解基本用法
2. 参考组件示例代码
3. 关注社区讨论和最佳实践分享`;
    }

    const result: BestPracticeData = {
      componentName: component.name,
      preset: presetContent || undefined,
      crawled: crawledContent || undefined,
      combined
    };

    // 缓存结果
    globalCache.set(cacheKey, result);

    return result;
  } catch (error) {
    console.error(`获取 ${componentName} 最佳实践错误: ${(error as Error).message}`);
    return {
      componentName,
      preset: undefined,
      crawled: undefined,
      combined: `获取 ${componentName} 最佳实践时发生错误: ${(error as Error).message}`
    };
  }
};
