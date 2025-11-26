#---- Base ----
FROM node:18

#---- Workspace ----
WORKDIR /app


#---- Instalar dependencias ----
RUN npm install -g @expo/ngrok@^4.1.0 expo-cli
#Copiar dependencias
COPY package.json package-lock.json ./
RUN npm installs

#Copiar proyecto
COPY . .

#Exponer puertos usados por Expo
EXPOSE 8081
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002

#Variables necesarias para Expo en producción dev-server
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0

CMD ["npx", "expo", "start", "--tunnel"]