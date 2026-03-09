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
}
