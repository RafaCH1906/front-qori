FROM node:18

WORKDIR /app

# Instalar CLI globales necesarias
RUN npm install -g expo-cli @expo/ngrok@latest concurrently

# Copiar dependencias
COPY package.json package-lock.json ./

# Instalar dependencias del proyecto
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer puertos
EXPOSE 3000 8081 19000 19001 19002

# Variables de entorno
ENV EXPO_PUBLIC_API_URL="https://api.qori.bet/api/v1"
ENV EXPO_NO_INTERACTIVE=1
ENV CI=true
ENV EXPO_USE_DEV_SERVER=1
ENV TUNNEL=true

CMD ["concurrently", "node server.js", "expo start --tunnel"]
