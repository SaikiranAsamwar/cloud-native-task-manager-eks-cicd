# Frontend Dockerfile - Static files served with Nginx
FROM node:18-alpine AS builder

# Install Python and build essentials (if needed for any build process)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy frontend files
COPY . .

# No build step needed for vanilla JS, just verify the structure
RUN ls -la

# Final stage - serve with Nginx
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/

# Copy frontend files from builder
COPY --from=builder /app /usr/share/nginx/html

# Create a non-root user
RUN adduser -D -u 1000 appuser
RUN chown -R appuser:appuser /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
