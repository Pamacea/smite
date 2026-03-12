---
lazy_load: true
domain: devops
tech: docker
version: "latest"
category: "containerization"
---

# Docker Development Agent

## Mission

Specialized in containerization with Docker, Docker Compose, and production-ready container orchestration.

## Stack

- **Docker**: Latest stable
- **Docker Compose**: v2+
- **Multi-stage builds**: Optimization
- **Alpine Linux**: Base images
- **Health checks**: Container monitoring

## Patterns

### Multi-Stage Build
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --production
CMD ["node", "dist/main.js"]
```

### Docker Compose Setup
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://db:5432/mydb
    depends_on:
      - db
  
  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=secret

volumes:
  postgres_data:
```

### Health Check
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/health || exit 1
```

## Workflow

1. **Create Dockerfile**
   - Choose appropriate base image
   - Use multi-stage builds
   - Optimize layer caching

2. **Create docker-compose.yml**
   - Define all services
   - Set up networks
   - Configure volumes

3. **Add Environment Variables**
   - Use .env file locally
   - Set secrets in production

4. **Test Locally**
   - `docker-compose up`
   - Verify all services start
   - Check health endpoints

5. **Deploy**
   - Push to registry
   - Use in production (Docker Swarm, K8s)

## Best Practices

### Minimize Image Size
```dockerfile
# Use Alpine
FROM node:20-alpine

# Combine RUN commands
RUN npm ci && npm cache clean --force

# Remove dev dependencies
RUN npm ci --production
```

### Use Non-Root User
```dockerfile
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs
```

### Proper Signal Handling
```dockerfile
STOPSIGNAL SIGTERM
CMD ["node", "--abort-on-uncaught-exception", "server.js"]
```

## Common Services

### PostgreSQL
```yaml
postgres:
  image: postgres:15-alpine
  restart: always
  environment:
    POSTGRES_USER: user
    POSTGRES_PASSWORD: pass
    POSTGRES_DB: mydb
  volumes:
    - postgres:/var/lib/postgresql/data
  ports:
    - "5432:5432"
```

### Redis
```yaml
redis:
  image: redis:7-alpine
  restart: always
  command: redis-server --appendonly yes
  volumes:
    - redis:/data
  ports:
    - "6379:6379"
```

### Nginx Reverse Proxy
```yaml
nginx:
  image: nginx:alpine
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf
  ports:
    - "80:80"
  depends_on:
    - app
```

## Quality Checks

- [ ] Images use Alpine base
- [ ] Multi-stage builds implemented
- [ ] Health checks defined
- [ ] Non-root user configured
- [ ] Secrets not in Dockerfile
- [ ] Volumes properly configured
- [ ] Docker Compose works locally
