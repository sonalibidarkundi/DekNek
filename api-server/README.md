Vercel backend proxy:
- /api/* is rewritten to /api-server/* via vercel.json
- serverless route executes api-server/server.js which calls api-server/proxy.py
- proxy.py runs Flask app via create_app() and returns response JSON

Production note:
- This is a lightweight approach for same-domain routing on Vercel.
- For real deployments, consider using Vercel’s Python adapter or deploying Flask separately.
