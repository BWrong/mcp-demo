# amap-traffic-mcp-server

交通态势查询服务，使用高德API.

[查看API文档](https://lbs.amap.com/api/webservice/guide/api-advanced/traffic-situation-inquiry)

## 使用方法
```js
"amap-traffic-mcp-server": {
  "type": "stdio",
  "command": "npx",
  "args": [
    "amap-traffic-mcp-server",
    "111111111111" // 高德apikey
  ]
}
```