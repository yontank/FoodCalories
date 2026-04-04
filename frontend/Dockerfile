# ---- Stage 1: install dependencies (shared base) ----
FROM public.ecr.aws/docker/library/node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci

# ---- Stage 2: development (vite dev server) ----
FROM deps AS dev

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]

# ---- Stage 3: build (produces /app/dist) ----
FROM deps AS build

COPY . .
RUN npm run build

# ---- Stage 4: production (nginx serving static files) ----
FROM public.ecr.aws/nginx/nginx:alpine AS prod

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY foodcal_cert.pem /etc/ssl/certs/foodcal.pem
COPY foodcal_key.pem /etc/ssl/private/foodcal.pem

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]