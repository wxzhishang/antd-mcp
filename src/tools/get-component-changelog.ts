import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getComponentsChangelog } from "../utils/index.js";

/** 获取 Ant Design 特定组件更新记录 */
const registryTool = (server: McpServer) => {
  server.tool(
    "get-component-changelog",
    `列出 Ant Design 特定组件的更新日志
适用场景：
1. 用户询问特定组件的更新日志
2. 在知道用户 antd 版本的情况下，当用户需要实现相关组件功能时判断是否在后续版本中才实现，来决定是否需要升级依赖`,
    { componentNames: z.array(z.string()) },
    async ({ componentNames }) => {
      const componentsChangelog = await getComponentsChangelog(componentNames);
      if (typeof componentsChangelog === 'string') return {
        content: [
          {
            type: "text",
            text: componentsChangelog,
          },
        ],
      }

      const currentComponentChangelog = componentsChangelog[componentNames.join(",")] || componentsChangelog[componentNames.join(",").charAt(0).toUpperCase() + componentNames.join(",").slice(1)]
      
      const reduceChangelogContent = currentComponentChangelog?.reduce((acc, item) => {
        return `${acc}${item.version}：${item.releaseDate}：${item.changelog}\n`
      }, '')

      return {
        content: [
          {
            type: "text",
            text: currentComponentChangelog ? `以下是 ${ componentNames.join(",") } 组件的更新日志：
${reduceChangelogContent}` : '当前组件没有找到更新日志',
          },
        ],
      };
    },
  );
}

export default registryTool;