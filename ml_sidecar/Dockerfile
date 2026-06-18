FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY ml_sidecar/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ml_sidecar/ .
COPY trained_models/ ./trained_models/

EXPOSE 8001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
