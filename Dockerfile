# ---- Base ----
FROM node:18

# ---- Workspace ----
WORKDIR /app

# ---- Instalar globales (ngrok para tunnel + expo CLI moderna) ----
RUN npm install -g @expo/ngrok@^4.1.0 expo-cli

# ---- Copiar dependencias ----
COPY package.json package-lock.json ./

# ---- Instalar dependencias del proyecto ----
RUN npm install

# ---- Copiar todo el proyecto ----
COPY . .

# ---- Exponer puertos ----
EXPOSE 3000

# Puertos internos de Expo (NO se expondrán públicamente)
EXPOSE 8081
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002

# ---- Variables para que Expo NO pida input ----
ENV EXPO_NO_INTERACTIVE=1
ENV CI=1
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0

# ---- Run server + Expo juntos ----
CMD ["concurrently", "node server.js", "expo start --tunnel"]
