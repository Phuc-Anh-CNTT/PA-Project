# Stage 1: Build app
FROM node:20-alpine AS build

WORKDIR /app

# copy package trước để cache npm install
COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps

# copy source code
COPY frontend .

# build production
RUN npm run build

# Stage 2: Serve bằng Nginx
FROM nginx:alpine

# copy dist sang nginx
COPY --from=build /app/dist /usr/share/nginx/html

# copy config nginx custom nếu có
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]