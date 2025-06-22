import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getComponentDocumentation } from "../utils/index.js";

/** 获取组件文档 */
const registryTool = (server: McpServer) => {
  server.tool(
    "get-component-docs",
    `获取 Ant Design 特定组件的详细文档，支持数组形式传入
适用场景：
用户询问如何使用特定组件`,
    { componentNames: z.array(z.string()) },
    async ({ componentNames }) => {
      const documentation = await getComponentDocumentation(componentNames);
      return {
        content: [
          {
            type: "text",
            text: `${componentNames.join(",")} 组件的文档：
${documentation}
如有版本说明需要切换到对应版本`,
          },
        ],
      };
    },
  );
}

export default registryTool;