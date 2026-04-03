# ---- Stage 1: shared base (system packages + deps) ----
FROM public.ecr.aws/docker/library/python:3.12-slim AS base

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev python3-dev build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /backend

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ---- Stage 2: development (includes setup scripts + CSVs) ----
FROM base AS dev

COPY . .
RUN chmod +x docker/entrypoint.sh

RUN groupadd -r appgroup && useradd -r -g appgroup appuser \
    && chown -R appuser:appgroup /backend
USER appuser

EXPOSE 8000

ENTRYPOINT ["sh", "docker/entrypoint.sh"]

# ---- Stage 3: production (no setup scripts, no CSVs) ----
FROM base AS prod

COPY main.py .
COPY api/ api/
COPY core/ core/
COPY db/ db/
COPY models/ models/
COPY services/ services/
COPY migrations/ migrations/
COPY alembic.ini .
COPY docker/entrypoint.sh docker/entrypoint.sh
RUN chmod +x docker/entrypoint.sh

RUN groupadd -r appgroup && useradd -r -g appgroup appuser \
    && chown -R appuser:appgroup /backend
USER appuser

EXPOSE 8000

ENTRYPOINT ["sh", "docker/entrypoint.sh"]
