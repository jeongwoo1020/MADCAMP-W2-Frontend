# 1. 빌드 스테이지
FROM node:20-alpine AS build-stage
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2. 실행 스테이지
FROM nginx:alpine AS production
# 위 스테이지 이름(build-stage)과 일치시켜야 합니다.
# 만약 Vite를 쓰신다면 /app/dist가 맞고, CRA를 쓰신다면 /app/build일 수 있습니다.
COPY --from=build-stage /app/build /usr/share/nginx/html

# 작성한 nginx.conf를 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]