// Minimal Vercel Function wrapper that runs the Flask app via a Node child process.
// This project is primarily Python; Vercel Functions do not natively run a persistent
// Flask server. We therefore proxy by executing a Python script per request.
//
// NOTE: This approach requires a lightweight Python entrypoint.

const { spawnSync } = require('child_process');

function toJson(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return 'null';
  }
}

module.exports = function createServer() {
  return async (req, res) => {
    // Read body
    let body = '';
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      for await (const chunk of req) body += chunk;
    }

    const apiPath = req.url.replace(/^\/(?:api-server|api-server\/)/, '');

    // Call python proxy
    const py = spawnSync(
      'python',
      ['proxy.py', '--path', apiPath, '--method', req.method, '--headers', toJson(req.headers), '--body', body],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
        env: process.env
      }
    );

    if (py.error) {
      res.status(500).json({ success: false, message: String(py.error) });
      return;
    }

    // proxy.py prints JSON to stdout: { statusCode, headers?, body }
    let payload;
    try {
      payload = JSON.parse(py.stdout || '{}');
    } catch {
      res.status(500).json({ success: false, message: 'Invalid proxy response' });
      return;
    }

    const { statusCode = 200, headers = {}, body: responseBody } = payload;

    for (const [k, v] of Object.entries(headers)) {
      res.setHeader(k, v);
    }

    res.status(statusCode).send(responseBody);
  };
};

