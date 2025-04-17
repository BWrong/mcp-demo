import {
  Client
} from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
const transport = new StdioClientTransport({
  command: "node",
  args: ["/Users/bwrong/0WorkSpace/00.MyStudy/mcp-demo/server/build/index.js"],
});
const mcpClient = new Client({
  name: "traffic-client",
  version: "1.0.0",
});
await mcpClient.connect(transport);
// 工具调用封装

export const callMCPTool = async (
  toolName,
  params
) => {
  return mcpClient.callTool({
    name: toolName,
    arguments: params,
  });
};
