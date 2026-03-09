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
}
