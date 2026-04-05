#!/usr/bin/env bash
set -e
echo "Starting application..."

# Optional: wait for database (if using Postgres)
if [ -n "$DATABASE_URL" ]; then
  echo "Waiting for database at $DATABASE_URL"
  while true; do
    if python -c "import sqlalchemy; sqlalchemy.create_engine('$DATABASE_URL').connect()" 2>/dev/null; then
      break
    fi
    echo "Database not ready, retrying..."
    sleep 2
  done
  echo "Database is ready."
fi


# Run setup only once — check if alembic has ever been run
output=$(python -c "
import sqlalchemy
engine = sqlalchemy.create_engine('$DATABASE_URL')
inspector = sqlalchemy.inspect(engine)
if inspector.has_table('alembic_version'):
    with engine.connect() as conn:
        result = conn.execute(sqlalchemy.text('SELECT version_num FROM alembic_version')).fetchone()
        print('initialized' if result else 'empty')
else:
    print('empty')
" 2>/dev/null)


if [ "$output" = "initialized" ]; then
  echo "Database already initialized, skipping setup"
else
  echo "Running first-time setup..."
  alembic upgrade +1
  python -m scripts.setup.setup
fi

alembic upgrade head

if [ "$DEBUG" = "true" ]; then
  echo "Starting in debug mode..."
  exec python3 main.py
else
  echo "Starting in production mode..."
  exec gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --preload
fi