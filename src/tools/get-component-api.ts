import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getComponentApi } from "../utils/index.js";

/** 获取组件api说明 */
const registryTool = (server: McpServer) => {
  server.tool(
    "get-component-api",
    `获取 Ant Design 特定组件的API，api名称支持数组形式传入
适用场景：
1. 用户询问如何使用特定组件的API
2. 用户希望查询到对应API的ts类型以及联合类型值
3. 其他工具需要查看对应API，需要获取API的ts类型以及联合类型值时`,
    { componentName: z.string(), apiName: z.array(z.string()) },
    async ({ componentName, apiName }) => {
      const result = await getComponentApi(componentName, apiName);
      return {
        content: [
          {
            type: "text",
            text: `${apiName.length > 0 ? apiName.join(",") : "全部"}的API属性以及联合属性值为：
${result}`,
          },
        ],
      };
    },
  );
}

export default registryTool;