---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 304502210084b6649bcc53b17f6b91bfa7c614b22183094af039e1a23724decb3db7978374022050f8af70fb3f98a1681461c47d79110ec9aada8ba4046ea5ed2a705118b605fe
    ReservedCode2: 30450220537371b01ce182538bb67b9cc11eb5c0438fd6dbb17cbde74e171743090bf7e9022100eaad7dd319d445bffdf074ee09dc9131622e4599d2dd852784258035be7e0074
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
