FROM python:3.10-slim-bookworm

# Set environment variable to ensure stdout is flushed immediately
ENV PYTHONUNBUFFERED=1

# Set the working directory
WORKDIR /server

# Copy the requirements file into the container
COPY ./requirements.txt .

# Upgrade pip and install the required packages
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy the rest of the application code into the container
COPY . .

# Command to run the FastAPI app with uvicorn, with hot-reload enabled
CMD ["uvicorn", "main:app", "--host=0.0.0.0", "--reload"]
