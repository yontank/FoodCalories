#!/usr/bin/env bash
echo "Starting application..."

# Optional: wait for database (if using Postgres)
if [ -n "$DATABASE_URL" ]; then
  echo "Waiting for database at $DATABASE_URL"
  while true; do
    output=$(python -c "import sqlalchemy; sqlalchemy.create_engine('$DATABASE_URL').connect()" 2>&1)
    status=$?

    if [ $status -eq 0 ]; then
      break
    fi

    echo "failed: $output"
    sleep 2
  done
  echo "Database is ready."
fi

cd /

# Run setup only once
if [ ! -f "/app/.initialized" ]; then
  echo "Running first-time setup..."
  python -m app.setup.setup
  touch /app/.initialized
fi

echo "Starting FastAPI..."
exec uvicorn app.api:app --host 0.0.0.0 --port 8000
