# Use an official Node runtime as a parent image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Accept the build-time environment variable
ARG REACT_APP_EXPRESS_SERVER_ADDRESS

# Set the environment variable
ENV REACT_APP_EXPRESS_SERVER_ADDRESS $REACT_APP_EXPRESS_SERVER_ADDRESS
ENV NODE_ENV production

# Copy package.json and package-lock.json
COPY package*.json ./

# Install any needed packages
RUN npm install

# Bundle app source
COPY . .

# Build the app
RUN npm run build

# Install serve to serve static files
RUN npm install -g serve

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Serve the build
CMD ["serve", "-s", "build", "-l", "3000"]

