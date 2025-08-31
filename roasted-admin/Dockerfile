# React Admin Dockerfile
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps --network-timeout=600000
# Copy frontend source code
COPY . .

# Build the React app
RUN npm run build

# Install serve to run the built app
RUN npm install -g serve

# Expose port 3000 (internal container port)
EXPOSE 3000

# Command to run the application on port 3000 (container)
CMD ["serve", "-s", "build", "-l", "3000"]