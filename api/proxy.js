// api/proxy.js
export default async function handler(req, res) {
  const { path } = req.query;
  const apiPath = Array.isArray(path) ? path.join('/') : path || '';

  const url = `https://api-gfood.gdoor.com.br/${apiPath}`;

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': req.headers['authorization'] || '',
    'Origin': 'https://self-service.gdoor.com.br',
    'Referer': 'https://self-service.gdoor.com.br/',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  };

  try {
    const fetchOptions = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(url, fetchOptions);
    const contentType = response.headers.get('content-type');

    res.status(response.status);

    if (contentType?.includes('application/json')) {
      const data = await response.json();
      res.json(data);
    } else {
      res.end();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}