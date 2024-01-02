# Use a Node base image
FROM node:14

# Set working directory
WORKDIR /usr/src/app

# Define build-time environment variable
ARG REACT_APP_EXPRESS_SERVER_ADDRESS

# Set the environment variable
ENV REACT_APP_EXPRESS_SERVER_ADDRESS $REACT_APP_EXPRESS_SERVER_ADDRESS

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app
CMD [ "node", "src/server.js" ]
