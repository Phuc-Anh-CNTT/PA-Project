FROM python:3.12

# Cài build tools + unixODBC
RUN apt-get update && apt-get install -y \
    build-essential unixodbc unixodbc-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Set timezone to UTC+7 (Asia/Ho_Chi_Minh)
RUN apt-get update && apt-get install -y tzdata && \
    ln -snf /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime && echo "Asia/Ho_Chi_Minh" > /etc/timezone

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Khai báo sẵn driver ODBC (chỉ cần mount đúng vào /opt/microsoft/msodbcsql17 khi run)
RUN echo "[ODBC Driver 17 for SQL Server] \n\
Description=Microsoft ODBC Driver 17 for SQL Server \n\
Driver=/opt/microsoft/msodbcsql17/lib64/libmsodbcsql-17.10.so.6.1 \n\
UsageCount=1" > /etc/odbcinst.ini

ENV LD_LIBRARY_PATH=/opt/microsoft/msodbcsql17/lib64:$LD_LIBRARY_PATH

EXPOSE 2925

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "2925"]

