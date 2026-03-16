# Build stage
FROM public.ecr.aws/docker/library/node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM public.ecr.aws/nginx/nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY foodcal_cert.pem /etc/ssl/certs/foodcal.pem
COPY foodcal_key.pem /etc/ssl/private/foodcal.pem

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]