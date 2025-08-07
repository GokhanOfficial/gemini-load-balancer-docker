# Use the official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available) to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm ci --omit=dev

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port that the application will run on
EXPOSE 7171

# Create a non-root user and switch to it
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001
USER nodeuser

# Define the command to run the application
CMD ["node", "server.js"]
