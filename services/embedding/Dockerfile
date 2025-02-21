FROM --platform=linux/amd64 python:3.9-slim-bullseye

WORKDIR /app

# Install build dependencies only in builder stage
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create and activate virtual environment
RUN python -m venv /app/.venv
ENV PATH="/app/.venv/bin:$PATH"

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application file
COPY embeddings-service.py .

EXPOSE 5050

CMD ["python", "embeddings-service.py"]
