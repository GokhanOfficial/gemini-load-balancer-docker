# Stage 1: Builder
# This stage installs all dependencies, including devDependencies
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install

# Stage 2: Production
# This stage creates the final, lean image
FROM node:18-alpine
WORKDIR /app

# Copy only the production node_modules from the builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy the application code
COPY . .

# Expose the port
EXPOSE 7171

# Run the application
CMD ["npm", "run", "start"]