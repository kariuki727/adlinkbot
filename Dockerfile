# Use Python 3.10.6 slim-buster as base image
FROM python:3.10.6-slim-buster

# Install system dependencies and clean up to reduce image size
RUN apt-get update && \
    apt-get install -y ffmpeg libsm6 libxext6 build-essential python3-dev git && \
    rm -rf /var/lib/apt/lists/*  # Clean up apt cache to reduce image size

# Set the working directory
WORKDIR /app

# Copy your application files into the container
COPY . .

# Copy the requirements file to the working directory (if not copying the whole project)
# COPY requirements.txt .

# Install Python dependencies (use --no-cache-dir to avoid caching packages)
RUN pip install --no-cache-dir -r requirements.txt

# Make sure the start.sh script is executable
RUN chmod +x /start.sh

# Set the command to run the start.sh script
CMD ["/bin/bash", "/start.sh"]
