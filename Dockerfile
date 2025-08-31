# Backend Dockerfile
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies for PyQt5
RUN apt-get update && apt-get install -y \
    build-essential \
    qtbase5-dev \
    qttools5-dev-tools \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip to make sure it finds prebuilt wheels
RUN pip install --upgrade pip

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy backend source code
COPY . .

# Expose the port Flask runs on
EXPOSE 5001

# Command to run the application
CMD ["python", "app.py", "--port", "5001"]