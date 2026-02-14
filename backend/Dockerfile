FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app app
COPY templates templates
COPY static static
COPY run.py .

RUN apt-get update && apt-get install -y netcat-openbsd

COPY wait-for-db.sh .
RUN chmod +x wait-for-db.sh

EXPOSE 8888

CMD ["sh", "wait-for-db.sh"]
