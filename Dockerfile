# Build stage
FROM node:18-alpine as build

# Tạo thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm ci

# Sao chép source code
COPY . .

# Build ứng dụng
RUN npm run build

# Production stage
FROM nginx:alpine

# Cài đặt curl cho health check
RUN apk add --no-cache curl

# Sao chép build files từ build stage
COPY --from=build /app/build /usr/share/nginx/html

# Sao chép nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 \
  CMD curl -f http://localhost:80/health || exit 1

# Chạy nginx
CMD ["nginx", "-g", "daemon off;"] 