from app import create_app

# Gunicorn/Runtimes (e.g., some platforms) look for a WSGI callable named `app`.
app = create_app()

