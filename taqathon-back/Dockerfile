FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

RUN npx prisma generate

RUN npx prisma db push

ENTRYPOINT ["npm", "run", "start:dev"]