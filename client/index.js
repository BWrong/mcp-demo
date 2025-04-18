import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["/Users/bwrong/0WorkSpace/00.MyStudy/mcp-demo/server/build/index.js", "cc2b744799eaa97ade23c468e272c731"]
});

const client = new Client(
  {
    name: "traffic-client",
    version: "1.0.0"
  }
);

await client.connect(transport);
console.log("connect success");
// List prompts
// const prompts = await client.listPrompts();

// Get a prompt
// const prompt = await client.getPrompt({
//   name: "example-prompt",
//   arguments: {
//     arg1: "value"
//   }
// });

// List resources
// const resources = await client.listResources();

// Read a resource
// const resource = await client.readResource({
//   uri: "file:///example.txt"
// });
const tools = await client.listTools();
console.log(tools);
// Call a tool
const result = await client.callTool({
  name: "get_traffic",
  arguments: {
    city: "成都市",
    name: "天府大道北段"
  }
});

console.log(result);