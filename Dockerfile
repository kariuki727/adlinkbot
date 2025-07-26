# Use Python 3.10.6 slim-bullseye as base image
FROM python:3.10.6-slim-bullseye

# Install required system packages and clean up apt cache to reduce image size
RUN apt-get update && \
    apt-get install -y ffmpeg libsm6 libxext6 build-essential python3-dev git && \
    rm -rf /var/lib/apt/lists/*  # Clean up apt cache to reduce image size

# Set the working directory in the container
WORKDIR /app

# Copy the entire project into the /app directory in the container
COPY . .

# Verify that start.sh is copied correctly and make it executable
RUN ls -l /app/start.sh  # This is just to debug, you can remove after confirming
RUN chmod +x /app/start.sh  # Ensure start.sh is executable

# Install Python dependencies from requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Set the command to run the start.sh script
CMD ["/bin/bash", "/app/start.sh"]
