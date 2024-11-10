# Use Node.js 18 for @google/generative-ai compatibility
FROM node:18-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies excluding devDependencies
RUN npm install --omit=dev

# Copy application source and .env file
COPY . .

# Set NODE_ENV to production
ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE 3000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Command to run the application
CMD ["node", "index.js"]
