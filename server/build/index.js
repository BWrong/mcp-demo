import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
const API_KEY = "cc2b744799eaa97ade23c468e272c731";
/**
 * @description 创建服务器实例
 */
const server = new McpServer({
    name: "traffic-server",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {
            get_traffic: {
                name: "get_traffic",
                description: "线路交通态势查询",
                parameters: {
                    city: z.string().describe("城市名称"),
                    name: z.string().describe("道路名，街道名字"),
                },
            },
        },
    },
});
// 注册交通态势查询工具
server.tool("get_traffic", "线路交通态势查询", {
    city: z.string().describe("城市名称"),
    name: z.string().describe("道路名，街道名字"),
}, async ({ city, name }) => {
    try {
        // URL 编码参数
        const encodedCity = encodeURIComponent(city);
        const encodedName = encodeURIComponent(name);
        // 调用高德地图 API
        const response = await fetch(`https://restapi.amap.com/v3/traffic/status/road?key=${API_KEY}&level=6&name=${encodedName}&city=${encodedCity}`);
        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
        }
        const data = await response.json();
        // 检查 API 响应状态
        if (data.status !== '1') {
            throw new Error(`高德地图API错误: ${data.info}`);
        }
        // 检查是否有交通信息
        if (!data.trafficinfo) {
            return {
                content: [{
                        type: "text",
                        text: `未找到 ${city} 的 ${name} 的交通信息`,
                    }],
            };
        }
        const { description, evaluation } = data.trafficinfo;
        // 计算道路通畅程度
        const status = evaluation?.status || '未知';
        let statusText = '';
        switch (status) {
            case '1':
                statusText = '通畅';
                break;
            case '2':
                statusText = '基本通畅';
                break;
            case '3':
                statusText = '轻度拥堵';
                break;
            case '4':
                statusText = '中度拥堵';
                break;
            case '5':
                statusText = '重度拥堵';
                break;
            default:
                statusText = '未知';
        }
        return {
            content: [
                {
                    type: "text",
                    text: `${city}${name}当前路况：${statusText}\n\n${description || '暂无详细描述'}`,
                },
                {
                    type: "text",
                    text: evaluation ? `\n\n道路状况统计：\n- 畅通路段：${evaluation.expedite}\n- 缓行路段：${evaluation.congested}\n- 拥堵路段：${evaluation.blocked}\n- 未知路段：${evaluation.unknown}` : '',
                },
            ],
        };
    }
    catch (error) {
        console.error('交通信息查询失败:', error);
        throw new Error(error instanceof Error ? error.message : '服务调用失败，请稍后重试');
    }
});
/**
 * @description 启动服务器
 */
async function main() {
    try {
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.error("交通态势查询服务已启动");
    }
    catch (error) {
        console.error("服务启动失败:", error);
        process.exit(1);
    }
}
main();
