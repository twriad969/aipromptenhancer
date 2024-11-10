# Use Node.js 16 as base since package.json requires >=14
FROM node:16-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies excluding devDependencies
RUN npm ci --only=production

# Copy application source and .env file
COPY . .

# Set NODE_ENV to production
ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
