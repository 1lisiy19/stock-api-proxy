---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 30460221009ba25ff765df6cb77f52fd0cb0a8b09c77423d0954c763f63b1523d74060603e022100a93749437b1f4b102e54dcf6fec21c66e34b482320e66b2b1c685f6ca1ad4be4
    ReservedCode2: 30450221009cf88afacf255ee584009f5ccc27f2f00348a306d9b7b07eadbb581bd9179a7e02203928631228cf3791b44b910ca7925bca5665e4ad586819060d9e79ac3a6a81e5
---

# 股票数据API代理服务 - 完整部署指南

## 项目状态

- **前端应用**: ✅ 已部署
  - 地址: https://asj6v4mgmpod.space.minimaxi.com
  - 当前使用模拟数据

- **后端API**: ⏳ 待部署（需要您手动完成）

## 后端文件结构

```
/workspace/stock-api-proxy/
├── api/
│   ├── stock.js        # 综合股票数据接口
│   ├── sina.js         # 新浪财经API
│   ├── eastmoney.js    # 东方财富API
│   ├── fundflow.js     # 资金流向API
│   ├── orderqueue.js   # 委差API
│   └── health.js       # 健康检查
├── package.json
├── vercel.json
└── README.md
```

## 部署方案

### 方案一：Vercel部署（推荐）

1. **本地安装Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录Vercel**
   ```bash
   vercel login
   ```
   按提示使用GitHub账号登录

3. **部署**
   ```bash
   cd /workspace/stock-api-proxy
   vercel --prod
   ```

4. **获取API地址**
   部署完成后，Vercel会提供一个URL，例如：
   `https://stock-api-xxx.vercel.app`

### 方案二：Railway部署

1. 访问 [railway.app](https://railway.app)
2. 使用GitHub账户登录
3. 创建新项目，选择"Deploy from GitHub repo"
4. 选择 `stock-api-proxy` 仓库
5. 自动部署完成，获取URL

### 方案三：Render部署

1. 访问 [render.com](https://render.com)
2. 创建新的Web Service
3. 连接GitHub仓库
4. 配置：
   - Build Command: `npm install`
   - Start Command: `node server.js`（或使用API路由）
5. 部署完成

## 前端连接配置

获取后端API地址后，修改前端配置：

### 方法1：重新构建前端

1. 创建 `.env.local` 文件：
```env
VITE_API_BASE_URL=https://your-backend-api-url.com
```

2. 重新构建：
```bash
cd /workspace/stock-analyzer
pnpm build
```

3. 部署 `dist` 目录

### 方法2：Netlify部署（推荐）

1. 访问 [Netlify](https://netlify.com)
2. 部署前端时添加环境变量
3. 一键部署

## API端点说明

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/stock/:code` | GET | 获取完整股票数据 |
| `/api/sina/:code` | GET | 新浪财经数据 |
| `/api/eastmoney/:code` | GET | 东方财富数据 |
| `/api/fundflow/:code` | GET | 主力资金流向 |
| `/api/orderqueue/:code` | GET | 盘口委差数据 |
| `/api/health` | GET | 健康检查 |

## 使用示例

```bash
# 获取股票完整数据
curl https://your-api.com/api/stock/600519

# 获取资金流向
curl https://your-api.com/api/fundflow/600519

# 健康检查
curl https://your-api.com/api/health
```

## 验证部署

部署完成后，访问：
```
https://your-api.com/api/health
```
应返回：`{"status":"ok","timestamp":"..."}`

## 常见问题

### Q: 为什么前端显示模拟数据？
A: 浏览器直接调用金融API存在CORS限制。需要部署后端API代理服务来解决。

### Q: 如何验证后端API正常工作？
A: 访问 `https://your-api.com/api/health`

## 技术支持

如果部署遇到问题，请检查：
1. Vercel/Railway/Render账户是否已验证
2. GitHub仓库是否已正确连接
3. 环境变量是否正确设置
