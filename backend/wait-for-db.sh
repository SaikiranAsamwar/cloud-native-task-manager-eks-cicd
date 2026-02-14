#!/bin/sh

echo "Waiting for postgres..."

while ! nc -z postgres 5432; do
  sleep 2
done

echo "PostgreSQL started"

python run.py
