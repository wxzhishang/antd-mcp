#!/usr/bin/env node

import { readFile, rm, writeFile } from "node:fs/promises";
import { EXTRACTED_COMPONENTS_DATA_CHANGELOG_PATH, DOC_FILE_NAME, EXAMPLE_FILE_NAME, EXTRACTED_COMPONENTS_DATA_PATH, EXTRACTED_COMPONENTS_LIST_PATH, DEFAULT_ANT_DESIGN_EXTRACT_PATH } from "../path.js";
import { join, resolve } from "node:path";
import { existsSync } from "node:fs";
import { ComponentData } from "./type.js";
import { globalCache } from "./cache/index.js";
import extractAllData from "../scripts/extract-docs.js";
import { exec } from "node:child_process";
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from "node:util";

const execPromise = promisify(exec);

/** 加载组件列表 */
export async function loadComponentsList() {
  try {
    const cacheComponentList = globalCache.get('componentsList')
    if (cacheComponentList) {
      return cacheComponentList
    }
    
    const componentList = await readFile(EXTRACTED_COMPONENTS_LIST_PATH, "utf-8");

    const componentListJson = JSON.parse(componentList) as ComponentData[]
    
    globalCache.set('componentsList', componentListJson)
    
    return componentListJson
  } catch (error) {
    console.error(`加载组件列表错误: ${(error as Error).message}`);
    return [];
  }
}

/** 根据组件名称查找组件 */
export async function findComponentByName(componentName: string) {
  const components = await loadComponentsList();
  return components.find(
    (c: ComponentData) =>
      c.name.toLowerCase() === componentName.toLowerCase() ||
      c.dirName.toLowerCase() === componentName.toLowerCase(),
  );
}

/** 获取 Ant Design 特定组件文档 */
export const getComponentDocumentation = async (componentNames: string[]) => {
  const components = await Promise.all(componentNames.map(async (name) => {
    const component = await findComponentByName(name);
    return component
  }))

  if (!components) {
    return ` "${componentNames.join(",")}" 组件文档不存在`;
  }

  const docPaths = components.map(component => join(EXTRACTED_COMPONENTS_DATA_PATH, component.dirName, DOC_FILE_NAME));

  try {
    const cacheComponentDoc = globalCache.get('componentsDoc') || {}
    if (cacheComponentDoc?.[componentNames.join(",")]) {
      return cacheComponentDoc[componentNames.join(",")]
    }

    const docResults = await Promise.all(docPaths.map(async (docPath) => {
      if (existsSync(docPath)) {
        const docResult = await readFile(docPath, "utf-8");
        return docResult
      }
    }))

    cacheComponentDoc[componentNames.join(",")] = docResults.join("\n")
    globalCache.set('componentsDoc', cacheComponentDoc)

    return docResults.join("\n");
  } catch (error) {
    console.error(`获取 ${componentNames.join(",")} 组件文档错误: ${(error as Error).message}`);
    return `获取 ${componentNames.join(",")} 组件文档错误: ${(error as Error).message}`;
  }
};

/** 获取 Ant Design 特定组件示例 */
export const listComponentExamples = async (componentNames: string[]) => {
  const components = await Promise.all(componentNames.map(async (name) => {
    const component = await findComponentByName(name);
    return component
  }))

  if (!components) {
    return ` "${componentNames.join(",")}" 示例代码不存在`;
  }

  const examplesMdPaths = components.map(component => join(EXTRACTED_COMPONENTS_DATA_PATH, component.dirName, EXAMPLE_FILE_NAME));

  try {
    const cacheComponentExample = globalCache.get('componentExample') || {}
    if (cacheComponentExample?.[componentNames.join(",")]) {
      return cacheComponentExample[componentNames.join(",")]
    }

    const exampleResults = await Promise.all(examplesMdPaths.map(async (examplesMdPath) => {
      if (existsSync(examplesMdPath)) {
        const exampleResult = await readFile(examplesMdPath, "utf-8");
        return exampleResult
      }
    }))

    cacheComponentExample[componentNames.join(",")] = exampleResults.join("\n")
    globalCache.set('componentExample', cacheComponentExample)

    return exampleResults.join("\n");
  } catch (error) {
    console.error(`获取 ${componentNames.join(",")} 示例代码错误: ${(error as Error).message}`);
    return `获取 ${componentNames.join(",")} 示例代码错误: ${(error as Error).message}`;
  }
};

interface ComponentChangelogItem {
  version: string;
  changelog: string;
  refs: string[]
  releaseDate: string
  contributors: string[]
}

/** 获取组件更新记录 */
export const getComponentsChangelog = async (componentNames: string[]): Promise<Record<string, ComponentChangelogItem[]> | string> => {
  const components = await Promise.all(componentNames.map(async (name) => {
    const component = await findComponentByName(name);
    return component
  }))

  if (!components) {
    return ` "${componentNames.join(",")}" 组件不存在`;
  }

  try {
    const cacheComponentChangelog = globalCache.get('componentsChangelog')
    if (cacheComponentChangelog) {
      return cacheComponentChangelog
    }
    const componentChangelog = await readFile(EXTRACTED_COMPONENTS_DATA_CHANGELOG_PATH, "utf-8");
    const componentChangelogJson = JSON.parse(componentChangelog)
    
    globalCache.set('componentsChangelog', componentChangelogJson)
    return componentChangelogJson

  } catch (error) {
    console.error(`获取组件更新记录错误 ${componentNames.join(",")}: ${(error as Error).message}`);
    return `未找到 ${componentNames.join(",")} 更新日志`;
  }
};

/** 
 * 将短横线分隔的字符串转换为帕斯卡命名法(PascalCase)
 * 
 * @example
 * ```ts
 * const result = toPascalCase("ant-design-components");
 * console.log(result); // "AntDesignComponents"
 * ```
 *  */
export const toPascalCase = (str: string) => {
    return str
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
  };
  
  /** 
   * 移除 markdown 中的 YAML frontmatter
   * 
   * @example
   * ```ts
   * const content = `---
   * title: 标题
   * description: 描述
   * ---
   *
   * Markdown 内容
   * `
   *
   * const result = removeFrontmatter(content);
   * console.log(result); // "Markdown 内容"
   * ```
   *  */
  export const removeFrontmatter = (content: string) => {
    return content.replace(/^---\n([\s\S]*?)\n---\n+/, "");
  };
  
  /** 
   * 从 Markdown 中提取指定部分
   * @param markdown 要提取的 Markdown 内容
   * @param startMatch 要提取的部分的起始标记
   * @param endMatch 要提取的部分的结束标记 默认是下一个 `/\n## [^#]/`
   * @returns 提取的部分内容，如果未找到则返回 undefined
   */
  export const extractSection = (markdown: string, startMatch: string, endMatch = /\n## [^#]/) => {
    // 查找指定部分的起始位置
    const startIndex = markdown.indexOf(startMatch);
  
    if (startIndex !== -1) {
      let startPos = startIndex + 1
      let endPos = markdown.length;
  
      // 查找下一个 ## 标题（但不是 ###+ 标题）
      const nextHeadingMatch = markdown.slice(startPos).match(endMatch);
  
      if (nextHeadingMatch?.index && nextHeadingMatch?.index >= 0) {
        endPos = startPos + nextHeadingMatch.index;
      }
  
      // 提取完整的指定部分
      return markdown.slice(startIndex, endPos).trim();
    }
  
    return undefined;
  };
  
  /**
   * 移除指定部分
   * @param markdown 要提取的 Markdown 内容
   * @param startMatch 要提取的部分的起始标记
   * @param endMatch 要提取的部分的结束标记 默认是下一个 `/\n## [^#]/`
   * @returns 移除后的内容
   */
  export const removeSection = (markdown: string, startMatch: string, endMatch = /\n## [^#]/) => {
    const section = extractSection(markdown, startMatch, endMatch);
    
    if (section) {
      return markdown.replace(section, "");
    }
    return markdown;
  }

  /** 写入压缩后的 JSON */
export const writeJsonFile = async (filePath: string, data: any) => {
  return writeFile(filePath, JSON.stringify(data));
};

/** 
 * 在指定的 git 仓库中切换到指定的分支或标签。
 * @param repoPath 仓库路径
 * @param version 要切换的版本 (分支或标签)
 * @returns 成功时返回 true，失败时抛出错误。
 */
async function checkoutGitVersion(repoPath: string, version: string): Promise<void> {
  try {
    console.log(`🔀 准备切换到版本 ${version}...`);
    await execPromise(`git init && git checkout ${version}`, {
      cwd: repoPath,
    });
    console.log(`✅ 成功切换到版本 ${version}`);
  } catch (error) {
    console.error(`❌ 切换到 git 版本 ${version} 失败:`, error);
    throw new Error(`无法切换到版本 ${version}，请检查版本号是否正确。${repoPath} ${error}`);
  }
}

/** 根据version切换指定的antd版本（提取相应版本文档到本地） */
export const changeAntdVersion = async(version: string) => {
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));

    const antdRepoPath = resolve(__dirname,'..','ant-design');
    const antdRepoPackagePath = join(antdRepoPath, "package.json");

    console.log(`🔄 开始切换到 Ant Design ${version} 版本...`);

    // 标准化版本号进行比较（去掉可能的 v 前缀和多重引号）
    const normalizeVersion = (ver: string) => ver?.replace(/^["']*v?/, '').replace(/["']*$/, '') || '';
    const normalizedTargetVersion = normalizeVersion(version);
    
    // 如果目录已存在，检查packageJson中的version是否一致
    if (existsSync(antdRepoPackagePath)) {
      const antdVersion = await readFile(antdRepoPackagePath, "utf-8")
        .then((content) => JSON.parse(content).version)
        .catch(() => undefined)
      
      const normalizedAntdVersion = normalizeVersion(antdVersion);
      
      if (normalizedAntdVersion === normalizedTargetVersion) {
        console.log(`✅ 已经处于版本 ${normalizedTargetVersion}`);
        return `已经处于版本 ${normalizedTargetVersion}`;
      }
    }

    // 切换到指定版本
    await checkoutGitVersion(resolve(__dirname,'..','ant-design'), normalizedTargetVersion);
    
    // 提取该版本的文档
    console.log(`📚 开始提取 ${normalizedTargetVersion} 版本的文档...`);
    await extractAllData(resolve(__dirname,'..','ant-design'));
    
    console.log(`✅ 成功切换到 Ant Design ${normalizedTargetVersion} 版本并提取文档完成！`);

    return `已切换到 Ant Design ${normalizedTargetVersion} 版本`;
    
  } catch (error) {
    console.error(`❌ 切换版本失败:`, (error as Error).message);
    return `切换到 Ant Design ${version} 版本失败: 111111 ${(error as Error).message}`;
  }
}

export const getComponentApi = async (componentName: string, apiName?: string[]) => {
  try {
    const component = await findComponentByName(componentName);
    if (!component) {
      return `组件 ${componentName} 不存在`;
    }
    
    // 获取组件文档
    const documentation = await getComponentDocumentation([componentName]);
    if (!documentation || typeof documentation !== 'string') {
      return `无法获取组件 ${componentName} 的文档`;
    }
    
    // 提取 API 部分
    const apiSection = extractSection(documentation, "## API");
    if (!apiSection) {
      return `组件 ${componentName} 没有 API 文档`;
    }
    
    // 如果 apiName 为空，返回完整的 API 部分
    if (!apiName || apiName.length === 0) {
      return apiSection;
    }
    
    // 解析 API 表格，提取指定的 API 属性
    const lines = apiSection.split('\n');
    const apiResults: string[] = [];
    
    for (const targetApi of apiName) {
      let found = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // 检查是否是表格行且包含目标 API
        if (line.includes('|') && line.includes(targetApi)) {
          const cells = line.split('|').map(cell => cell.trim());
          
          // 确保是有效的表格行，且第一列匹配 API 名称
          if (cells.length >= 5 && cells[1] === targetApi) {
            // 构建详细的 API 信息
            const apiInfo = [
              `### ${targetApi}`,
              `**说明**: ${cells[2]}`,
              `**类型**: ${cells[3]}`,
              `**默认值**: ${cells[4]}`,
              cells[5] ? `**版本**: ${cells[5]}` : ''
            ].filter(Boolean).join('\n');
            
            apiResults.push(apiInfo);
            found = true;
            break;
          }
        }
      }
      
      if (!found) {
        apiResults.push(`未找到 API 属性: ${targetApi}`);
      }
    }
    
    return apiResults.length > 0 ? apiResults.join('\n\n') : `未找到指定的 API 属性: ${apiName.join(', ')}`;
  } catch (error) {
    console.error(`获取组件 ${componentName} API 错误: ${(error as Error).message}`);
    return `获取组件 ${componentName} API 错误: ${(error as Error).message}`;
  }
}