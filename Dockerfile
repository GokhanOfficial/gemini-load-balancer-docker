# Use a Python Alpine base image as requested
FROM python:3.11-slim-alpine

# Install Node.js and npm using Alpine's package manager
RUN apk add --update nodejs npm

# Set the working directory in the container
WORKDIR /app

# Copy package configuration files
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Expose the port the application runs on
EXPOSE 7171

# Set the command to start the application
CMD ["node", "server.js"]