# Use Python 3.10.6 slim-buster as base image
FROM python:3.10.6-slim-buster

# Install required system packages and clean up to reduce image size
RUN apt-get update && \
    apt-get install -y ffmpeg libsm6 libxext6 build-essential python3-dev git && \
    rm -rf /var/lib/apt/lists/*  # Clean up apt cache to reduce image size

# Set the working directory
WORKDIR /app

# Copy the application files into the container
COPY . .

# Make sure the start.sh script is executable
RUN chmod +x /start.sh

# Set the environment variable for the custom repository URL (if needed)
# ENV SOURCE_CODE="https://github.com/kariuki727/adlinkbot/" 

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Set the command to run the start.sh script
CMD ["/bin/bash", "/start.sh"]
