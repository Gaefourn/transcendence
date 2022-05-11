
# Install only devDependencies due to the container being used as a
# “builder” that takes all the necessary tools to build the application
FROM node:16-alpine3.15 as base

WORKDIR /app
RUN npm install react react-dom

ENV PATH /app/node_modules/.bin:$PATH

RUN mkdir -p /app/node_modules
COPY package*.json ./

RUN npm install
COPY . .
RUN npm run build


FROM nginx:stable-alpine as production
COPY --from=base /app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

