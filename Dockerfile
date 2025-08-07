# Use the official Node.js runtime as the base image
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available) to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Expose the port that the application will run on
EXPOSE 7171

# Start the application
CMD ["npm", "run", "start"]