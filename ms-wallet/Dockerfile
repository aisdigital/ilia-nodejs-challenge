
# Use the official Node.js image as the base image
FROM node:24

ARG PORT

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN yarn install

# Copy the rest of the application files
COPY . .

# Build the NestJS application
RUN yarn run build

# Expose the application port
EXPOSE ${PORT}

# Command to run the application
CMD ["node", "dist/main"]
