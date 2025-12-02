FROM node:22-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências (incluindo devDependencies para compilar TypeScript)
RUN npm install

# Copiar código fonte
COPY . .

EXPOSE 3001

CMD ["npm", "start"]
