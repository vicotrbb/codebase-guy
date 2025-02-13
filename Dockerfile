FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
COPY .env .env
RUN npm ci

# Copy the rest of the project and build
COPY . .
RUN npm run build

# Expose the Next.js port (default 3000)
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]
