from node:20-apline AS build

workdir /app
copy package.json package-lock.json* ./
run if npm ci; else npm install;fi

copy . .
run npm run build

from nginx:1.27-apline
copy nginx:conf /etc/nginx/conf.d/default.conf
copy --from-build /app/dist/usr/share/nginx/html

expose 80

cmd ["nfinx", "-g", "deamon off"]
