import fetch from 'node-fetch';

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

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Missing stock code' });
  }

  try {
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
}
