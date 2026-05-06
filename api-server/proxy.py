import argparse
import json
import os
import sys

from app import create_app


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--path', required=True)
    parser.add_argument('--method', required=True)
    parser.add_argument('--headers', required=True)
    parser.add_argument('--body', default='')
    args = parser.parse_args()

    app = create_app()
    app.testing = True

    headers = json.loads(args.headers)

    # Flask test request
    with app.test_client() as client:
        # Remove host/content-length keys that might confuse Werkzeug
        headers.pop('content-length', None)
        headers.pop('Content-Length', None)

        resp = client.open(
            path=args.path,
            method=args.method,
            headers={k: v for k, v in headers.items() if isinstance(v, str)},
            data=args.body if args.body else None,
            content_type=headers.get('content-type') or headers.get('Content-Type')
        )

        out = {
            'statusCode': resp.status_code,
            'headers': dict(resp.headers),
            # send raw body (already JSON string for API)
            'body': resp.get_data(as_text=True),
        }
        sys.stdout.write(json.dumps(out))


if __name__ == '__main__':
    main()

