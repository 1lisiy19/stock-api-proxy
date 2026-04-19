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
}
