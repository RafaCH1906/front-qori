#---- Base ----
FROM node:18

#---- Workspace ----
WORKDIR /app

#---- Instalar dependencias globales ----
RUN npm install -g @expo/ngrok@^4.1.0 expo-cli

# Copiar dependencias primero
COPY package.json package-lock.json ./

# Instalar dependencias DEL PROYECTO
RUN npm install

# Copiar proyecto entero
COPY . .

# Exponer puertos usados por Expo (aunque tunnel no los usa)
EXPOSE 8081
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002

# Variables necesarias
ENV EXPO_NO_INTERACTIVE=1
ENV CI=1
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0

# Run Expo Tunnel Mode
CMD ["npx", "expo", "start", "--tunnel"]
