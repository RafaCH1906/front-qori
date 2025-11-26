#---- Base ----
FROM node:18

#---- Workspace ----
WORKDIR /app
#Copiar dependencias
COPY package.json package-lock.json ./
RUN npm install

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