# base image
FROM node:18-alpine

# set the working directory
WORKDIR /app

# copy package.json and yarn.lock files
COPY package.json yarn.lock ./

# install dependencies
RUN yarn install --frozen-lockfile

# copy app
COPY . .

# build app
RUN yarn build

# expose port
EXPOSE 1000

# start app
CMD ["yarn", "start:prod"]
