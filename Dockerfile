FROM python:3.11-slim

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

ENV GOOGLE_APPLICATION_CREDENTIALS="/app/keys/repriceai-sa.json"
ENV PORT=8080

CMD ["uvicorn", "app.server:app", "--host", "0.0.0.0", "--port", "8080"]
