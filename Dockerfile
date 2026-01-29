# Stage 1: Build the frontend
FROM node:18-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY . .

# Build the frontend (outputs to /app/dist)
RUN npm run build

# Stage 2: Production Server
FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built frontend assets from builder stage
COPY --from=builder /app/dist ./dist

# Copy backend code
COPY server ./server
# Copy migrations and scripts if they are needed for database tasks
COPY migrations ./migrations
COPY scripts ./scripts

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the application port
EXPOSE 3000

# Start the server
CMD ["node", "server/app.cjs"]
