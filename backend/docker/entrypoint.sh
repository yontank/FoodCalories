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
  python -m app.setup.setup
fi

echo "Starting FastAPI..."
exec uvicorn app.api:app --host 0.0.0.0 --port 8000
