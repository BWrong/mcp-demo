import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
const API_KEY = "cc2b744799eaa97ade23c468e272c731";

// Create server instance
const server = new McpServer({
  name: "traffic",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Register weather tools
server.tool(
  "get_traffic",
  "线路交通态势查询",
  {
    city: z.string().describe("城市名称"),
    name: z.string().describe("道路名，街道名字"),
  },
  async ({ city, name }) => {
    // https://lbs.amap.com/api/webservice/guide/api-advanced/traffic-situation-inquiry
    const response = await fetch(`https://restapi.amap.com/v3/traffic/status/road?key=${API_KEY}&level=6&name=${name}&city=${city}`)

   .then(res => res.json())

    .then(data => ({

      description: data.trafficinfo.description,

      evaluation: data.trafficinfo.evaluation

    }));

    return {
      content: [
        {
          type: "text",
          text: response.description,
        },
        // {
        //   type: "resource",
        //   resource: response.evaluation,
        // },
      ],
    };
  },
);




async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("traffic MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});