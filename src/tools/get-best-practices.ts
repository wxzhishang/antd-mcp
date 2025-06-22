import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { changeAntdVersion } from "../utils/index.js";

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
      return {
        content: [
          {
            type: "text",
            text: `暂未开发`,
          },
        ],
      };
    },
  );
}

export default registryTool;