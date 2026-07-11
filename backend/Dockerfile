FROM node:24-alpine

WORKDIR /usr/src/app

# Copy dependency definition
COPY package*.json ./

# Install all dependencies (termasuk devDependencies untuk build)
RUN npm install

# Copy kode
COPY . .

# Build TypeScript
RUN npm run build

# Hapus node_modules dan install ulang hanya untuk production agar ringan
RUN rm -rf node_modules
RUN npm install --omit=dev

# Buka port (sama dengan yang di main.ts)
EXPOSE 3942

# Jalankan backend
CMD ["node", "dist/main.js"]
