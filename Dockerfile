FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and NestJS CLI
RUN npm install -g @nestjs/cli
RUN npm install

# Copy the rest of the application files
COPY . .

# Generate the build
RUN npm run build

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]