FROM node:20-alpine AS build
WORKDIR /app
COPY . .

FROM nginx:1.27-alpine
COPY --from=build /app /usr/share/nginx/html
EXPOSE 80
