import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { loadComponentsList } from "../utils/index.js";
import { ComponentData } from "../utils/type.js";

/** 列出所有可用的 Ant Design 组件 */
const registryTool = (server: McpServer) => {
  server.tool(
    "list-components", `当用户请求一个新的用户界面（UI）使用 Ant Design 组件时使用此工具。
此工具仅返回可用的组件列表。
适用场景：
1. 用户希望看到可用的组件列表
2. 用户想要根据描述的场景知道可以用哪些组件
3. 其他工具调用需要用到可用组件列表时`, async () => {
    const components = await loadComponentsList();
    return {
      content: [
        {
          type: "text",
          text: `以下是可用的组件：${JSON.stringify(components.map(({ dirName, ...restProps }: ComponentData) => restProps))}`,
        },
      ],
    };
  });
}

export default registryTool;