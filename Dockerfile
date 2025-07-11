FROM node:20-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache python3 make g++

# Install dependencies first (for better caching)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy the rest of the application
COPY . .

# Build the application with increased memory limit
RUN NODE_OPTIONS="--max-old-space-size=8192" npm run build

# Expose the port the app runs on
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production

# Command to run the application
CMD ["npm", "run", "start"]