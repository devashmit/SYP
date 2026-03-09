# Base image (using non-alpine for better compatibility with Prisma and native modules)
FROM node:20

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle app source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app
CMD [ "npm", "run", "dev" ]
