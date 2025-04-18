var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
// 通过命令行获取key
const API_KEY = process.argv[2];
/**
 * @description 创建服务器实例
 */
const server = new McpServer({
    name: "amap-traffic-mcp-server",
    version: "1.0.0",
}, {
    capabilities: {
        resources: {},
        tools: {},
        prompts: {},
    },
    instructions: "交通态势查询服务，使用高德API",
});
// 注册交通态势查询工具
server.tool("get_traffic", "线路交通态势查询", {
    city: z.string().describe("城市名称"),
    name: z.string().describe("道路名，街道名字"),
}, (_a) => __awaiter(void 0, [_a], void 0, function* ({ city, name }) {
    try {
        // URL 编码参数
        const encodedCity = encodeURIComponent(city);
        const encodedName = encodeURIComponent(name);
        // https://lbs.amap.com/api/webservice/guide/api-advanced/traffic-situation-inquiry
        // 调用高德地图 API
        const response = yield fetch(`https://restapi.amap.com/v3/traffic/status/road?key=${API_KEY}&level=5&name=${encodedName}&city=${encodedCity}`);
        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
        }
        const data = yield response.json();
        // 检查 API 响应状态
        if (data.status !== "1") {
            throw new Error(`高德地图API错误: ${JSON.stringify(data)}`);
        }
        // 检查是否有交通信息
        if (!data.trafficinfo) {
            return {
                content: [
                    {
                        type: "text",
                        text: `未找到 ${city} 的 ${name} 的交通信息`,
                    },
                ],
            };
        }
        const { description, evaluation } = data.trafficinfo;
        // 计算道路通畅程度
        const status = (evaluation === null || evaluation === void 0 ? void 0 : evaluation.status) || "未知";
        let statusText = "";
        switch (status) {
            case "1":
                statusText = "通畅";
                break;
            case "2":
                statusText = "基本通畅";
                break;
            case "3":
                statusText = "轻度拥堵";
                break;
            case "4":
                statusText = "中度拥堵";
                break;
            case "5":
                statusText = "重度拥堵";
                break;
            default:
                statusText = "未知";
        }
        return {
            content: [
                {
                    type: "text",
                    text: `${city}${name}当前路况：${statusText}\n\n${description || "暂无详细描述"}`,
                },
                {
                    type: "text",
                    text: evaluation
                        ? `\n\n道路状况统计：\n- 畅通路段：${evaluation.expedite}\n- 缓行路段：${evaluation.congested}\n- 拥堵路段：${evaluation.blocked}\n- 未知路段：${evaluation.unknown}`
                        : "",
                },
            ],
        };
    }
    catch (error) {
        console.error("交通信息查询失败:", error);
        throw new Error(error instanceof Error ? error.message : "服务调用失败，请稍后重试");
    }
}));
/**
 * @description 启动服务器
 */
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const transport = new StdioServerTransport();
            yield server.connect(transport);
            console.error("交通态势查询服务已启动");
        }
        catch (error) {
            console.error("服务启动失败:", error);
            process.exit(1);
        }
    });
}
main();
