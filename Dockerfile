FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 8031
CMD ["npm", "run", "dev"]