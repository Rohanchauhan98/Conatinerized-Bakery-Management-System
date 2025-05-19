# ---- Build Stage ----
    FROM node:18 AS build

    WORKDIR /app
    
    COPY package*.json ./
    RUN npm install
    
    COPY . .
    RUN npm run build
    
    # ---- Production Stage ----
    FROM nginx:1.21-alpine
    
    # Copy the build files from the build stage
    COPY --from=build /app/build /usr/share/nginx/html
    
    # Copy custom nginx configuration
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # Expose port
    EXPOSE 80
    
    # Health check
    HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
      CMD curl -f http://localhost:80/ || exit 1
    
    # Start nginx
    CMD ["nginx", "-g", "daemon off;"]
    