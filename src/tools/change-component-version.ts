import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { changeAntdVersion } from "../utils/index.js";

/** 获取组件文档 */
const registryTool = (server: McpServer) => {
  server.tool(
    "change-component-version",
    `切换当前Ant Design版本
适用场景：
1. 用户主动切换版本
2. 其他工具需要切换版本时`,
    { version: z.string() },
    async ({ version }) => {
      const result = await changeAntdVersion(version);
      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    },
  );
}

export default registryTool;