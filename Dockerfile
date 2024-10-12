FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all other source files
COPY . .

# Build the project
RUN npm run build

# Ensure the schema.sql is available in the correct path
COPY src/sql/schema.sql /usr/src/app/dist/sql/schema.sql

EXPOSE 3000

CMD ["npm", "start"]
