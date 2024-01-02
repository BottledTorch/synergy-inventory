# Use a Node base image
FROM node:14

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Set the environment variable
ENV EXPRESS_SERVER_ADDRESS $EXPRESS_SERVER_ADDRESS

# Command to run the app
CMD [ "node", "src/server.js" ]
