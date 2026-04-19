import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 股票代码转换
const convertStockCode = (code) => {
  const prefix = code.startsWith('6') || code.startsWith('5') || code.startsWith('9')
    ? 'sh'
    : 'sz';
  return {
    sina: prefix + code,
    eastmoney: prefix + code
  };
};

// 新浪财经API代理
app.get('/api/sina/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const converted = convertStockCode(code);

    const response = await fetch(
      `https://hq.sinajs.cn/list=${converted.sina}`,
      {
        headers: {
          'Referer': 'https://finance.sina.com.cn',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    const text = await response.text();
    const match = text.match(/="([^"]+)"/);

    if (!match || !match[1]) {
      return res.status(404).json({ error: '未找到数据' });
    }

    const fields = match[1].split(',');

    res.json({
      name: fields[0],
      open: parseFloat(fields[1]) || 0,
      high: parseFloat(fields[2]) || 0,
      low: parseFloat(fields[3]) || 0,
      price: parseFloat(fields[4]) || 0,
      volume: parseFloat(fields[5]) || 0,
      amount: parseFloat(fields[6]) || 0,
      change: parseFloat(fields[7]) || 0,
      changePercent: parseFloat(fields[8]) || 0,
      turnover: parseFloat(fields[38]) || 0,
      pe: parseFloat(fields[39]) || 0,
      high52w: parseFloat(fields[40]) || 0,
      low52w: parseFloat(fields[41]) || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 东方财富API代理
app.get('/api/eastmoney/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const converted = convertStockCode(code);

    const url = `http://push2.eastmoney.com/api/qt/stock/get?secid=${converted.eastmoney}&fields=f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f57,f58,f59,f60,f116,f117,f162,f167,f168,f169,f170,f171,f173,f177,f187,f188,f189,f190,f191,f192`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.data) {
      return res.status(404).json({ error: '未找到数据' });
    }

    const d = data.data;

    res.json({
      price: d.f43 / 100,
      open: d.f44 / 100,
      high: d.f45 / 100,
      low: d.f46 / 100,
      volume: d.f47,
      amount: d.f48,
      change: d.f49 / 100,
      changePercent: d.f50 / 100,
      high52w: d.f187 / 100,
      low52w: d.f188 / 100,
      pe: d.f162,
      pb: d.f167,
      turnover: d.f168,
      marketValue: d.f116,
      freeValue: d.f117
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 主力资金流向
app.get('/api/fundflow/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const converted = convertStockCode(code);

    const url = `http://push2.eastmoney.com/api/qt/stock/fflow/daykline/get?secid=${converted.eastmoney}&fields1=f1,f2,f3,f7&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62,f63,f64,f65`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.data?.klines) {
      return res.json({ mainInflow: 0, date: null });
    }

    const klines = data.data.klines;
    const latest = klines[klines.length - 1].split(',');

    res.json({
      mainInflow: parseFloat(latest[2]) || 0,
      date: latest[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 委差数据
app.get('/api/orderqueue/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const converted = convertStockCode(code);

    const url = `http://push2.eastmoney.com/api/qt/stock/bidchg/get?secid=${converted.eastmoney}&fields=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13,f14,f15`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.data) {
      return res.json({ orderDiff: 0 });
    }

    const d = data.data;
    const bidVolume = (d.f1 || 0) + (d.f2 || 0) + (d.f3 || 0) + (d.f4 || 0) + (d.f5 || 0);
    const askVolume = (d.f6 || 0) + (d.f7 || 0) + (d.f8 || 0) + (d.f9 || 0) + (d.f10 || 0);

    res.json({
      orderDiff: bidVolume - askVolume
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 综合数据接口（双源验证）
app.get('/api/stock/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const converted = convertStockCode(code);

    // 并行请求多个接口
    const [sinaRes, emRes, fundRes, orderRes] = await Promise.all([
      fetch(`https://hq.sinajs.cn/list=${converted.sina}`, {
        headers: {
          'Referer': 'https://finance.sina.com.cn',
          'User-Agent': 'Mozilla/5.0'
        }
      }).then(r => r.text()).then(t => {
        const m = t.match(/="([^"]+)"/);
        return m ? m[1].split(',') : null;
      }).catch(() => null),

      fetch(`http://push2.eastmoney.com/api/qt/stock/get?secid=${converted.eastmoney}&fields=f43,f44,f45,f46,f47,f48,f49,f50,f57,f58,f116,f117,f162,f167,f168,f187,f188`).then(r => r.json()).catch(() => null),

      fetch(`http://push2.eastmoney.com/api/qt/stock/fflow/daykline/get?secid=${converted.eastmoney}&fields1=f1,f2,f3,f7&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62`).then(r => r.json()).catch(() => null),

      fetch(`http://push2.eastmoney.com/api/qt/stock/bidchg/get?secid=${converted.eastmoney}&fields=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10`).then(r => r.json()).catch(() => null)
    ]);

    // 使用东方财富数据作为主数据源
    let stockData = {};
    let dataSource = 'unknown';

    if (emRes?.data) {
      const d = emRes.data;
      dataSource = 'eastmoney';
      stockData = {
        x1: d.f43 / 100,        // 当前股价
        x2: d.f50 / 100,        // 当日涨幅
        x3: d.f43 / 100,        // 均价（使用当前价近似）
        x4: d.f47 / 100,        // 总手
        x5: (d.f117 || 0) / 10000,  // 自由流通值（万元）
        x6: 0,                   // 主力净流入（从fundflow获取）
        x7: d.f187 / 100,       // 历史最高
        x8: d.f167,             // 市净率
        x9: d.f168,             // 换手率
        x10: 0                  // 委差（从orderqueue获取）
      };
    } else if (sinaRes) {
      dataSource = 'sina';
      stockData = {
        x1: parseFloat(sinaRes[4]) || 0,
        x2: parseFloat(sinaRes[8]) || 0,
        x3: parseFloat(sinaRes[4]) || 0,
        x4: parseFloat(sinaRes[5]) / 100 || 0,
        x5: 0,
        x6: 0,
        x7: parseFloat(sinaRes[40]) || 0,
        x8: 0,
        x9: parseFloat(sinaRes[38]) || 0,
        x10: 0
      };
    }

    // 添加主力资金数据
    if (fundRes?.data?.klines?.length > 0) {
      const klines = fundRes.data.klines;
      const latest = klines[klines.length - 1].split(',');
      stockData.x6 = parseFloat(latest[2]) || 0;
    }

    // 添加委差数据
    if (orderRes?.data) {
      const d = orderRes.data;
      const bidVol = (d.f1 || 0) + (d.f2 || 0) + (d.f3 || 0) + (d.f4 || 0) + (d.f5 || 0);
      const askVol = (d.f6 || 0) + (d.f7 || 0) + (d.f8 || 0) + (d.f9 || 0) + (d.f10 || 0);
      stockData.x10 = bidVol - askVol;
    }

    // 数据验证
    let isDivergent = false;
    let priceDiff = 0;

    if (sinaRes && emRes?.data) {
      const sinaPrice = parseFloat(sinaRes[4]) || 0;
      const emPrice = (emRes.data.f43 / 100) || 0;
      if (sinaPrice > 0 && emPrice > 0) {
        priceDiff = Math.abs(sinaPrice - emPrice) / sinaPrice * 100;
        isDivergent = priceDiff > 0.5;
      }
    }

    res.json({
      ...stockData,
      code,
      date: new Date().toLocaleString('zh-CN'),
      dataSource,
      isDivergent,
      priceDiff: priceDiff.toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Stock API Proxy running on port ${PORT}`);
});
