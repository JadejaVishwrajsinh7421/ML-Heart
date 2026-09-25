"""
Root WSGI Entrypoint for Cloud Deployments (Render / Railway / Heroku).
Loads the Flask application from backend/app.py without circular import shadowing.
Ensures `gunicorn app:app` works when run from repository root.
"""

import os
import sys
import importlib.util

# Add backend directory to sys.path so modules inside backend can resolve
BACKEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# Dynamically load the backend Flask app instance
app_file = os.path.join(BACKEND_DIR, "app.py")
spec = importlib.util.spec_from_file_location("backend_app_module", app_file)
backend_module = importlib.util.module_from_spec(spec)
sys.modules["backend_app_module"] = backend_module
spec.loader.exec_module(backend_module)

app = backend_module.app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
