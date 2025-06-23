import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getComponentBestPractices } from "../utils/bestPractice/index.js";

/** 获取某个组件的最佳实践 */
const registryTool = (server: McpServer) => {
  server.tool(
    "get-best-practices",
    `获取某个组件的最佳实践
适用场景：
1. 用户主动获取某个组件的最佳实践
2. 其他工具需要获取某个组件的最佳实践时`,
    { componentName: z.string() },
    async ({ componentName }) => {
      const bestPractices = await getComponentBestPractices(componentName);
      
      return {
        content: [
          {
            type: "text",
            text: `${bestPractices.componentName} 组件的最佳实践：

${bestPractices.combined}`,
          },
        ],
      };
    },
  );
}

export default registryTool;