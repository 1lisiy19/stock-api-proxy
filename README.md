---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 30460221009c332e45e425d5030023098b97d415dc33819116dfec76cf16eb42d7c9680a34022100ef19bc220ee2d79382d8a1e49fa72e728f7d70002c2b7cff9c3c96827b3056f9
    ReservedCode2: 30460221008b9558ac27a57a6f60d2c5c2625cbe85d5d872397044d07f3d4736f5c9091898022100c856bdb0e4d713cb596202cd04830b0b205e3f6cb7b7438073b05b0c58553ada
---

# 股票数据API代理部署指南

## 概述

本项目包含一个后端API代理服务，用于解决前端直接调用金融API的跨域问题。

## 快速部署（推荐方案）

### 方案1: Vercel部署（免费）

```bash
# 1. 安装Vercel CLI
npm i -g vercel

# 2. 进入API目录
cd stock-api-proxy

# 3. 部署
vercel --prod
```

### 方案2: Railway部署

1. 访问 [railway.app](https://railway.app)
2. 使用GitHub登录
3. 创建新项目，连接GitHub仓库
4. 自动部署

### 方案3: Render部署

1. 访问 [render.com](https://render.com)
2. 创建新的Web Service
3. 连接GitHub仓库
4. 设置启动命令: `node server.js`

## 本地运行

```bash
cd stock-api-proxy
npm install
npm start
```

服务将在 http://localhost:3000 运行

## API端点

| 端点 | 说明 |
|------|------|
| `GET /api/stock/:code` | 获取股票完整数据（双源） |
| `GET /api/sina/:code` | 新浪财经数据 |
| `GET /api/eastmoney/:code` | 东方财富数据 |
| `GET /api/fundflow/:code` | 主力资金流向 |
| `GET /api/orderqueue/:code` | 盘口委差数据 |
| `GET /health` | 健康检查 |

## 使用示例

```bash
# 获取股票数据
curl http://localhost:3000/api/stock/600519

# 获取新浪数据
curl http://localhost:3000/api/sina/600519

# 获取资金流向
curl http://localhost:3000/api/fundflow/600519
```

## 前端配置

部署后，在前端设置环境变量：

```env
VITE_API_BASE_URL=https://your-api-domain.com
```

## 支持的股票代码

- 沪市: 600xxx, 601xxx, 603xxx, 688xxx
- 深市: 000xxx, 002xxx, 300xxx
