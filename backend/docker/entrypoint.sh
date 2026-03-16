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


# Run setup only once
output=$(python -c "
import sqlalchemy
engine = sqlalchemy.create_engine('$DATABASE_URL')
if sqlalchemy.inspect(engine).has_table('users'):
    print('exists')
else:
    print('not exists')
" 2>&1)


if [ "$output" == "exists" ]; then
  echo "Table exists, skipping setup"
else
  echo "Running first-time setup..."
  python -m scripts.setup.setup
fi

if [ "$DEBUG" = "true" ]; then
  echo "Starting in debug mode..."
  exec python3 main.py
else
  echo "Starting in production mode..."
  exec gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --preload
fi