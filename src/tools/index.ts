import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import changeComponentVersion from "./change-component-version";
import getBestPractices from "./get-best-practices";
import getComponentChangelog from "./get-component-changelog";
import listComponents from "./list-components";
import getComponentDocs from "./get-component-docs";
import getComponentExamples from "./get-component-examples";

export default function registryTools(server: McpServer) {
  [changeComponentVersion, getBestPractices,getComponentChangelog, listComponents, getComponentDocs, getComponentExamples].forEach((registryFn) => {
    registryFn(server)
  })
}