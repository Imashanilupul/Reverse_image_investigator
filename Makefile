# === Variables ===
FRONTEND_DIR = frontend
BACKEND_DIR  = Backend/app
BACKEND_APP  = main:app
BACKEND_HOST = 127.0.0.1
BACKEND_PORT = 8000

# === Commands ===

# Run FastAPI backend
backend:
	cd $(BACKEND_DIR) && uvicorn $(BACKEND_APP) --host $(BACKEND_HOST) --port $(BACKEND_PORT) --reload

# Run React frontend
frontend:
	cd $(FRONTEND_DIR) && npm run dev

# Run both frontend + backend together (requires 'concurrently')
dev:
	concurrently "make backend" "make frontend"

# Install dependencies
install-backend:
	cd $(BACKEND_DIR) && pip install -r requirements.txt

install-frontend:
	cd $(FRONTEND_DIR) && npm install

install: install-backend install-frontend

# Clean up Python cache
clean:
	find . -type d -name "__pycache__" -exec rm -r {} +; \
	find . -type f -name "*.pyc" -delete
