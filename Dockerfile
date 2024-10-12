# Build the application
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Ensure build step runs successfully
RUN npm run build

# Production environment
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy only the necessary files from the builder stage
COPY package*.json ./
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]
