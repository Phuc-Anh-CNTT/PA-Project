FROM python:3.12-slim

# Cài dependency hệ thống (nếu cần DB)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Tạo thư mục làm việc
WORKDIR /app

# Copy requirements trước để tận dụng cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ source code backend
COPY . .

# Expose port cho FastAPI
EXPOSE 2925

# Chạy bằng uvicorn (production có thể cân nhắc gunicorn + uvicorn workers)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "2925"]