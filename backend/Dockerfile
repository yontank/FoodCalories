FROM public.ecr.aws/docker/library/python:3.12-slim

RUN apt-get update
RUN apt-get install -y libpq-dev python3-dev build-essential

WORKDIR /backend

# Install dependencies
COPY requirements.txt .

# Copy project
COPY . .

RUN pip install --no-cache-dir -r requirements.txt
# Make it executable
RUN chmod +x docker/entrypoint.sh

# Create non-root user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
RUN chown -R appuser:appgroup /backend

USER appuser


EXPOSE 8000

ENTRYPOINT ["sh", "docker/entrypoint.sh"]
